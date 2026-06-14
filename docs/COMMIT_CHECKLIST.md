<!-- docs/COMMIT_CHECKLIST.md -->

# Commit- und Prüf-Checkliste – Food Inventory

Stand: 2026-06-13 – nach Block 251

## Zweck

Diese Checkliste dient als kurzer Standardablauf vor Commits, Pushes und längeren Arbeitsunterbrechungen.

Sie soll verhindern, dass ungeprüfte Änderungen, vergessene Dokumentation oder unstimmige Projektstände im Repository landen.

## Standardablauf bei Code-Änderungen

Bei Änderungen an Client-, Server- oder Skriptdateien:

- `git status`
- `npm run check:client`
- `git diff`

Danach fachlich prüfen:

- Funktion im Browser testen, wenn UI oder Verhalten betroffen ist
- Terminalausgaben auf Warnungen oder Fehler prüfen
- keine versehentlichen Debug-Ausgaben stehen lassen
- keine lokalen Datenbanken, Backups, Uploads oder `.env`-Dateien committen

Commit und Push:

- `git add <geänderte Dateien>`
- `git commit -m "Kurze sachliche Commit-Nachricht"`
- `git push`
- `git status`
- `git log --oneline -8`

## Standardablauf bei reinen Dokumentationsänderungen

Bei reinen Markdown-Änderungen ist kein Client-Check erforderlich.

Prüfen:

- `git status`
- `git diff -- <datei>`

Commit und Push:

- `git add <geänderte Dateien>`
- `git commit -m "Kurze sachliche Commit-Nachricht"`
- `git push`
- `git status`
- `git log --oneline -8`

## Vor längerer Pause oder Chatwechsel

Prüfen:

- `git status`
- `git log --oneline -12`

Wichtig:

- Working Tree soll sauber sein
- letzter Commit soll gepusht sein
- `docs/PROJEKTSTAND.md` soll bei größeren Abschnitten aktuell sein
- neue Wiederaufnahme-Dokumente sollen in `docs/PROJEKTSTAND.md` genannt sein

## Nicht committen

Nicht ins Repository gehören:

- `node_modules/`
- `client/node_modules/`
- `server/node_modules/`
- `client/dist/`
- `server/database/food_inventory.db`
- `backups/`
- `server/uploads/`
- `.env`
- `.env.local`
- `client/.env.local`
- `server/.env.local`

## Dokumentationsregel

Bei neuen oder geänderten dauerhaften Funktionen prüfen, ob folgende Dokumente betroffen sind:

- `docs/PROJEKTSTAND.md`
- `docs/API_ROUTES.md`
- `docs/DATENBANK.md`
- `docs/EINKAUFSLISTE.md`
- `docs/LOKALE_BROWSERDATEN.md`
- `docs/LOCALSTORAGE_KEYS.md`
- `docs/LOCALSTORAGE_RESET_PLAN.md`

Nicht jede kleine Änderung erfordert sofort eine Projektstand-Aktualisierung. Nach größeren Abschnitten oder spätestens zu den geplanten Projektstand-Blöcken wird der Projektstand aktualisiert.
