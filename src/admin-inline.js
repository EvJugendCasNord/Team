// Bearbeiten-Funktionen für Admins: erscheinen direkt in der normalen Seite (nur sichtbar, wenn man Admin ist).
const adm = { meeting: null };
const DEFAULT_TASKS = 'Begrüßung\nGebet\nBibellesung\nPredigt\nFürbitten\nTechnik\nAufbau\nAbbau';
const localInput = iso => { const d = new Date(iso), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

function adminMeetingForm() {
  const m = adm.meeting;
  if (!m) return '<p class="noprint"><button class="primary" data-mnew>+ Neues Meeting</button></p>';
  const isNew = !m.id;
  return `<form id="mf" class="card"><h2>${isNew ? 'Neues Meeting' : 'Meeting bearbeiten'}</h2>
    <label>Titel<input name="title" required value="${esc(m.title || '')}"></label>
    <label>Datum und Uhrzeit<input name="at" type="datetime-local" required value="${m.starts_at ? localInput(m.starts_at) : ''}"></label>
    <label>Prediger<input name="preacher" value="${esc(m.leaders || '')}"></label>
    <label>Beschreibung<textarea name="desc" rows="3">${esc(m.description || '')}</textarea></label>
    <label>${isNew ? 'Aufgaben (eine pro Zeile)' : 'Weitere Aufgaben hinzufügen (eine pro Zeile, leer lassen = nichts ändern)'}<textarea name="tasks" rows="${isNew ? 8 : 3}">${isNew ? DEFAULT_TASKS : ''}</textarea></label>
    <button class="primary">Speichern</button> <button type="button" data-mcancel>Abbrechen</button></form>`;
}

function adminPastMeetings() {
  const past = meetings.filter(m => new Date(m.starts_at) < new Date()).sort((a, b) => String(b.starts_at).localeCompare(a.starts_at));
  if (!past.length) return '';
  return `<section class="card noprint"><h2>Vergangene Meetings</h2><ul class="l">${past.map(m => `<li><b>${esc(m.title)}</b> <span class="mute">${fmt(m.starts_at)}</span> <button data-medit="${m.id}">Bearbeiten</button> <button data-mdel="${m.id}">Löschen</button></li>`).join('')}</ul></section>`;
}

// Hängt unter Predigten, Fürbitten, Spiele und Downloads den Bearbeiten-Bereich ein.
function adminMount(tab) {
  const keys = { predigten: ['sermon_idea'], fuerbitten: ['intercession'], spiele: ['game'], downloads: ['download', 'dl_category'] }[tab];
  if (!keys) return;
  const box = document.createElement('div'); box.id = 'cms';
  document.querySelector('main').appendChild(box);
  initCms(box, keys, refresh);
}

function adminInit() {
  root.addEventListener('click', async e => {
    const t = e.target;
    if (t.closest('[data-mnew]')) { adm.meeting = {}; render(); document.getElementById('mf')?.scrollIntoView(); return; }
    if (t.closest('[data-mcancel]')) { adm.meeting = null; render(); return; }
    const ed = t.closest('[data-medit]');
    if (ed) { adm.meeting = meetings.find(m => m.id === ed.dataset.medit) || null; if (location.hash.slice(1) !== 'meetings') location.hash = '#meetings'; render(); document.getElementById('mf')?.scrollIntoView(); return; }
    const del = t.closest('[data-mdel]');
    if (del) {
      const m = meetings.find(x => x.id === del.dataset.mdel); if (!m) return;
      if (!confirm('Meeting „' + m.title + '“ mit allen Aufgaben wirklich löschen? Das kann man nicht rückgängig machen.')) return;
      try {
        const its = (await dbList(C_TASKS, 'task')).filter(x => x.meeting_id === m.id);
        for (const x of its) await dbDelete(C_TASKS, x.id);
        await dbDelete(C_CONTENT, m.id);
        if (adm.meeting && adm.meeting.id === m.id) adm.meeting = null;
        toast('Meeting gelöscht.');
      } catch (ex) { toast('Löschen fehlgeschlagen: ' + ex.message, true); }
      await refresh(); return;
    }
    const td = t.closest('[data-tdel]');
    if (td) {
      const x = tasks.find(y => y.id === td.dataset.tdel); if (!x) return;
      if (!confirm('Aufgabe „' + x.title + '“ wirklich löschen?')) return;
      try { await dbDelete(C_TASKS, x.id); toast('Aufgabe gelöscht.'); } catch (ex) { toast('Löschen fehlgeschlagen: ' + ex.message, true); }
      await refresh();
    }
  });
  root.addEventListener('submit', async e => {
    if (e.target.id !== 'mf') return; e.preventDefault();
    const f = new FormData(e.target), old = adm.meeting || {};
    const extra = String(f.get('tasks') || '').split('\n').map(s => s.trim()).filter(Boolean);
    try {
      const data = { ...old, title: String(f.get('title')).trim(), starts_at: new Date(f.get('at')).toISOString(), leaders: String(f.get('preacher')).trim() || null, description: String(f.get('desc')).trim() || null };
      let id = old.id;
      if (id) await dbUpdate(C_CONTENT, id, 'meeting', data); else id = (await dbCreate(C_CONTENT, 'meeting', data)).$id;
      for (const title of extra) await dbCreate(C_TASKS, 'task', { meeting_id: id, title, status: 'offen', due_date: null, assignee_id: null, assignee_name: null });
    } catch (ex) { return toast('Speichern fehlgeschlagen: ' + ex.message, true); }
    adm.meeting = null; toast('Meeting gespeichert.'); await refresh();
  });
}
