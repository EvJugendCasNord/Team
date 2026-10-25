const uniq = (a, k) => [...new Set(a.map(x => x[k]).filter(Boolean))].sort((x, y) => x.localeCompare(y, 'de'));
const bar = (list, k, ph, all) => `<div class="bar"><input data-q type="search" placeholder="${ph}" aria-label="${ph}"><select aria-label="Filtern"><option value="">${all}</option>${uniq(list, k).map(x => `<option>${esc(x)}</option>`).join('')}</select></div>`;
const fi = (txt, topic) => `class="card fi" data-s="${esc(txt.toLowerCase())}" data-t="${esc(topic || '')}"`;
const none = t => `<p class="card mute">${t}</p>`;
const hint = 'Noch nichts vorhanden. Ein Admin kann Inhalte unter Admin → „Inhalte verwalten“ anlegen.';

function viewPredigten(S) {
  return `<details class="card" open><summary><h2>Was ist eine Predigt?</h2></summary><p>In einer Predigt wird ein Bibeltext erklärt und mit dem Leben der Zuhörenden verbunden. Im Jugendgottesdienst heißt sie oft „Input“ und dauert 5 bis 10 Minuten. Sie soll nicht belehren, sondern zum Nachdenken einladen, und sie darf ruhig persönlich sein.</p></details>
<details class="card"><summary><h2>Wie schreibe ich eine Predigt?</h2></summary><ol>
<li><b>Thema finden:</b> Was beschäftigt Jugendliche gerade? Schreib das Thema in einem Satz auf.</li>
<li><b>Bibelstelle auswählen:</b> Such einen kurzen Text, der zum Thema passt, und lies ihn mehrmals laut.</li>
<li><b>Text verstehen und einordnen:</b> Wer spricht, zu wem, in welcher Situation? Was fällt dir auf, was überrascht dich?</li>
<li><b>Bezug zum Alltag herstellen:</b> Wo begegnet dir das in Schule, Freundschaft oder Familie? Ein eigenes Beispiel wirkt mehr als eine Erklärung.</li>
<li><b>Roten Faden entwickeln:</b> Formuliere die Kernaussage in einem Satz. Alles andere dient ihr; was nicht passt, bleibt weg.</li>
<li><b>Einstieg und Schluss formulieren:</b> Starte mit einer Frage, Geschichte oder Beobachtung und ende mit einem Satz zum Mitnehmen.</li>
<li><b>Überarbeiten und laut lesen:</b> Lies die Predigt laut und stoppe die Zeit. Kürze lange Sätze und Fachwörter.</li></ol></details>
<section data-filter><h2>Predigtideen</h2>${S.length ? bar(S, 'topic', 'Predigtideen durchsuchen', 'Alle Themen') : ''}${S.map(x => `<details ${fi([x.title, x.topic, x.bible_ref, x.body].join(' '), x.topic)}><summary><b>${esc(x.title)}</b><span class="badge">${esc(x.topic)}</span>${x.bible_ref ? ' <span class="mute">' + esc(x.bible_ref) + '</span>' : ''}</summary><div class="body">${esc(x.body)}</div></details>`).join('') || none(hint)}</section>`;
}
function viewFuerbitten(F) {
  return `<details class="card" open><summary><h2>Was ist eine Fürbitte?</h2></summary><p>Eine Fürbitte ist ein Gebet für andere: Wir bitten Gott für Menschen, die wir kennen, und für Situationen, die uns beschäftigen. Im Gottesdienst werden mehrere Fürbitten hintereinander gesprochen, die Gemeinde antwortet oft gemeinsam.</p></details>
<details class="card"><summary><h2>Wie schreibe ich eine Fürbitte?</h2></summary><ol>
<li><b>Für wen oder was wird gebetet?</b> Nenne die Menschen oder die Situation, zum Beispiel „für alle, die vor Prüfungen stehen“.</li>
<li><b>Was ist das konkrete Anliegen?</b> Worum bitten wir genau: Trost, Mut, Frieden, Gesundheit?</li>
<li><b>Verständlich und respektvoll formulieren:</b> Kurze Sätze, keine Schuldzuweisungen, keine Namen ohne Erlaubnis.</li>
<li><b>Kurz und passend bleiben:</b> Zwei bis vier Sätze reichen. Eine Fürbitte pro Anliegen.</li>
<li><b>In die Gebetsgemeinschaft einbinden:</b> Schließe mit einem Satz, auf den alle antworten können, zum Beispiel „Wir bitten dich: Erhöre uns.“</li></ol></details>
<section data-filter><h2>Fertige Fürbitten</h2>${F.length ? bar(F, 'topic', 'Fürbitten durchsuchen', 'Alle Themen') : ''}${F.map(x => `<article ${fi([x.title, x.topic, x.body].join(' '), x.topic)}><b>${esc(x.title)}</b><span class="badge">${esc(x.topic)}</span><div class="body">${esc(x.body)}</div></article>`).join('') || none(hint)}</section>`;
}
function viewSpiele(G) {
  const row = (l, v) => v ? `<div><b>${l}:</b> ${esc(v)}</div>` : '';
  return `<section data-filter><h2>Pädagogische Spiele</h2>${G.length ? bar(G, 'category', 'Spiele durchsuchen', 'Alle Kategorien') : ''}${G.map(x => `<details ${fi([x.name, x.category, x.short, x.instructions, x.materials].join(' '), x.category)}><summary><b>${esc(x.name)}</b>${x.category ? `<span class="badge">${esc(x.category)}</span>` : ''}</summary><div class="facts"><div>${esc(x.short)}</div>${row('Material', x.materials)}${row('Teilnehmende', x.participants)}${row('Dauer', x.duration)}${row('Alter', x.age)}${x.instructions ? `<div><b>Anleitung:</b><div class="body">${esc(x.instructions)}</div></div>` : ''}<div>${/^https:\/\//.test(x.video_url || '') ? `<a href="${esc(x.video_url)}" target="_blank" rel="noopener noreferrer">Video-Tutorial öffnen</a>` : '<span class="mute">Kein Video vorhanden</span>'}</div></div></details>`).join('') || none(hint)}</section>`;
}
function viewDownloads(D, C) {
  const name = id => C.find(c => c.id === id)?.name || '';
  return `<section data-filter><h2>Downloads</h2>${C.length ? `<div class="chips" role="group" aria-label="Reiter"><button data-chip="" aria-pressed="true">Alle</button>${C.map(c => `<button data-chip="${esc(c.name)}" aria-pressed="false">${esc(c.name)}</button>`).join('')}</div>` : ''}${D.map(x => `<article ${fi([x.title, x.description].join(' '), name(x.category_id))}><b>${esc(x.title)}</b> ${name(x.category_id) ? `<span class="badge">${esc(name(x.category_id))}</span>` : ''}<div class="mute">${x.event_date ? fmtDay(x.event_date) : ''}</div>${x.description ? `<div class="body">${esc(x.description)}</div>` : ''}<p><button class="primary" data-dl="${esc(x.file_id)}" data-name="${esc(x.file_name || '')}">Herunterladen</button></p></article>`).join('') || none(hint)}</section>`;
}
