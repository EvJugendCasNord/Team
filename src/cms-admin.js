const TYPES = {
  download: { label: 'Downloads (Flyer, Dokumente)', title: 'title', f: [{ k: 'category_id', l: 'Reiter', t: 'ref' }, { k: 'title', l: 'Titel', r: 1 }, { k: 'event_date', l: 'Datum', t: 'date' }, { k: 'description', l: 'Beschreibung', t: 'area' }, { k: 'file', l: 'Datei', t: 'file' }] },
  dl_category: { label: 'Download-Reiter (z. B. Flyer)', title: 'name', f: [{ k: 'name', l: 'Name des Reiters', r: 1 }] },
  sermon_idea: { label: 'Predigtideen', title: 'title', f: [{ k: 'topic', l: 'Thema', r: 1 }, { k: 'title', l: 'Titel', r: 1 }, { k: 'bible_ref', l: 'Bibelstelle' }, { k: 'body', l: 'Idee / Text', t: 'area' }] },
  intercession: { label: 'Fürbitten', title: 'title', f: [{ k: 'topic', l: 'Thema', r: 1 }, { k: 'title', l: 'Titel', r: 1 }, { k: 'body', l: 'Text', t: 'area', r: 1 }] },
  game: { label: 'Spiele', title: 'name', f: [{ k: 'name', l: 'Name', r: 1 }, { k: 'category', l: 'Kategorie' }, { k: 'short', l: 'Kurzbeschreibung' }, { k: 'instructions', l: 'Anleitung', t: 'area' }, { k: 'materials', l: 'Material' }, { k: 'participants', l: 'Teilnehmende (z. B. 8–20)' }, { k: 'duration', l: 'Dauer' }, { k: 'age', l: 'Alter' }, { k: 'video_url', l: 'YouTube-Link (nur echte Links, sonst leer)', t: 'url' }] }
};
async function initCms(box) {
  let key = 'download', rows = [], cats = [], edit = null;
  const T = () => TYPES[key];
  async function load() {
    try { rows = await dbList(C_CONTENT, key); cats = await dbList(C_CONTENT, 'dl_category'); }
    catch (e) { toast('Laden fehlgeschlagen: ' + e.message, true); rows = []; }
  }
  const fld = (f, v) => {
    const r = f.r ? 'required' : '', val = esc(v ?? '');
    if (f.t === 'area') return `<label>${f.l}<textarea data-k="${f.k}" rows="6" ${r}>${val}</textarea></label>`;
    if (f.t === 'ref') return `<label>${f.l}<select data-k="${f.k}"><option value="">– kein Reiter –</option>${cats.map(c => `<option value="${c.id}"${c.id === v ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>`;
    if (f.t === 'file') return `<label>${f.l}<input type="file" id="file" ${edit.id ? '' : 'required'}>${edit.file_name ? `<span class="mute">Aktuell: ${esc(edit.file_name)} (leer lassen = behalten)</span>` : ''}</label>`;
    return `<label>${f.l}<input data-k="${f.k}" type="${f.t || 'text'}" value="${val}" ${r}></label>`;
  };
  function paint() {
    box.innerHTML = `<section class="card ed"><h2>Inhalte verwalten</h2><p class="mute">Alles hier ist sofort für das ganze Team sichtbar.</p>
      <div class="chips">${Object.entries(TYPES).map(([k, t]) => `<button data-type="${k}" aria-pressed="${k === key}">${t.label}</button>`).join('')}</div>
      ${edit ? `<h3>${edit.id ? 'Bearbeiten' : 'Neu anlegen'}</h3><form id="cf">${T().f.map(f => fld(f, edit[f.k])).join('')}<button class="primary">Speichern</button> <button type="button" id="cx">Abbrechen</button></form>`
        : `<button id="nw" class="primary">+ Neu anlegen</button> <button id="sd">Beispielinhalte anlegen (nur einmal)</button><ul class="l">${rows.map(r => `<li>${esc(r[T().title])} <button data-e="${r.id}">Bearbeiten</button> <button data-d="${r.id}">Löschen</button></li>`).join('') || '<li class="mute">Noch nichts angelegt.</li>'}</ul>`}</section>`;
    box.querySelectorAll('[data-type]').forEach(b => b.onclick = async () => { key = b.dataset.type; edit = null; await load(); paint(); });
    box.querySelector('#nw')?.addEventListener('click', () => { edit = {}; paint(); });
    box.querySelector('#cx')?.addEventListener('click', () => { edit = null; paint(); });
    box.querySelector('#sd')?.addEventListener('click', async () => { if (!confirm('Beispielinhalte wirklich anlegen?')) return; try { await seedAll(); toast('Beispielinhalte angelegt.'); await load(); paint(); if (window.initLit) initLit(document.getElementById('lit')); } catch (e) { toast('Fehler: ' + e.message, true); } });
    box.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { edit = rows.find(r => r.id === b.dataset.e); paint(); });
    box.querySelectorAll('[data-d]').forEach(b => b.onclick = async () => {
      const r = rows.find(x => x.id === b.dataset.d); if (!confirm('„' + r[T().title] + '“ wirklich löschen?')) return;
      try { if (key === 'download' && r.file_id) await aw.deleteFile(r.file_id).catch(() => {}); await dbDelete(C_CONTENT, r.id); toast('Gelöscht.'); await load(); paint(); }
      catch (e) { toast('Löschen fehlgeschlagen: ' + e.message, true); }
    });
    const form = box.querySelector('#cf');
    if (form) form.onsubmit = async e => {
      e.preventDefault(); const rec = edit.id ? { ...edit } : {};
      form.querySelectorAll('[data-k]').forEach(i => rec[i.dataset.k] = i.value.trim() === '' ? null : i.value.trim());
      if (rec.video_url && !/^https:\/\//.test(rec.video_url)) return toast('Der Link muss mit https:// beginnen.', true);
      try {
        const file = form.querySelector('#file')?.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) return toast('Die Datei ist größer als 5 MB. Bitte verkleinern (z. B. PDF komprimieren).', true);
          const up = await aw.createFile(file);
          if (edit.file_id) await aw.deleteFile(edit.file_id).catch(() => {});
          rec.file_id = up.$id; rec.file_name = file.name;
        }
        if (edit.id) await dbUpdate(C_CONTENT, edit.id, key, rec); else await dbCreate(C_CONTENT, key, rec);
        toast('Gespeichert – für alle sichtbar.'); edit = null; await load(); paint();
      } catch (ex) { toast('Speichern fehlgeschlagen: ' + ex.message, true); }
    };
  }
  await load(); paint();
}
