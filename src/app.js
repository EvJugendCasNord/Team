const root = document.getElementById('app');
let me, meetings = [], tasks = [], lits = [], sermons = [], inter = [], games = [], dcats = [], dls = [];
const mName = id => meetings.find(m => m.id === id)?.title ?? '–';
const byStr = k => (a, b) => String(a[k] ?? '').localeCompare(String(b[k] ?? ''), 'de');

async function load() {
  try {
    const [m, t, li, s, iv, g, dc, d] = await Promise.all([dbList(C_CONTENT, 'meeting'), dbList(C_TASKS, 'task'), dbList(C_CONTENT, 'liturgy'), dbList(C_CONTENT, 'sermon_idea'), dbList(C_CONTENT, 'intercession'), dbList(C_CONTENT, 'game'), dbList(C_CONTENT, 'dl_category'), dbList(C_CONTENT, 'download')]);
    meetings = m.sort(byStr('starts_at')); tasks = t.sort(byStr('_created')); lits = li.filter(l => !l.is_template);
    sermons = s.sort(byStr('topic')); inter = iv.sort(byStr('topic')); games = g.sort(byStr('name')); dcats = dc.sort(byStr('name'));
    dls = d.sort((a, b) => String(b.event_date || b._created).localeCompare(String(a.event_date || a._created)));
    return true;
  } catch (e) { toast('Daten konnten nicht geladen werden: ' + e.message, true); return false; }
}
const upcoming = () => meetings.filter(m => new Date(m.starts_at) >= new Date());
const slotHtml = t => t.assignee_id
  ? `<div class="slot"><b>${esc(t.title)}</b><span class="taken">${esc(t.assignee_name)}</span>${t.assignee_id === me.id || me.role === 'admin' ? `<button data-rel="${t.id}">Freigeben</button>` : ''}</div>`
  : `<div class="slot"><b>${esc(t.title)}</b><form class="claim" data-claim="${t.id}"><input name="n" value="${esc(me.display_name)}" maxlength="60" required aria-label="Name für ${esc(t.title)}"><button class="primary">Eintragen</button></form></div>`;

// Änderungen an einer Aufgabe: immer frisch lesen, damit nichts unbemerkt überschrieben wird.
async function changeTask(id, fn) {
  const d = await aw.getRow(C_TASKS, id), o = JSON.parse(d.data);
  fn(o); await dbUpdate(C_TASKS, id, 'task', o);
}

