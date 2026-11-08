# Jugend-Plattform (Appwrite-Version)
Reines HTML/JS, kein Build nötig. Backend: Appwrite Cloud (kostenlos). Die Seite spricht Appwrite direkt an, es wird keine Zusatz-Bibliothek geladen.

1. Appwrite einrichten: **APPWRITE-EINRICHTUNG.md**.
2. Online stellen mit GitHub Pages:
   - github.com → „+“ → „New repository“ → Name z. B. `jugend`, Public → Create.
   - „uploading an existing file“ → den **Inhalt** des entpackten Ordners hineinziehen (Ordner `src` mit) → Commit.
   - Settings → Pages → Branch `main`, Ordner `/ (root)` → Save. Die Adresse erscheint nach 1–2 Minuten.
   - `NAME.github.io` (ohne https://) in Appwrite als Web-Plattform eintragen.

## Anmeldung
Name + Passwort genügen. Wer sich einmal angemeldet hat, bleibt auf diesem Gerät angemeldet. Wer ein Konto hat, kann alles lesen und sich bei Aufgaben eintragen. Inhalte anlegen/ändern dürfen nur Admins.
Admin machen: `setup.html` → Konten verwalten, oder in Appwrite unter Auth → Users → Person → Labels → `admin`.

## Bearbeiten als Admin
Es gibt zwei Seiten mit dem gleichen Aufbau und der gleichen Menüleiste:
- `index.html` ist die normale Ansicht für alle (nur Lesen und Eintragen).
- `admin.html` ist die Bearbeitungsansicht. Admins kommen über den Menüpunkt **Admin** ganz rechts im Menü dorthin. Mitglieder sehen den Punkt nicht und kommen auf `admin.html` nicht weiter.

In der Bearbeitungsansicht hat auch jeder Eintrag in **Predigten, Fürbitten, Spiele und Downloads** (bei Spielen und Predigten nach dem Aufklappen) die Knöpfe **Bearbeiten** und **Löschen**. Reiter **Meeting** und **Kalender** haben „+ Neues Meeting“ sowie bei jedem Meeting **Bearbeiten** und **Löschen**. Vergangene Meetings stehen ganz unten im Reiter Meeting. Reiter **Aufgaben**: **Löschen**. Reiter **Predigten, Fürbitten, Spiele, Downloads**: unten Bereich zum Anlegen, Ändern, Löschen.

## Sonstige Aufgaben
Der Reiter **Aufgaben** zeigt Aufgaben außerhalb der Meetings, zum Beispiel Schichten beim Adventsdorf. Admins legen sie in der Bearbeitungsansicht mit **+ Neue Aufgabe** an: Titel, Schichten (eine pro Zeile) und Plätze pro Zeile. Jeder trägt sich dann selbst mit seinem Kontonamen ein. Gleicher Titel wie eine vorhandene Aufgabe: Die neuen Zeilen kommen dort dazu. Aufgaben der Meetings stehen nur noch im Reiter Meeting.

## Downloads
Der Bereich hat feste Kategorien: **Flyer, Blocktag, Konfifahrt, Andere Dokumente**. Sie werden automatisch angelegt, sobald ein Admin die Admin-Ansicht öffnet. Beim Hochladen wählt man eine Kategorie aus.

## Mitgliederliste
In der Bearbeitungsansicht gibt es den Reiter **Mitglieder**. Jedes Konto trägt sich beim ersten Öffnen der Seite selbst ein. Konten, die es schon vor dieser Funktion gab, erscheinen, sobald die Person die Seite das nächste Mal öffnet. Dafür muss `setup.html` einmal erneut ausgeführt werden (legt die Tabelle `members` an). Alle Konten siehst du außerdem in Appwrite unter Auth → Users.

## Sicherheit (bitte lesen)
- Es gibt keinen Zugangscode und keine Freischaltung: Wer die Adresse kennt, kann sich ein Konto anlegen und sieht dann alles. Gib die Adresse nur ans Team weiter.
- Aufgaben-Eintragungen: Dass nur die eigene Eintragung geändert wird, prüft die Seite, nicht der Server.
- Personenbezogene Daten: Name, Eintragungen. Datenschutz mit der Gemeinde klären; keine DSGVO-Konformität zugesichert.
