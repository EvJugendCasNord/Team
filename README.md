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

## Sicherheit (bitte lesen)
- Wer ein Konto anlegt, sieht sofort alles. Es gibt keine Freischaltung mehr. Schutz davor bietet nur der Zugangscode (`ZUGANGSCODE` in `src/config.js`, Standard 1968). Er steht im Seitenquelltext und ist ein Sichtschutz, kein echter Schutz. Gib die Adresse nur ans Team weiter und ändere den Code gelegentlich.
- Aufgaben-Eintragungen: Dass nur die eigene Eintragung geändert wird, prüft die Seite, nicht der Server.
- Personenbezogene Daten: Name, Eintragungen. Datenschutz mit der Gemeinde klären; keine DSGVO-Konformität zugesichert.
