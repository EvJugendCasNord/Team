// Legt Beispielinhalte an (Predigtideen, Fürbitten, Spiele). Nur einmal ausführen.
async function seedAll() {
  const mk = (k, o) => dbCreate(C_CONTENT, k, o);
  for (const x of [
    ['Ruhe finden', 'Wenn alles zu viel wird', 'Matthäus 11,28–30', 'Schule, Termine, Erwartungen: Viele fühlen sich „beladen“. Jesus lädt nicht zu noch mehr Leistung ein, sondern zum Ausruhen. Frage: Was würdest du gern abgeben?'],
    ['Vertrauen', 'Mitten im Sturm', 'Matthäus 14,22–33', 'Petrus geht aufs Wasser, solange er auf Jesus schaut, und sinkt, als er auf die Wellen schaut. Frage: Worauf richtest du deinen Blick, wenn es stürmt?'],
    ['Gemeinschaft', 'Alle gehören dazu', '1. Korinther 12,12–27', 'Ein Körper hat viele Teile, und kein Teil ist unwichtig. Frage: Welche Gabe bringst du in die Gruppe ein?']]) await mk('sermon_idea', { topic: x[0], title: x[1], bible_ref: x[2], body: x[3] });
  for (const x of [
    ['Frieden', 'Für den Frieden', 'Guter Gott, wir bitten dich für alle Menschen, die unter Krieg und Streit leiden. Schenke Frieden – in der Welt und dort, wo wir selbst Streit haben.'],
    ['Schule und Zukunft', 'Für Schule und Zukunft', 'Guter Gott, wir bitten dich für alle, die vor Prüfungen oder großen Entscheidungen stehen. Gib ihnen Ruhe, Mut und Menschen, die sie unterstützen.'],
    ['Gemeinschaft', 'Für unsere Gruppe', 'Guter Gott, wir bitten dich für unsere Gemeinschaft. Hilf uns, offen füreinander zu sein und niemanden auszuschließen.']]) await mk('intercession', { topic: x[0], title: x[1], body: x[2] });
  await mk('game', { name: 'Namensball', category: 'Kennenlernen', short: 'Ein Ball wandert durch den Kreis, jeder nennt dabei Namen.', instructions: 'Alle stehen im Kreis. Wer den Ball hat, ruft den Namen einer Person und wirft ihr den Ball zu. Die Reihenfolge wird mehrmals wiederholt, später mit mehreren Bällen.', materials: 'Weiche Bälle', participants: '8–25', duration: '10 Min.', age: 'ab 10', video_url: null });
  await mk('game', { name: 'Menschlicher Knoten', category: 'Teamspiel', short: 'Eine verknotete Gruppe löst sich ohne Loslassen.', instructions: 'Alle stehen eng im Kreis und greifen mit jeder Hand eine andere Hand (nicht die der Nachbarn). Ohne Loslassen wird der Knoten entwirrt.', materials: 'Keine', participants: '8–14', duration: '10 Min.', age: 'ab 10', video_url: null });
}
