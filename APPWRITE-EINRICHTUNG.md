# Einrichtung in 5 Schritten (ca. 10 Minuten)

Du musst in Appwrite **nichts von Hand anlegen** – keine Datenbank, keine Tabellen. Das macht die Seite `setup.html` automatisch.

**1. Hochladen:** Alle Dateien und Ordner aus diesem ZIP (auch den Ordner `src`) in dein GitHub-Repository hochladen und GitHub Pages einschalten (siehe README).

**2. Seite in Appwrite erlauben:** Appwrite → dein Projekt → **Overview** → **Add platform** → **Web** → bei Hostname `DEINNAME.github.io` eintragen (ohne `https://`, ohne Pfad) → Weiter/Create.

**3. Verbindung testen:** `https://DEINNAME.github.io/REPOSITORY/setup.html` öffnen und auf **Verbindung testen** klicken. Es muss „✔ Verbindung klappt“ erscheinen.

**4. Automatisch einrichten:**
- Appwrite → **Overview** → **Integrations** → **API keys** → **Create API key**, Name „setup“.
- Bei den **Scopes** alle Einträge unter *Database / Tables*, *Storage* und *Users* anhaken → Create → den **Secret** kopieren.
- In `setup.html` den Secret einfügen → **Einrichtung starten**. Am Ende steht „FERTIG“.
- Falls dort ein gelber Hinweis zu `DB_ID` steht: genau das in `src/config.js` ändern und neu hochladen.

**5. Dich zum Admin machen:** Auf der Hauptseite ein Konto anlegen (Name + Passwort, ggf. Zugangscode 1968). Dann in `setup.html` → **Konten verwalten** → bei deinem Namen auf **Admin** klicken.
Danach den API-Schlüssel in Appwrite **löschen** (und `setup.html` aus dem Repository).

Fertig! Alle anderen Personen legen sich einfach selbst ein Konto an (Name + Passwort). Die Anmeldung bleibt auf dem Gerät gespeichert.
Beispielinhalte (optional): als Admin im Reiter Predigten ganz unten „Beispielinhalte anlegen“ (nur einmal, der Knopf verschwindet danach).