const views = {
  predigten: () => viewPredigten(sermons),
  fuerbitten: () => viewFuerbitten(inter),
  spiele: () => viewSpiele(games),
  downloads: () => viewDownloads(dls, dcats),
  dashboard() {
    const next = upcoming()[0], open = tasks.filter(t => t.status !== 'erledigt');
    const dl = open.filter(t => t.due_date).sort(byStr('due_date')).slice(0, 6);
    return `<div class="grid">
    <section class="card"><h2>Nächster Termin</h2>${next ? `<b>${esc(next.title)}</b><br>${fmt(next.starts_at)} <span class="badge">${esc(next.kind || 'Meeting')}</span><br><span class="mute">${esc(next.location || 'Ort noch offen')}</span>` : '<p class="mute">Noch kein Termin geplant.</p>'}</section>
    <section class="card"><h2>Offene Aufgaben</h2><ul class="l">${open.slice(0, 8).map(t => `<li>${esc(t.title)} <span class="badge">${esc(t.status)}</span><br><span class="mute">${esc(mName(t.meeting_id))} · ${t.assignee_name ? esc(t.assignee_name) : 'noch frei'}${t.due_date ? ' · bis ' + fmtDay(t.due_date) : ''}</span></li>`).join('') || '<li class="mute">Alles erledigt.</li>'}</ul></section>
    <section class="card"><h2>Meeting</h2><ul class="l">${upcoming().slice(0, 5).map(m => `<li><a href="#meetings">${esc(m.title)}</a><br><span class="mute">${fmt(m.starts_at)}</span></li>`).join('') || '<li class="mute">Keine Meetings.</li>'}</ul><p><a href="#meetings">Zum Meeting</a></p></section>
    <section class="card"><h2>Anstehende Deadlines</h2><ul class="l">${dl.map(t => `<li>${fmtDay(t.due_date)}: ${esc(t.title)}<br><span class="mute">${esc(mName(t.meeting_id))}</span></li>`).join('') || '<li class="mute">Keine Fristen.</li>'}</ul></section></div>`;
  },
  meetings() {
    return upcoming().map(m => { const lit = lits.find(l => l.meeting_id === m.id);
      return `<article class="card"><h2>${esc(m.title)}</h2><p class="mute">${fmt(m.starts_at)} · ${esc(m.location || 'Ort offen')}</p>${m.leaders ? `<p><b>Leitung:</b> ${esc(m.leaders)}</p>` : ''}${lit ? `<p><a href="#liturgie/${lit.id}"><b>Liturgie ansehen</b></a></p>` : ''}${m.description ? `<p>${esc(m.description)}</p>` : ''}${m.notes ? `<p class="mute">${esc(m.notes)}</p>` : ''}${tasks.filter(t => t.meeting_id === m.id).map(slotHtml).join('')}</article>`; }).join('') || '<p class="card mute">Noch keine Meetings. Ein Admin kann sie unter „Admin“ anlegen.</p>';
  },
  kalender() {
    const by = {}; meetings.forEach(m => (by[m.starts_at.slice(0, 7)] ??= []).push(m));
    return Object.keys(by).sort().map(k => `<section class="card"><h2>${new Date(k + '-01').toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</h2><ul class="l">${by[k].map(m => `<li><b>${fmt(m.starts_at)}</b> – <a href="#meetings">${esc(m.title)}</a> <span class="badge">${esc(m.kind || 'Meeting')}</span></li>`).join('')}</ul></section>`).join('') || '<p class="card mute">Keine Termine.</p>';
  },
  aufgaben() {
    return `<section class="card"><h2>Alle Aufgaben</h2><ul class="l">${tasks.map(t => `<li>${esc(t.title)} <span class="badge">${esc(t.status)}</span><br><span class="mute">${esc(mName(t.meeting_id))} · ${esc(t.assignee_name || 'frei')}</span>${t.assignee_id === me.id || me.role === 'admin' ? ` <select data-st="${t.id}" aria-label="Status">${['offen', 'in Bearbeitung', 'erledigt'].map(s => `<option${s === t.status ? ' selected' : ''}>${s}</option>`).join('')}</select>` : ''}</li>`).join('')}</ul></section>`;
  }
};
const tabs = [['dashboard', 'Dashboard'], ['meetings', 'Meeting'], ['kalender', 'Kalender'], ['aufgaben', 'Aufgaben'], ['predigten', 'Predigten'], ['fuerbitten', 'Fürbitten'], ['spiele', 'Spiele'], ['downloads', 'Downloads']];

