async function initLit(box) {
  let cur = null, items = [], removed = [], all = [], mts = [];
  const opts = (a, f) => a.map(x => `<option value="${x.id}">${esc(f(x))}</option>`).join('');
  const pos = (a, b) => a.position - b.position;
  async function draw() {
    try { all = await dbList(C_CONTENT, 'liturgy'); mts = (await dbList(C_CONTENT, 'meeting')).sort((a, b) => String(a.starts_at).localeCompare(b.starts_at)); }
    catch (e) { toast('Liturgien konnten nicht geladen werden: ' + e.message, true); return; }
    const tpl = all.filter(x => x.is_template);
    box.innerHTML = `<section class="card"><h2>Liturgie aus Vorlage erstellen</h2>${tpl.length ? `
      <label>Vorlage<select id="src">${opts(tpl, x => x.title)}</select></label>
      <label>Für Meeting<select id="mt">${opts(mts, x => x.title + ' (' + new Date(x.starts_at).toLocaleDateString('de-DE') + ')')}</select></label>
      <button id="mk" class="primary">Liturgie erstellen</button>` : '<p class="mute">Noch keine Vorlage vorhanden. Lege unten unter „Inhalte verwalten“ die Beispielinhalte an.</p>'}</section>
      <section class="card ed"><h2>Liturgie bearbeiten</h2><label>Welche?<select id="pick"><option value="">– auswählen –</option>${opts(all, x => (x.is_template ? '[Vorlage] ' : '') + x.title)}</select></label><div id="edit"></div></section>`;
    box.querySelector('#mk')?.addEventListener('click', async () => {
      const src = all.find(x => x.id === box.querySelector('#src').value), mt = mts.find(x => x.id === box.querySelector('#mt').value);
      if (!mt) return toast('Bitte zuerst ein Meeting anlegen.', true);
      try {
        const nl = await dbCreate(C_CONTENT, 'liturgy', { title: mt.title, theme: src.theme || null, parish: src.parish || null, starts_at: mt.starts_at, meeting_id: mt.id, extra: src.extra || null, is_template: false });
        const its = (await dbList(C_CONTENT, 'liturgy_item')).filter(x => x.liturgy_id === src.id).sort(pos);
        for (const x of its) await dbCreate(C_CONTENT, 'liturgy_item', { ...x, liturgy_id: nl.$id, person: null });
        toast('Liturgie erstellt – jetzt unten bearbeiten.'); await draw(); box.querySelector('#pick').value = nl.$id; open(nl.$id);
      } catch (e) { toast('Fehler: ' + e.message, true); }
    });
    box.querySelector('#pick').onchange = e => e.target.value && open(e.target.value);
  }
  async function open(id) {
    try { cur = all.find(x => x.id === id); items = (await dbList(C_CONTENT, 'liturgy_item')).filter(x => x.liturgy_id === id).sort(pos); removed = []; paint(); }
    catch (e) { toast('Laden fehlgeschlagen: ' + e.message, true); }
  }
  const fld = (k, lbl, v, area) => `<label>${lbl}${area ? `<textarea data-k="${k}" rows="3">${esc(v)}</textarea>` : `<input data-k="${k}" value="${esc(v)}">`}</label>`;
  function paint() {
    const e = box.querySelector('#edit');
    e.innerHTML = `${fld('title', 'Name des Gottesdienstes', cur.title)}${fld('theme', 'Thema', cur.theme ?? '')}${fld('parish', 'Gemeinde', cur.parish ?? '')}
      <label><input type="checkbox" id="tpl" ${cur.is_template ? 'checked' : ''} style="width:auto"> Ist eine wiederverwendbare Vorlage</label>
      ${items.map((x, n) => `<div class="row" data-n="${n}"><b>${n + 1}.</b> <button data-a="up">↑</button> <button data-a="dn">↓</button> <button data-a="rm">Entfernen</button>
        <div class="two">${fld('title', 'Titel', x.title)}${fld('person', 'Wer?', x.person ?? '')}${fld('song', 'Liedtitel', x.song ?? '')}${fld('bible_ref', 'Bibelstelle', x.bible_ref ?? '')}</div>
        ${fld('body', 'Text / Beschreibung', x.body ?? '', 1)}<label><input type="checkbox" data-k="optional" ${x.optional ? 'checked' : ''} style="width:auto"> Optional</label></div>`).join('')}
      ${fld('extra', 'Zusätzliche Angaben (Technik, Café, Aktionen …)', cur.extra ?? '', 1)}
      <button id="add">+ Element hinzufügen</button> <button id="save" class="primary">Alles speichern</button>`;
    e.querySelector('#add').onclick = () => { sync(); items.push({ title: 'Neues Element', optional: false }); paint(); };
    e.querySelector('#save').onclick = save;
    e.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      sync(); const n = +b.closest('.row').dataset.n, a = b.dataset.a;
      if (a === 'rm') { if (items[n].id) removed.push(items[n].id); items.splice(n, 1); }
      else { const t = n + (a === 'up' ? -1 : 1); if (t >= 0 && t < items.length) [items[n], items[t]] = [items[t], items[n]]; }
      paint();
    });
  }
  function sync() {
    const e = box.querySelector('#edit');
    e.querySelectorAll(':scope > label [data-k]').forEach(i => cur[i.dataset.k] = i.value);
    cur.is_template = e.querySelector('#tpl').checked;
    e.querySelectorAll('.row').forEach(r => r.querySelectorAll('[data-k]').forEach(i => items[+r.dataset.n][i.dataset.k] = i.type === 'checkbox' ? i.checked : i.value));
  }
  async function save() {
    sync(); if (!cur.title.trim()) return toast('Bitte einen Namen eintragen.', true);
    try {
      await dbUpdate(C_CONTENT, cur.id, 'liturgy', { ...cur, theme: cur.theme || null, parish: cur.parish || null, extra: cur.extra || null });
      for (const id of removed) await dbDelete(C_CONTENT, id);
      for (let n = 0; n < items.length; n++) {
        const x = items[n], o = { liturgy_id: cur.id, position: n + 1, title: x.title || 'Element', body: x.body || null, song: x.song || null, bible_ref: x.bible_ref || null, person: x.person || null, optional: !!x.optional };
        if (x.id) await dbUpdate(C_CONTENT, x.id, 'liturgy_item', o); else await dbCreate(C_CONTENT, 'liturgy_item', o);
      }
      toast('Liturgie gespeichert.'); const id = cur.id; await draw(); box.querySelector('#pick').value = id; open(id);
    } catch (e) { toast('Speichern fehlgeschlagen: ' + e.message, true); }
  }
  await draw();
}
