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

In der Bearbeitungsansicht: Reiter **Meeting** und **Kalender** haben „+ Neues Meeting“ sowie bei jedem Meeting **Bearbeiten** und **Löschen**. Vergangene Meetings stehen ganz unten im Reiter Meeting. Reiter **Aufgaben**: **Löschen**. Reiter **Predigten, Fürbitten, Spiele, Downloads**: unten Bereich zum Anlegen, Ändern, Löschen.

## Sicherheit (bitte lesen)
- Es gibt keinen Zugangscode und keine Freischaltung: Wer die Adresse kennt, kann sich ein Konto anlegen und sieht dann alles. Gib die Adresse nur ans Team weiter.
- Aufgaben-Eintragungen: Dass nur die eigene Eintragung geändert wird, prüft die Seite, nicht der Server.
- Personenbezogene Daten: Name, Eintragungen. Datenschutz mit der Gemeinde klären; keine DSGVO-Konformität zugesichert.
