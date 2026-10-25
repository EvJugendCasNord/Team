if (APPWRITE_PROJECT.includes('DEIN')) throw new Error('src/config.js ist noch nicht ausgefüllt');
// Kleiner eigener Appwrite-Client (ohne Zusatz-Bibliothek, direkt über fetch). Dadurch gibt es keine Versionsprobleme mehr.
const _ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }, del: k => { try { localStorage.removeItem(k); } catch (e) {} } };
let _fbMem = '';
async function awFetch(method, path, { query = [], body, form, blob } = {}) {
  const headers = { 'X-Appwrite-Project': APPWRITE_PROJECT };
  const fb = _ls.get('cookieFallback') || _fbMem; if (fb) headers['X-Fallback-Cookies'] = fb;
  const qs = query.map(q => 'queries[]=' + encodeURIComponent(JSON.stringify(q))).join('&');
  const init = { method, headers, credentials: 'include' };
  if (form) init.body = form; else if (body !== undefined) { headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(body); }
  let r;
  try { r = await fetch(APPWRITE_ENDPOINT + path + (qs ? '?' + qs : ''), init); }
  catch (e) { const err = new Error('Keine Verbindung zu Appwrite. Prüfe das Internet und ob die Adresse „' + location.hostname + '“ in Appwrite unter Overview → Add platform → Web eingetragen ist.'); err.status = 0; throw err; }
  const nf = r.headers.get('X-Fallback-Cookies'); if (nf) { _fbMem = nf; _ls.set('cookieFallback', nf); }
  if (!r.ok) { const j = await r.json().catch(() => ({})); const err = new Error(j.message || ('Fehler ' + r.status)); err.status = r.status; err.type = j.type; throw err; }
  if (blob) return r.blob();
  const t = await r.text(); return t ? JSON.parse(t) : {};
}
const _tb = t => `/tablesdb/${DB_ID}/tables/${t}/rows`;
const aw = {
  signup: (email, password, name) => awFetch('POST', '/account', { body: { userId: 'unique()', email, password, name } }),
  login: (email, password) => awFetch('POST', '/account/sessions/email', { body: { email, password } }),
  logout: async () => { try { await awFetch('DELETE', '/account/sessions/current'); } finally { _ls.del('cookieFallback'); _fbMem = ''; } },
  listRows: (t, queries) => awFetch('GET', _tb(t), { query: queries }),
  getRow: (t, id) => awFetch('GET', _tb(t) + '/' + id),
  createRow: (t, id, data) => awFetch('POST', _tb(t), { body: { rowId: id, data } }),
  updateRow: (t, id, data) => awFetch('PATCH', _tb(t) + '/' + id, { body: { data } }),
  deleteRow: (t, id) => awFetch('DELETE', _tb(t) + '/' + id),
  createFile: file => { const f = new FormData(); f.append('fileId', 'unique()'); f.append('file', file); return awFetch('POST', `/storage/buckets/${BUCKET}/files`, { form: f }); },
  deleteFile: id => awFetch('DELETE', `/storage/buckets/${BUCKET}/files/${id}`),
  downloadFile: id => awFetch('GET', `/storage/buckets/${BUCKET}/files/${id}/download`, { blob: true })
};
const strip = ({ id, _created, ...rest }) => rest;
async function dbList(coll, rtype) {
  const out = []; let cursor = null;
  for (;;) {
    const q = [{ method: 'equal', attribute: 'rtype', values: [rtype] }, { method: 'limit', values: [100] }]; if (cursor) q.push({ method: 'cursorAfter', values: [cursor] });
    const r = await aw.listRows(coll, q);
    out.push(...r.rows); if (r.rows.length < 100) break; cursor = r.rows[r.rows.length - 1].$id;
  }
  return out.map(d => ({ ...JSON.parse(d.data || '{}'), id: d.$id, _created: d.$createdAt }));
}
const dbCreate = (coll, rtype, obj) => aw.createRow(coll, 'unique()', { rtype, data: JSON.stringify(strip(obj)) });
const dbUpdate = (coll, id, rtype, obj) => aw.updateRow(coll, id, { rtype, data: JSON.stringify(strip(obj)) });
const dbDelete = (coll, id) => aw.deleteRow(coll, id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = d => new Date(d).toLocaleString('de-DE', { weekday:'short', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
const fmtDay = d => new Date(d + 'T00:00').toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'2-digit', year:'numeric' });
function toast(msg, bad) {
  const t = document.getElementById('toast'); t.textContent = msg; t.className = 'show' + (bad ? ' bad' : '');
  clearTimeout(toast.h); toast.h = setTimeout(() => t.className = '', 3500);
}
async function currentUser() {
  try { const u = await awFetch('GET', '/account'), L = u.labels || [];
    return { id: u.$id, email: u.email, display_name: u.name || u.email, role: L.includes('admin') ? 'admin' : 'member' };
  } catch (e) { if (e.status === 401) return null; throw e; }
}
// Es werden keine echten E-Mail-Adressen gespeichert: Aus dem Namen wird intern eine Anmelde-Kennung gebaut.
function toLoginMail(name) {
  const s = String(name).trim().toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '').slice(0, 60);
  if (!s) throw new Error('Bitte einen Namen mit Buchstaben oder Zahlen eingeben.');
  return s + '@jugend.example.com';
}
function friendly(e) {
  const m = String(e.message || e);
  if (/invalid credentials/i.test(m)) return 'Name oder Passwort stimmt nicht.';
  if (/already exists/i.test(m)) return 'Diesen Namen gibt es schon. Melde dich an oder nimm zum Beispiel Vor- und Nachname.';
  if (e.status === 429 || /rate limit/i.test(m)) return 'Zu viele Versuche. Bitte warte ein paar Minuten und probiere es dann nochmal.';
  if (/password/i.test(m)) return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
  return m;
}
function gate(box) {
  return new Promise(res => {
    if (!ZUGANGSCODE) return res();
    const ok = () => { try { return localStorage.getItem('zugang_ok') === ZUGANGSCODE; } catch (e) { return window.__zugang === true; } };
    if (ok()) return res();
    box.innerHTML = `<form id="g" class="card login"><span class="logo" role="img" aria-label="Logo"></span><h1>Evangelische Jugend<br>Castrop-Rauxel-Nord</h1><label>Zugangscode<input name="c" required inputmode="numeric" autocomplete="off" autofocus></label><button class="primary">Weiter</button><p id="err" class="err" role="alert"></p></form>`;
    box.querySelector('#g').onsubmit = e => {
      e.preventDefault();
      if (String(new FormData(e.target).get('c')).trim() === ZUGANGSCODE) { try { localStorage.setItem('zugang_ok', ZUGANGSCODE); } catch (x) {} window.__zugang = true; res(); }
      else box.querySelector('#err').textContent = 'Der Zugangscode ist falsch.';
    };
    window.__bootDone = true;
  });
}
async function requireLogin(box) {
  await gate(box);
  let u = null;
  try { u = await currentUser(); } catch (e) { box.innerHTML = `<div class="card login"><h1>Keine Verbindung</h1><p class="err">${esc(e.message)}</p></div>`; window.__bootDone = true; return new Promise(() => {}); }
  if (u) { window.__bootDone = true; return u; }
  return new Promise(resolve => {
    let signup = false;
    const draw = () => {
      box.innerHTML = `<form id="f" class="card login"><span class="logo" role="img" aria-label="Logo"></span><h1>Evangelische Jugend<br>Castrop-Rauxel-Nord</h1>
      <label>${signup ? 'Dein Name (damit meldest du dich später an)' : 'Dein Name'}<input name="name" required maxlength="60" autocomplete="username"></label>
      <label>Passwort${signup ? ' (mindestens 8 Zeichen)' : ''}<input name="pw" type="password" required minlength="8" autocomplete="${signup ? 'new-password' : 'current-password'}"></label>
      <button class="primary">${signup ? 'Konto anlegen' : 'Anmelden'}</button>
      <button type="button" class="link" id="sw">${signup ? 'Ich habe schon ein Konto' : 'Neu hier? Konto anlegen'}</button><p class="mute">Du bleibst auf diesem Gerät angemeldet.</p><p id="err" class="err" role="alert"></p></form>`;
      box.querySelector('#sw').onclick = () => { signup = !signup; draw(); };
      box.querySelector('#f').onsubmit = async e => {
        e.preventDefault(); const f = new FormData(e.target), err = box.querySelector('#err'); err.textContent = '';
        try {
          const mail = toLoginMail(f.get('name'));
          if (signup) await aw.signup(mail, f.get('pw'), String(f.get('name')).trim());
          await aw.login(mail, f.get('pw'));
          const n = await currentUser(); window.__bootDone = true; resolve(n);
        } catch (ex) { err.textContent = friendly(ex); }
      };
    };
    draw(); window.__bootDone = true;
  });
}

// Gemeinsamer Kopfbereich für Hauptseite und Admin-Seite. prefix = '' auf der Hauptseite, './index.html' auf der Admin-Seite.
const tabs = [['dashboard', 'Dashboard'], ['meetings', 'Meeting'], ['kalender', 'Kalender'], ['aufgaben', 'Aufgaben'], ['predigten', 'Predigten'], ['fuerbitten', 'Fürbitten'], ['spiele', 'Spiele'], ['downloads', 'Downloads']];
function siteHeader(me, active, prefix = '') {
  return `<header><span class="logo" role="img" aria-label="Logo"></span><b>Ev. Jugend Castrop-Rauxel-Nord</b><nav aria-label="Hauptmenü">${tabs.map(([k, l]) => `<a href="${prefix}#${k}"${k === active ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav><span style="flex:1"></span>${me.role === 'admin' ? '<span class="badge">Admin</span>' : ''}<span class="mute">${esc(me.display_name)}</span><button id="out">Abmelden</button></header>`;
}