async function renderLiturgy(id) {
  let L, items;
  try {
    const d = await aw.getRow(C_CONTENT, id); L = { ...JSON.parse(d.data), id: d.$id };
    items = (await dbList(C_CONTENT, 'liturgy_item')).filter(x => x.liturgy_id === id).sort((a, b) => a.position - b.position);
  } catch (e) { toast('Liturgie konnte nicht geladen werden: ' + e.message, true); return; }
  const rows = items.map(x => `<div class="lrow"><div><b>${esc(x.title)}${x.optional ? ' <span class="badge">optional</span>' : ''}</b>${x.song ? ` <span class="song">${esc(x.song)}</span>` : ''}${x.bible_ref ? `<div>${esc(x.bible_ref)}</div>` : ''}${x.body ? `<div class="body">${esc(x.body)}</div>` : ''}</div><div class="who">${esc(x.person || '')}</div></div>`).join('');
  document.querySelector('main').innerHTML = `<p class="noprint"><a href="#meetings">← Zurück</a> <button id="pr" class="primary">Drucken / als PDF speichern</button></p><article class="card lit"><h1>${esc(L.title)}</h1><p>${esc(L.parish || '')}${L.starts_at ? ' · ' + fmt(L.starts_at) : ''}</p>${L.theme ? `<h2>Thema: ${esc(L.theme)}</h2>` : ''}<div class="lrow lhead"><div>Ablauf</div><div>Wer?</div></div>${rows}${L.extra ? `<div class="body extra">${esc(L.extra)}</div>` : ''}</article>`;
  document.getElementById('pr').onclick = () => print();
}
function render() {
  const isLit = location.hash.startsWith('#liturgie/');
  const v = location.hash.slice(1) in views ? location.hash.slice(1) : 'dashboard';
  root.innerHTML = `<header><span class="logo" role="img" aria-label="Logo"></span><b>Ev. Jugend Castrop-Rauxel-Nord</b><nav aria-label="Hauptmenü">${tabs.map(([k, l]) => `<a href="#${k}"${k === v && !isLit ? ' aria-current="page"' : ''}>${l}</a>`).join('')}${me.role === 'admin' ? '<a href="./admin.html">Admin</a>' : ''}</nav><span style="flex:1"></span><span class="mute">${esc(me.display_name)}</span><button id="out">Abmelden</button></header><main>${isLit ? '<p>Lade …</p>' : views[v]()}</main>`;
  document.getElementById('out').onclick = async () => { await aw.logout(); location.reload(); };
  if (isLit) renderLiturgy(location.hash.split('/')[1]);
}
const act = async (fn, ok) => { try { await fn(); toast(ok); } catch (e) { toast(String(e.message || e), true); } await refresh(); };
root.addEventListener('submit', e => {
  const id = e.target.dataset.claim; if (!id) return; e.preventDefault();
  const name = new FormData(e.target).get('n').trim();
  act(() => changeTask(id, o => { if (o.assignee_id) throw new Error('Dieses Feld ist bereits vergeben'); o.assignee_id = me.id; o.assignee_name = name.slice(0, 60); }), 'Gespeichert – du bist eingetragen.');
});
root.addEventListener('change', e => {
  const id = e.target.dataset.st; if (!id) return;
  act(() => changeTask(id, o => { if (o.assignee_id !== me.id && me.role !== 'admin') throw new Error('Keine Berechtigung'); o.status = e.target.value; }), 'Status gespeichert.');
});
function applyFilter(c) {
  const q = (c.querySelector('[data-q]')?.value || '').toLowerCase(), t = c.dataset.t || '';
  c.querySelectorAll('.fi').forEach(i => i.hidden = !((!q || i.dataset.s.includes(q)) && (!t || i.dataset.t === t)));
}
root.addEventListener('input', e => { const c = e.target.closest('[data-filter]'); if (!c) return; if (e.target.matches('select')) c.dataset.t = e.target.value; applyFilter(c); });
root.addEventListener('click', async e => {
  const rel = e.target.closest('[data-rel]');
  if (rel) { act(() => changeTask(rel.dataset.rel, o => { if (o.assignee_id !== me.id && me.role !== 'admin') throw new Error('Nur die eingetragene Person oder ein Admin kann freigeben'); o.assignee_id = null; o.assignee_name = null; }), 'Eintrag freigegeben.'); return; }
  const chip = e.target.closest('[data-chip]');
  if (chip) { const c = chip.closest('[data-filter]'); c.dataset.t = chip.dataset.chip; c.querySelectorAll('[data-chip]').forEach(b => b.setAttribute('aria-pressed', b === chip)); applyFilter(c); return; }
  const dl = e.target.closest('[data-dl]'); if (!dl) return;
  try {
    const blob = await aw.downloadFile(dl.dataset.dl);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = dl.dataset.name || 'datei'; document.body.appendChild(a); a.click(); a.remove();
  } catch (ex) { toast('Download fehlgeschlagen: ' + ex.message, true); }
});
async function refresh() { if (await load()) render(); }
window.addEventListener('hashchange', render);
(async () => {
  me = await requireLogin(root);
  root.innerHTML = '<p class="card">Lade …</p>'; await refresh();
  setInterval(() => { if (!document.activeElement?.matches('input,textarea,select') && !location.hash.startsWith('#liturgie/')) refresh(); }, 30000);
})();
