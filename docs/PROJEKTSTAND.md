<!-- docs/PROJEKTSTAND.md -->

# Projektstand – Food Inventory

Stand: 2026-06-13 – nach Block 272

## Ziel des Projekts

Food Inventory ist eine lokale Lebensmittel-Inventar-App für Gefrierschrank, Kühlschrank, Vorratskammer und Auslandseinkäufe.

Ziel ist die strukturierte Verwaltung von Produkten, Beständen, Lagerorten, Haltbarkeiten, Historie, QR-Etiketten, Einkaufsliste und später der Betrieb auf einem Raspberry Pi im lokalen Netzwerk.

## Projektstruktur

```text
food-inventory/
├─ client/   React/Vite-Frontend
├─ server/   Express/SQLite-Backend
├─ scripts/  Wartungs- und Backup-Skripte
├─ docs/     Projektdokumentation
└─ backups/  lokale Datenbank-Backups, nicht in Git
```

## Aktueller technischer Stand

Das Projekt besteht aktuell aus einem React/Vite-Client und einem Express/SQLite-Server.

Der Server läuft standardmäßig auf Port `3101`.

Der Client läuft standardmäßig auf Port `5174`.

Die SQLite-Datenbank liegt unter:

```text
server/database/food_inventory.db
```

## Aktuelle Hauptfunktionen

### Produkte

Aktuell vorhanden:

- Produkte anlegen und bearbeiten
- Produkte deaktivieren
- Produktbilder für Vorder- und Rückseite
- Wieder-kaufen-Bewertung
- Teststatus
- Notizen
- Anzeige von Produktbildern in Produktkarten

### Bestand

Aktuell vorhanden:

- Bestandseinträge anlegen
- Produkt, Lagergerät und Lagerfach zuordnen
- Mengen, Einheiten und Restmengen erfassen
- Packungszustand erfassen
- Mindesthaltbarkeitsdatum erfassen
- Einfrierdatum und Öffnungsdatum erfassen
- interne Verlängerungsmonate für gefrorene/gekühlte Produkte
- Bestand entfernen
- Entfernungsdialog mit Grund, Produktbewertung und optionalem Historieneintrag

### Lagerstruktur

Aktuell vorhanden:

- Lagerorte
- Lagergeräte
- Lagerfächer
- aktive und inaktive Lagerbereiche
- Verwaltung und Deaktivierung von Lagerbereichen

### Historie

Aktuell vorhanden:

- Historieneinträge beim Entfernen von Bestand
- Historienfilter
- Bearbeiten von Historieneinträgen
- Löschen von Historieneinträgen
- Produktbezug in der Historie

### Filter und lokale Einstellungen

Aktuell vorhanden:

- aktive Hauptseite wird lokal gespeichert
- Produktfilter werden lokal gespeichert
- Bestandsfilter werden lokal gespeichert
- Historienfilter werden lokal gespeichert
- Anzeigeoptionen werden lokal gespeichert
- Produktentwürfe werden lokal gespeichert
- Bestandsentwürfe werden lokal gespeichert

Die Speicherung erfolgt lokal im Browser über `localStorage`.

Die tatsächlich verwendeten lokalen Speicher-Keys sind in `docs/LOCALSTORAGE_KEYS.md` dokumentiert.

Die Reset-Funktion für lokale Browserdaten ist umgesetzt und im Wartungsbereich der App erreichbar.

### QR- und Etikettenfunktionen

Aktuell vorhanden:

- Etikettenbogen für Printation Papieretiketten 45 mm × 30 mm, Art. 1548812-GP
- Layout 4 Spalten × 9 Zeilen
- QR-Codes für Inventaretiketten
- Etikettenpool
- Druckstatus
- Freigabe von Etiketten
- Wiederverwendung freier Etiketten
- Nachdrucklogik
- Kalibrierungsbogen
- Druckhinweise und Drucklayout
- verbesserte QR-Lesbarkeit

### Entwicklung und Diagnose

Aktuell vorhanden:

- Anzeige der API-Adresse im Entwicklungsmodus
- Anzeige des Serverstatus im Entwicklungsmodus
- automatische API-Ermittlung anhand der geöffneten Host-Adresse
- Dokumentation für Mac-Entwicklung
- Dokumentation für Raspberry-Pi-Start

## Datensicherung

Aktuell vorhanden:

- manuelles Backup-Skript:

```text
scripts/backup-database.sh
```

Das Skript:

- nutzt die SQLite-eigene `.backup`-Funktion
- erstellt Backups im Ordner `backups/`
- behält automatisch nur die letzten 12 Datenbank-Backups
- ist mit macOS und Raspberry Pi kompatibel

Vorbereitete systemd-Dateien für Raspberry Pi:

```text
scripts/raspi/food-inventory-backup.service
scripts/raspi/food-inventory-backup.timer
```

Geplanter automatischer Backup-Zeitpunkt:

```text
Sonntag, 03:30 Uhr
```

## Aktuelle wichtige lokale Werte

Aktuelle Mac-IP im Entwicklungsnetz:

```text
192.168.176.82
```

Aktuelle Raspberry-Pi-IP im Entwicklungsnetz:

```text
192.168.176.89
```

Diese Werte können sich durch DHCP oder Netzwerkwechsel ändern.

## Git-Stand

Letzter bekannter sauberer Arbeitsstand:

```text
working tree clean
```

Relevante letzte Commits:

```text
bc7a2c0 Plan localStorage reset feature
df5de16 Document localStorage keys
7f31e8b Update project status after documentation work
6ca26ef Document local browser data
068bb2f Add database documentation notes
64d3b3c Document database schema
```

## Aktuelle Wiederaufnahme-Dokumente

Wichtige Dokumente für die Fortsetzung nach Chatverlust oder Projektpause:

- `docs/PROJEKTSTAND.md` – Gesamtstand, Roadmap, abgeschlossene Blöcke und nächste Schritte
- `docs/EINKAUFSLISTE.md` – fachliche und technische Dokumentation der Einkaufsliste
- `docs/DATENBANK.md` – SQLite-Tabellen, Schema, Datenbeziehungen und Sicherungshinweise
- `docs/API_ROUTES.md` – Übersicht der aktuell genutzten API-Routen und Datenbereiche
- `docs/COMMIT_CHECKLIST.md` – Commit-, Prüf- und Übergabe-Checkliste für Arbeitsblöcke
- `docs/LOKALE_BROWSERDATEN.md` – lokale Browserdaten, `localStorage`, Entwürfe und Abgrenzung zur Datenbank
- `docs/LOCALSTORAGE_KEYS.md` – tatsächlich im Code verwendete `localStorage`-Keys
- `docs/LOCALSTORAGE_RESET_PLAN.md` – Planung und Umsetzungsstand der Reset-Funktion lokaler Browserdaten

## Abgeschlossene Blöcke seit letzter Projektstand-Aktualisierung

### Block 195 – Roadmap festgehalten

Die nächsten 50 geplanten Blöcke wurden in dieser Datei dokumentiert.

Festgelegt wurde:

- Projektstand spätestens alle 10 Blöcke aktualisieren
- zuerst Bestand und Wiederherstellung absichern
- danach Einkaufsliste als nächste Hauptfunktion
- Benutzerkonto und Nutzung außerhalb des WLANs später behandeln

### Block 196 – Backup-Wiederherstellung dokumentiert

Die README wurde um eine Anleitung zur Wiederherstellung eines Datenbank-Backups ergänzt.

Dokumentiert wurde:

- Server stoppen
- vorhandene Backups anzeigen
- aktuelle Datenbank vor Restore zusätzlich sichern
- gewünschtes Backup zurückkopieren
- Server neu starten
- Funktion prüfen
- Hinweis, dass Produktbilder nicht durch Datenbank-Restore wiederhergestellt werden

### Block 197 – Restore-Skript erstellt

Das Skript wurde ergänzt:

```text
scripts/restore-database.sh
```

Eigenschaften:

- Backup-Datei muss ausdrücklich angegeben werden
- Skript prüft, ob Backup-Datei vorhanden ist
- Skript prüft, ob aktuelle Datenbank vorhanden ist
- aktuelle Datenbank wird vor Restore automatisch gesichert
- Restore erfolgt nur nach Eingabe von `RESTORE`
- Skript ist ausführbar

### Block 198 – Produktbildspeicher dokumentiert

Die README wurde um den Abschnitt Produktbilder und Upload-Dateien ergänzt.

Dokumentiert wurde:

- Datenbank-Backup sichert nur SQLite-Datenbank
- Produktbilder liegen separat unter `server/uploads/products/`
- Upload-Ordner wird nicht in Git übernommen
- vollständige Sicherung benötigt Datenbank und Upload-Ordner
- Beispiel für manuelle Sicherung des Upload-Ordners

### Block 199 – ZIP- und Projektübergabe dokumentiert

Die README wurde um eine ZIP-Anleitung für Chat-Neustart, Übergabe oder externe Prüfung ergänzt.

Dokumentiert wurde, dass folgende Inhalte nicht in die ZIP-Datei gehören:

```text
.git
node_modules
client/node_modules
server/node_modules
client/dist
server/database/food_inventory.db
backups
server/uploads
.env.local
client/.env.local
server/.env.local
```

Für eine spätere Fortsetzung reichen in der Regel:

```text
food-inventory-projektstand.zip
docs/PROJEKTSTAND.md
git log --oneline -20
```

### Block 211 – Einkaufsliste für Auslandseinkäufe vorbereiten

Abgeschlossen. Einkaufslisteneinträge können als Auslandseinkauf markiert werden. Die Markierung wird gespeichert und als Chip `Ausland` angezeigt.

### Block 212 – Einkaufsliste nach Auslandseinkauf filtern

Abgeschlossen. Die Einkaufsliste kann nach `Alle`, `Ausland` und `Normal` gefiltert werden. Die Zähler zeigen die offenen Einträge je Filter an.

### Block 213 – Einkaufsliste als Text kopieren/exportieren

Abgeschlossen. Die aktuell gefilterte offene Einkaufsliste kann als Text in die Zwischenablage kopiert werden. Für Browser ohne direkte Clipboard-Unterstützung ist ein Fallback über ein temporäres Textfeld vorhanden.

### Block 214 – Dokumentation Einkaufsliste aktualisieren

Abgeschlossen. Die Datei `docs/EINKAUFSLISTE.md` wurde von der ursprünglichen Planung auf den aktuellen Umsetzungsstand gebracht.

### Block 215 – Exporttext anzeigen und manuell kopieren

Abgeschlossen. Der aktuell gefilterte Exporttext kann zusätzlich in der Anwendung angezeigt werden. Der Text wird in einem schreibgeschützten Textfeld dargestellt und kann dort manuell markiert und kopiert werden.

### Block 216 – Dokumentation Exporttext-Anzeige aktualisieren

Abgeschlossen. Die Dokumentation wurde um die Funktion `Text anzeigen` und die manuelle Kopiermöglichkeit ergänzt.

### Block 217 – Kategorie-Vorschläge für Einkaufsliste ergänzen

Abgeschlossen. Die Einkaufsliste nutzt Kategorie-Vorschläge aus den gemeinsamen Produktkategorien. Dafür wird `shoppingListCategorySuggestionOptions` aus `productCategoryOptions` abgeleitet.

### Block 218 – Dokumentation Kategorie-Vorschläge aktualisieren

Abgeschlossen. Die Dokumentation wurde um gemeinsame Kategorien, Kategorie-Vorschläge und die Abgrenzung zum Auslandseinkauf ergänzt.

### Block 219 – Einheit-Vorschläge für Einkaufsliste ergänzen

Abgeschlossen. Die Einkaufsliste nutzt Einheit-Vorschläge aus den gemeinsamen Einheiten. Dafür wird `quantityUnitOptions` in den Feldern für neue und zu bearbeitende Einkaufslisteneinträge verwendet.

### Block 220 – Dokumentation Einheit-Vorschläge aktualisieren

Abgeschlossen. Die Dokumentation wurde um gemeinsame Einheiten und Einheit-Vorschläge für die Einkaufsliste ergänzt.

### Block 221 – Priorität-Optionen der Einkaufsliste auslagern

Abgeschlossen. Die Priorität-Optionen der Einkaufsliste wurden aus der Komponente ausgelagert und werden zentral über `shoppingListPriorityOptions` in `selectOptions.js` gepflegt.

### Block 222 – Dokumentation Priorität-Optionen aktualisieren

Abgeschlossen. Die Dokumentation wurde um die zentrale Pflege der Priorität-Optionen und die Sortierlogik ergänzt.

### Block 223 – Projektstand nach Einkaufsliste aktualisiert

- `docs/PROJEKTSTAND.md` auf den Stand nach Block 222 gebracht.
- Einkaufsliste mit Auslandseinkauf, Exporttext, Kategorien, Einheiten und Prioritäten dokumentiert.
- Abweichung zur ursprünglichen Roadmap festgehalten.

Commit:

```text
af225ee Update project status after shopping list work
```

### Block 224 – Datenbankstruktur technisch dokumentiert

- Neue Datei `docs/DATENBANK.md` erstellt.
- Tabellenübersicht aus der echten SQLite-Datenbank dokumentiert.
- Vollständiges SQLite-Schema aus `server/database/food_inventory.db` dokumentiert.
- Enthaltene Tabellen: `storage_locations`, `storage_units`, `storage_compartments`, `products`, `inventory_items`, `label_slots`, `inventory_history`, `shopping_list_items`.

Commit:

```text
64d3b3c Document database schema
```

### Block 225 – Datenbankdokumentation fachlich ergänzt

- `docs/DATENBANK.md` um fachliche Tabellenzuordnung ergänzt.
- Lagerstruktur, Bestand, Etiketten, Historie und Einkaufsliste fachlich beschrieben.
- Wichtige Datenbeziehungen dokumentiert.
- Sicherungshinweise zur SQLite-Datenbank und zu Produktbildern ergänzt.
- Offene Prüfpunkte für Migrationen, Fremdschlüssel, API-Zuordnung und Bild-Aufräumlogik ergänzt.

Commit:

```text
068bb2f Add database documentation notes
```

### Block 226 – Lokale Browserdaten dokumentiert

- Neue Datei `docs/LOKALE_BROWSERDATEN.md` erstellt.
- Abgrenzung zwischen SQLite-Datenbank und lokalen Browserdaten dokumentiert.
- Lokale Komfortdaten wie aktive Ansicht, Filter, Anzeigeoptionen und Entwürfe beschrieben.
- Risiken bei gelöschten Browserdaten und geräteabhängiger Speicherung festgehalten.
- Regel ergänzt, dass neue `localStorage`-Keys künftig dokumentiert werden sollen.

Commit:

```text
6ca26ef Document local browser data
```

### Block 227 – Projektstand nach Dokumentationsarbeit aktualisiert

- `docs/PROJEKTSTAND.md` auf den Stand nach Block 226 gebracht.
- Neue Wiederaufnahme-Dokumente ergänzt.
- Letzte Commits aktualisiert.
- Blöcke 224 bis 226 dokumentiert.
- Markdown-Fehler in einem Commit-Codeblock korrigiert.

Commit:

```text
7f31e8b Update project status after documentation work
```

### Block 228 – Tatsächliche localStorage-Keys dokumentiert

- Neue Datei `docs/LOCALSTORAGE_KEYS.md` erstellt.
- Tatsächliche `localStorage`-Fundstellen im Code per `grep` geprüft.
- Folgende Dateien als Fundstellen dokumentiert:
  - `client/src/utils/printedLabelStorageUtils.js`
  - `client/src/components/products/ProductsSection.jsx`
  - `client/src/App.jsx`
- Alle aktuell verwendeten `food-inventory.*`-Keys mit Zweck, Inhalt und Löschbarkeit dokumentiert.
- Festgehalten, dass im Server keine `localStorage`-Nutzung gefunden wurde.

Commit:

```text
df5de16 Document localStorage keys
```

### Block 229 – Reset-Funktion für lokale Browserdaten geplant

- Neue Datei `docs/LOCALSTORAGE_RESET_PLAN.md` erstellt.
- Reset-Gruppen für Filter, Anzeigeoptionen, Formularentwürfe, lokale Etiketten-Druckmarkierungen und vollständigen lokalen Reset geplant.
- Abgrenzung zur SQLite-Datenbank dokumentiert.
- Sicherheitsabfragen und Warntexte fachlich vorgeplant.
- Technische Richtung mit zentralen Keys und späteren Reset-Hilfsfunktionen beschrieben.

Commit:

```text
bc7a2c0 Plan localStorage reset feature
```

## Einkaufsliste

Die Einkaufsliste ist als eigener Hauptbereich in der Anwendung vorhanden.

Aktueller Stand:

- freie Einkaufslisteneinträge können angelegt werden
- Produkte können aus der Produktansicht direkt zur Einkaufsliste übernommen werden
- Produkte mit der Bewertung „wieder kaufen“ können über einen Produktfilter gezielt angezeigt werden
- aus der Produktansicht übernommene Produkte werden mit Produktbezug gespeichert
- bei Produkten mit „wieder kaufen“ wird die Priorität automatisch auf „hoch“ gesetzt
- Einkaufslisteneinträge können bearbeitet werden
- Menge, Einheit, Kategorie, Priorität und Notiz können geändert werden
- Einträge können als erledigt markiert und wieder geöffnet werden
- Einträge können gelöscht werden
- erledigte Einträge können angezeigt oder ausgeblendet werden
- offene Einträge werden nach Priorität, Kategorie und Name sortiert
- offene Einträge werden nach Kategorie gruppiert
- Einkauf als Auslandseinkauf markieren
- Einkaufsliste nach `Alle`, `Ausland` und `Normal` filtern
- aktuell gefilterte offene Einkaufsliste als Text kopieren
- Exporttext anzeigen und manuell kopieren
- Kategorie-Vorschläge aus den gemeinsamen Produktkategorien nutzen
- Einheit-Vorschläge aus den gemeinsamen Einheiten nutzen
- Priorität-Optionen zentral über `shoppingListPriorityOptions` nutzen
- die mobile Darstellung der Einkaufsliste wurde verbessert

Technischer Stand:

- Tabelle `shopping_list_items` ist vorhanden
- API-Routen für Laden, Anlegen, Bearbeiten, Erledigen, Wiederöffnen und Löschen sind vorhanden
- Frontend-Komponente `ShoppingListSection` ist vorhanden
- die Einkaufsliste ist über die Hauptnavigation erreichbar
- Dokumentation der Einkaufsliste liegt in `docs/EINKAUFSLISTE.md`
- Kategorie-Vorschläge werden aus `productCategoryOptions` abgeleitet
- Einheit-Vorschläge nutzen `quantityUnitOptions`
- Priorität-Optionen nutzen `shoppingListPriorityOptions`

Aktuell wichtig für Wiederaufnahme:

- Einkaufsliste ist funktionsfähig und mobil nutzbar
- Auslandseinkäufe sind markierbar und filterbar
- Exporttext kann kopiert oder manuell aus einem Textfeld übernommen werden
- Kategorien und Einheiten bleiben freie Textfelder, haben aber Vorschläge
- Prioritäten bleiben Auswahlfelder und werden zentral gepflegt
- alte Roadmap-Punkte zur Einkaufsliste sind teilweise überholt, weil Auslandseinkauf, Exporttext, Vorschläge und Dokumentation bereits umgesetzt wurden

Offene nächste Schritte:

- Mehrfachauswahl oder Sammelaktionen prüfen
- erledigte Einkäufe optional in Historie oder Verbrauch übernehmen
- spätere Druck- oder Exportansicht prüfen
- Datenbankstruktur separat dokumentieren
- lokale Browserdaten und `localStorage` dokumentieren
- Einkaufsliste weiter stabilisieren und Fehleranzeigen prüfen

## Aktueller Sicherungsstand

Aktuell vorhanden:

- Backup-Skript für SQLite-Datenbank
- automatische Begrenzung auf die letzten 12 Datenbank-Backups
- README-Anleitung für Datenbank-Restore
- Restore-Skript mit Sicherheitsabfrage
- Dokumentation zu Produktbildern und Upload-Dateien
- Dokumentation zur ZIP-Projektübergabe

Noch offen:

- automatische Sicherung des Upload-Ordners
- vollständige Sicherung aus Datenbank und Produktbildern
- Aufräumlogik für nicht mehr verwendete Produktbilder


### Block 231 bis 235 – localStorage-Reset und Wartungsbereich umgesetzt

Umgesetzt wurde die technische Grundlage und UI für das Zurücksetzen lokaler Browserdaten.

Erledigt:

- localStorage-Keys zentralisiert
- Reset-Hilfsfunktionen für lokale Browserdaten erstellt
- Wartungsbereich in der Hauptnavigation ergänzt
- vier Reset-Aktionen eingebaut:
  - Filter und Anzeige zurücksetzen
  - Formularentwürfe löschen
  - lokale Druckmarkierungen löschen
  - alle lokalen Browserdaten löschen
- Sicherheitsabfragen vor jedem Reset eingebaut
- Statusmeldung nach Reset eingebaut
- Wartungsbereich optisch nachgeschärft
- App-State nach Reset direkt für Bestandsfilter, Historienfilter, Anzeigeoptionen, Anzeige erledigter Einkaufslisteneinträge, Formularentwürfe, Etikettenscan und Produktfilter synchronisiert

Commits:

- `9e2fb66` – Centralize localStorage keys
- `3e900cd` – Add localStorage reset helpers
- `13771d4` – Add maintenance section for localStorage reset
- `8ee2de6` – Improve maintenance reset styling
- `ea86809` – Sync app state after localStorage reset

Hinweis:

Der ursprüngliche Plan aus `docs/LOCALSTORAGE_RESET_PLAN.md` ist damit weitgehend umgesetzt. Produktfilter werden seit Block 237 ebenfalls live nach dem Wartungsreset zurückgesetzt.


### Block 237 – Produktfilter nach Wartungsreset live zurückgesetzt

Nach dem Wartungsreset werden Produktfilter jetzt ebenfalls direkt im laufenden UI zurückgesetzt.

Umsetzung:

- `App.jsx` verwaltet ein internes Reset-Signal für Produktfilter.
- `ProductsSection` wird über `key={productFilterResetSignal}` neu gemountet.
- Dadurch lädt die Produktansicht den Filter-Initialzustand neu.
- Die Lösung vermeidet einen direkten `setState`-Aufruf in einem `useEffect` und bleibt mit der aktuellen ESLint-Regel `react-hooks/set-state-in-effect` kompatibel.

Commit:

- `c15c013` – Reset product filters after maintenance reset

### Block 239 – Anzeige erledigter Einkaufslisteneinträge nach Wartungsreset zurückgesetzt

Die Anzeigeoption der Einkaufsliste für erledigte Einträge wird nach dem Wartungsreset ebenfalls direkt zurückgesetzt.

Umsetzung:

- `App.jsx` setzt `showCompletedShoppingItems` beim Reset von Filter und Anzeige auf `false`.
- Dadurch werden erledigte Einkaufslisteneinträge nach dem Wartungsreset wieder ausgeblendet.
- Der Reset wirkt auch beim vollständigen lokalen Browserdaten-Reset, da dieser dieselbe Reset-Funktion nutzt.

Commit:

- `b1507c0` – Reset completed shopping item visibility

### Block 241 – API-Routen dokumentiert

Die aktuell genutzten API-Routen wurden als eigenes Wiederaufnahme-Dokument ergänzt.

Neue Datei:

- `docs/API_ROUTES.md`

Dokumentiert wurden:

- Basis-Pfad `/api`
- lokale Serveradresse `http://localhost:3101`
- Routen für Diagnose, Lagerstruktur, Produkte, Bestand, Historie, Etiketten und Einkaufsliste
- Zuordnung der Routen zu Datenbereichen und Datenbanktabellen
- offene Ergänzungen für Request-Bodies, Response-Formate, Fehlerfälle und Upload-Routen

Commit:

- `cc60e50` – Document API routes

### Block 244 – API-Dokumentation an echte Frontend-Aufrufe angepasst

Die API-Dokumentation wurde mit den tatsächlichen Frontend-Aufrufen aus `client/src/api/inventoryApi.js` abgeglichen und korrigiert.

Korrigiert bzw. ergänzt wurden insbesondere:

- Lagerstruktur-Routen wie `/api/storage/tree`, `/api/storage/inactive`, `/api/storage/locations`, `/api/storage/units` und Reaktivierungsrouten
- Etiketten-Routen wie `/api/labels`, `/api/labels/mark-printed`, `/api/labels/free` und `/api/labels/free/all`
- Produkt-Deaktivierung über `DELETE /api/products/:productId`
- Produktfoto-Upload über `POST /api/products/photos`
- genauere Parameterbezeichnungen bei Produkten, Bestand, Historie und Einkaufsliste

Commit:

- `b464c5b` – Align API documentation with frontend calls

### Block 246 – Wartungs-Reset-Meldung präzisiert

Die Erfolgsmeldung nach dem Zurücksetzen lokaler Browserdaten wurde fachlich präzisiert.

Geändert wurde:

- Die frühere Aussage, dass einige Änderungen erst nach dem Neuladen sichtbar werden, wurde entfernt.
- Die Meldung weist jetzt klar darauf hin, dass gespeicherte Daten in der SQLite-Datenbank unverändert bleiben.
- Der Wartungsbereich bleibt damit verständlicher, weil die meisten Anzeige- und Formularzustände inzwischen direkt live zurückgesetzt werden.

Browsertest:

- Wartung → Filter und Anzeige zurücksetzen
- Erfolgsmeldung wurde korrekt angezeigt.

Commit:

- `3810a4d` – Clarify local storage reset message

### Block 248 bis 249 – API-Hilfsfunktionen formatiert

Die API-Hilfsdatei `client/src/api/inventoryApi.js` wurde an zwei Stellen bereinigt.

Geändert wurde:

- `deactivateProductById(productId)` wurde sauber eingerückt und mit konsistenter Kommasetzung formatiert.
- `uploadProductPhoto({ productId, side, imageDataUrl })` wurde mehrzeilig formatiert.
- Es wurden keine fachlichen API-Pfade geändert.
- Der Client-Check war jeweils erfolgreich.

Commits:

- `d175440` – Clean up product deactivation API formatting
- `58017b4` – Format product photo API helper

### Block 251 – Commit- und Prüf-Checkliste ergänzt

Eine kurze Commit- und Prüf-Checkliste wurde als eigenes Wiederaufnahme-Dokument ergänzt.

Neue Datei:

- `docs/COMMIT_CHECKLIST.md`

Dokumentiert wurden:

- Standardablauf bei Code-Änderungen
- Standardablauf bei reinen Dokumentationsänderungen
- Prüfung vor längerer Pause oder Chatwechsel
- Dateien und Ordner, die nicht committen werden sollen
- Dokumentationsregel für dauerhafte Funktionen

Commit:

- `7b57f17` – Add commit checklist documentation

### Block 253 – API-Antwortverarbeitung robuster gemacht

Die zentrale API-Hilfsfunktion `fetchJson` in `client/src/api/inventoryApi.js` wurde robuster gemacht.

Produktiv geändert wurde:

- Netzwerkfehler beim `fetch` werden abgefangen und mit fachlicher Fehlermeldung weitergegeben.
- Der ursprüngliche technische Fehler wird über `cause` erhalten.
- Antworttexte werden zuerst als Text gelesen und nur bei Inhalt als JSON geparst.
- Leere erfolgreiche Antworten liefern künftig `null` zurück.
- Fehlerantworten können weiterhin serverseitige Fehlermeldungen aus `error` verwenden.

Prüfung:

- `npm run check:client` war erfolgreich.

Commit:

- `c969f6b` – Improve API response handling

### Block 255 – API-Request-Helper vereinheitlicht

Die API-Hilfsdatei `client/src/api/inventoryApi.js` wurde weiter vereinheitlicht.

Produktiv geändert wurde:

- Neuer zentraler Helper `createRequest(method)` für API-Requests ohne Body.
- JSON-Requests nutzen intern ebenfalls `createRequest(method)`.
- Alle Requests mit Body senden weiterhin `Content-Type: application/json`.
- Requests senden zusätzlich `Accept: application/json`.
- DELETE- und PATCH-Requests ohne Body nutzen jetzt den zentralen Helper statt einzelner Objektdefinitionen.
- Die fehlende abschließende Leerzeile am Dateiende wurde korrigiert.

Prüfung:

- `npm run check:client` war erfolgreich.

Commit:

- `0e6a2ac` – Standardize API request helpers

### Block 257 – API-Hilfslogik refactored

Die zentrale API-Hilfsdatei `client/src/api/inventoryApi.js` wurde weiter aufgeräumt.

Produktiv geändert wurde:

- Die API-URL-Erzeugung wurde in `createApiUrl(path)` ausgelagert.
- Das Parsen von Antworttexten wurde in `parseJsonText(responseText)` ausgelagert.
- Die Ermittlung der API-Fehlermeldung wurde in `createApiErrorMessage(responseData, fallbackMessage)` gekapselt.
- `fetchJson` ist dadurch kürzer, lesbarer und leichter erweiterbar.
- Das funktionale Verhalten der API-Aufrufe bleibt unverändert.

Prüfung:

- `npm run check:client` war erfolgreich.

Commit:

- `25304aa` – Refactor API helper utilities

### Block 259 – API-Response-Helper weiter verfeinert

Die zentrale API-Hilfsdatei `client/src/api/inventoryApi.js` wurde weiter vereinheitlicht.

Produktiv geändert wurde:

- Standard-GET-Requests nutzen jetzt automatisch `createRequest("GET")`.
- Das Lesen des Antworttexts wurde in `readResponseText(response)` ausgelagert.
- Die Prüfung auf leere Antworten wurde in `isEmptyResponse(response, responseText)` gekapselt.
- `fetchJson` bleibt dadurch weiter lesbarer und besser wartbar.
- Das fachliche Verhalten der bestehenden API-Aufrufe bleibt unverändert.

Prüfung:

- `npm run check:client` war erfolgreich.

Commit:

- `3cf4ee0` – Refine API response helpers

### Block 261 – HTTP-Methoden zentralisiert

Die API-Hilfsdatei `client/src/api/inventoryApi.js` wurde weiter vereinheitlicht.

Produktiv geändert wurde:

- HTTP-Methoden werden jetzt zentral in `API_METHOD` definiert.
- Standard-GET nutzt `API_METHOD.GET`.
- POST-, PUT-, PATCH- und DELETE-Aufrufe nutzen keine freien Methoden-Strings mehr.
- Die bestehenden API-Pfade und das fachliche Verhalten bleiben unverändert.
- Der Code ist dadurch weniger fehleranfällig bei späteren Anpassungen.

Prüfung:

- `npm run check:client` war erfolgreich.

Commit:

- `93ea932` – Centralize API method constants

### Block 263 – API-Header zentralisiert

Die API-Hilfsdatei `client/src/api/inventoryApi.js` wurde weiter vereinheitlicht.

Produktiv geändert wurde:

- Header-Namen werden jetzt zentral in `API_HEADER` definiert.
- Der JSON-Content-Type wird zentral in `API_CONTENT_TYPE` definiert.
- `createRequest(method)` nutzt die zentralen Header-Konstanten für `Accept`.
- `createJsonRequest(method, payload)` nutzt die zentralen Header-Konstanten für `Content-Type`.
- Die bestehenden API-Pfade und das fachliche Verhalten bleiben unverändert.

Prüfung:

- `npm run check:client` war erfolgreich.

Commit:

- `9e381b3` – Centralize API header constants

### Block 265 – API-Fehlermeldungen robuster ausgewertet

Die zentrale API-Hilfsdatei `client/src/api/inventoryApi.js` wurde bei der Fehlerauswertung verbessert.

Produktiv geändert wurde:

- Mit `isNonEmptyString(value)` werden verwertbare Fehlertexte geprüft.
- Mit `getFirstNonEmptyString(...values)` wird eine Fallback-Kette für Fehlertexte genutzt.
- `createApiErrorMessage(responseData, fallbackMessage)` berücksichtigt jetzt `error`, `message` und `detail`.
- Leere oder nur aus Leerzeichen bestehende Fehlertexte werden nicht mehr als sinnvolle Meldung übernommen.
- Falls kein verwertbarer Fehlertext vorhanden ist, bleibt eine allgemeine Fallback-Meldung erhalten.

Prüfung:

- `npm run check:client` war erfolgreich.

Commit:

- `538a666` – Improve API error message fallback

### Block 267 – API-Fehlerfeldlogik zentralisiert

Die zentrale API-Hilfsdatei `client/src/api/inventoryApi.js` wurde bei der Fehlerauswertung weiter strukturiert.

Produktiv geändert wurde:

- Die allgemeine API-Fallback-Meldung wird jetzt zentral in `API_ERROR_FALLBACK_MESSAGE` definiert.
- Unterstützte Server-Fehlerfelder werden zentral in `API_ERROR_FIELD_NAMES` gepflegt.
- Mit `getApiErrorFieldValue(responseData, fieldName)` werden Fehlerfelder sicher aus `responseData` gelesen.
- `createApiErrorMessage(responseData, fallbackMessage)` nutzt jetzt die zentrale Fehlerfeldliste statt fest codierter Einzelzugriffe.
- Leere, fehlende oder nicht objektförmige Fehlerantworten werden weiterhin robust abgefangen.

Prüfung:

- `npm run check:client` war erfolgreich.

Commit:

- `64a40e0` – Centralize API error field handling

### Block 269 – API-Header-Erzeugung weiter gekapselt

Die zentrale API-Hilfsdatei `client/src/api/inventoryApi.js` wurde bei der Request-Erzeugung weiter strukturiert.

Produktiv geändert wurde:

- Mit `createHeaders(extraHeaders = {})` gibt es jetzt einen zentralen Helper für API-Header.
- Mit `createBaseHeaders()` werden Standard-Header für normale API-Requests erzeugt.
- Mit `createJsonHeaders()` werden Header für JSON-Requests mit `Content-Type` erzeugt.
- `createRequest(method)` nutzt jetzt die zentrale Header-Erzeugung.
- `createJsonRequest(method, payload)` baut Header nicht mehr manuell zusammen.

Prüfung:

- `npm run check:client` war erfolgreich.

Commit:

- `0324480` – Refine API header creation helpers

### Block 271 – API-Status- und Fehler-Helper weiter gekapselt

Die zentrale API-Hilfsdatei `client/src/api/inventoryApi.js` wurde bei Status- und Fehlerbehandlung weiter strukturiert.

Produktiv geändert wurde:

- HTTP-Status `204` wird jetzt zentral in `API_STATUS.NO_CONTENT` definiert.
- Mit `isNoContentResponse(response)` wird die No-Content-Prüfung gekapselt.
- Mit `hasEmptyResponseText(responseText)` wird die Prüfung auf leere Antworttexte gekapselt.
- `isEmptyResponse(response, responseText)` nutzt jetzt die gekapselten Prüfungen.
- Mit `createNetworkError(errorMessage, error)` wird die Erzeugung von Netzwerkfehlern gekapselt.
- Mit `createApiHttpError(responseData, errorMessage)` wird die Erzeugung von HTTP-Fehlern gekapselt.
- `fetchJson` ist dadurch weiter entlastet und lesbarer.
- Die Fehlerbehandlung bleibt einheitlich.
- Das fachliche Verhalten der bestehenden API-Aufrufe bleibt unverändert.
- Der Client-Check war erfolgreich.

Prüfung:

- `npm run check:client` war erfolgreich.

Commit:

- `478ca8b` – Refine API status and error helpers

## Aktuelle nächste Schritte nach Block 272

Sinnvolle nächste Arbeiten:

- Einkaufsliste weiter stabilisieren
- erledigte Einkäufe optional in Historie oder Verbrauch übernehmen
- Mehrfachauswahl oder Sammelaktionen für Einkaufsliste prüfen
- Produktbild-Aufräumlogik planen
- vollständige Sicherung aus Datenbank und Upload-Ordner prüfen
- Raspberry-Pi-Start erneut praktisch testen und dokumentieren
- API-Dokumentation später um Request-Bodies und Response-Formate ergänzen

## Arbeitsregel für Projektstand

Diese Datei wird künftig spätestens alle 10 Blöcke aktualisiert.

Geplante Aktualisierungspunkte:

```text
Block 200
Block 210
Block 220
Block 230
Block 240
Block 250
Block 260
Block 270
Block 280
```

Ziel: Bei Chatverlust reicht die aktuelle Projekt-ZIP plus diese Datei, um den Stand wieder aufzunehmen.

## Roadmap – nächste 50 Blöcke

Die folgende Roadmap ist eine Arbeitsplanung und kann angepasst werden. Die Reihenfolge ist bewusst so gewählt, dass zuerst der Bestand und die Wiederherstellung abgesichert werden. Danach folgt die Einkaufsliste. Benutzerkonto und Nutzung außerhalb des WLANs kommen später, weil diese Themen zusätzliche Sicherheits- und Betriebskonzepte benötigen.

Hinweis nach Block 222:

Die Roadmap bleibt als historische Arbeitsplanung erhalten. Einzelne Blöcke 211 bis 222 wurden in der tatsächlichen Umsetzung anders zugeschnitten als ursprünglich geplant. Insbesondere Auslandseinkauf, Exporttext, Kategorie-Vorschläge, Einheit-Vorschläge und Priorität-Optionen wurden bereits umgesetzt und dokumentiert.

Für die weitere Arbeit gilt: Die Roadmap wird nicht rückwirkend gelöscht, sondern bei den nächsten Projektstand-Aktualisierungen fortgeschrieben. Dadurch bleibt nachvollziehbar, welche Planung ursprünglich vorgesehen war und welche Umsetzung tatsächlich erfolgt ist.

## Phase 1 – Bestand absichern und Wiederherstellung beherrschen

### Block 195 – Roadmap der nächsten 50 Blöcke festhalten

Diese Roadmap wird in `docs/PROJEKTSTAND.md` dokumentiert.

Ziel: Bei Chatverlust, Gerätewechsel oder längerer Pause bleibt die Projektplanung nachvollziehbar.

### Block 196 – Backup-Wiederherstellung dokumentieren

Dokumentieren, wie eine vorhandene Sicherung wiederhergestellt wird.

Geplante Inhalte:

- Server stoppen
- aktuelle Datenbank zusätzlich sichern
- gewünschtes Backup auswählen
- Datenbank ersetzen
- Server neu starten
- Funktion prüfen

### Block 197 – Wiederherstellungs-Skript vorbereiten

Ein vorsichtiges Restore-Skript vorbereiten.

Wichtig:

- nur mit ausdrücklicher Sicherheitsabfrage
- vorhandene Datenbank vorher automatisch sichern
- Restore-Datei muss explizit angegeben werden
- keine automatische Überschreibung ohne Bestätigung

### Block 198 – Upload- und Produktbildspeicher dokumentieren

Dokumentieren, wie Produktbilder gespeichert werden.

Geplante Inhalte:

- Speicherort `server/uploads/products/`
- Ausschluss aus Git
- Bezug zu Produkten
- Umgang mit alten oder nicht mehr verwendeten Bildern
- spätere Aufräumstrategie

### Block 199 – ZIP- und Projektübergabe-Anleitung aktualisieren

Dokumentieren, wie ein Projektstand für Übergabe oder Chat-Neustart gezippt wird.

Wichtig auszuschließen:

- `.git`
- `node_modules`
- `dist`
- Datenbank
- Backups
- Uploads
- lokale `.env.local`

### Block 200 – Projektstand aktualisieren

Status: abgeschlossen.

`docs/PROJEKTSTAND.md` wurde nach Block 199 aktualisiert.

Festgehalten wurden:

- letzter sauberer Commit
- abgeschlossene Blöcke 195 bis 199
- aktueller Sicherungsstand
- offene Sicherungsthemen
- nächste Phase: Einkaufsliste ab Block 201

### Abgeschlossene Blöcke Einkaufsliste

- Block 201: Datenmodell Einkaufsliste geplant
- Block 202: Datenbanktabelle `shopping_list_items` angelegt
- Block 203: API-Routen für Einkaufsliste erstellt
- Block 204: Frontend-Grundansicht der Einkaufsliste erstellt
- Block 205: Produkte können zur Einkaufsliste hinzugefügt werden
- Block 206: Produktfilter für „wieder kaufen“ ergänzt
- Block 207: Mengen, Einheit, Kategorie, Priorität und Notiz bearbeitbar gemacht
- Block 208: mobile Darstellung der Einkaufsliste verbessert
- Block 209: Einkaufsliste nach Priorität und Kategorie sortiert und gruppiert

## Phase 2 – Einkaufsliste als Hauptfunktion aufbauen

### Block 201 – Datenmodell Einkaufsliste planen

Fachlich festlegen, welche Felder die Einkaufsliste benötigt.

Mögliche Felder:

- Produktbezug
- freier Artikelname
- Menge
- Einheit
- Notiz
- Kategorie
- Auslandseinkauf
- Priorität
- Status offen/erledigt
- Erstellungsdatum
- Erledigungsdatum

### Block 202 – SQLite-Migration für Einkaufsliste

Datenbanktabelle für Einkaufsliste anlegen.

Geplante Tabelle:

```text
shopping_list_items
```

### Block 203 – API-Routen Einkaufsliste

Server-Endpunkte ergänzen.

Geplante Funktionen:

- Liste laden
- Eintrag anlegen
- Eintrag ändern
- Eintrag abhaken
- Eintrag löschen
- erledigte Einträge optional ausblenden

### Block 204 – Client-Komponente Einkaufsliste Grundansicht

Neue React-Komponente für die Einkaufsliste erstellen.

Geplante Ansicht:

- offene Einträge
- erledigte Einträge
- einfache Eingabe
- Statusanzeige

### Block 205 – Produkte auf Einkaufsliste setzen

Aus Produktkarten heraus Produkte direkt zur Einkaufsliste hinzufügen.

Beispiel:

```text
Produkt → Zur Einkaufsliste
```

### Block 206 – Einkaufsliste aus „wieder kaufen“ ableiten

Produkte mit Bewertung „wieder kaufen“ sinnvoll in die Einkaufsliste integrieren.

Noch zu entscheiden:

- automatisch vorschlagen
- manuell hinzufügen
- eigener Filter „wieder kaufen“

### Block 207 – Mengen und Notizen auf Einkaufsliste

Einkaufsliste um Mengen, Einheiten und Notizen ergänzen.

Ziel: Einkaufseinträge sollen praktisch im Laden nutzbar sein.

### Block 208 – Mobile Ansicht Einkaufsliste optimieren

Status: abgeschlossen.

Die mobile Darstellung der Einkaufsliste wurde verbessert.

Umgesetzt wurden:

- kompaktere Eintragsdarstellung
- größere Touchflächen
- klarere Prioritätsanzeige
- optisch hervorgehobene Erledigt-Aktion
- weniger dominante Löschaktion

### Block 209 – Einkaufsliste sortieren und gruppieren

Status: abgeschlossen.

Die Einkaufsliste wurde für die praktische Nutzung im Laden sortiert und gruppiert.

Umgesetzt wurden:

- offene Einträge werden nach Priorität sortiert
- danach nach Kategorie und Name
- offene Einträge werden nach Kategorie gruppiert
- Kategoriegruppen zeigen die Anzahl der Einträge
- erledigte Einträge bleiben separat

### Block 210 – Projektstand aktualisieren

`docs/PROJEKTSTAND.md` aktualisieren.

Geplante Inhalte:

- Stand Einkaufsliste
- offene Einkaufslistenfunktionen
- letzter Commit
- ggf. neue Roadmap-Anpassung

### Block 211 – Mobile Ansicht Einkaufsliste optimieren

Einkaufsliste für Handy optimieren.

Wichtig:

- große Touchflächen
- schnelle Bedienung
- klare Sortierung
- gute Lesbarkeit im Laden

### Block 212 – Offline-taugliche Einkaufsliste im Browser vorbereiten

Prüfen, wie die Einkaufsliste bei Verbindungsproblemen nutzbar bleibt.

Mögliche Richtung:

- lokale Kopie im Browser
- Statushinweis „offline“
- spätere Synchronisation noch nicht zwingend

### Block 213 – Einkaufsliste als Text exportieren/teilen

Exportfunktion ergänzen.

Mögliche Ausgabe:

```text
Einkaufsliste:
- Milch
- Butter
- Kiełbasa biała
```

### Block 214 – Auslandseinkauf-Filter integrieren

Einkaufsliste um Auslandseinkauf-Logik ergänzen.

Ziel: Artikel markieren oder filtern, die speziell für Auslandseinkäufe relevant sind.

### Block 215 – Einkaufsliste testen und stabilisieren

Build, Lint und praktische Tests.

Prüfen:

- Eintrag anlegen
- Eintrag ändern
- Eintrag löschen
- Eintrag abhaken
- Produktbezug
- mobile Bedienung

## Phase 3 – Stabilisierung vor Benutzerkonto

### Block 216 – Datenvalidierung Einkaufsliste und Bestand prüfen

Prüfen, ob Pflichtfelder, Zahlenwerte und leere Eingaben sauber behandelt werden.

### Block 217 – Fehleranzeigen vereinheitlichen

Fehleranzeigen in Client und API vereinheitlichen.

Ziel: verständliche Meldungen statt technischer Fehler.

### Block 218 – Ladezustände verbessern

Ladezustände für wichtige Bereiche verbessern.

Bereiche:

- Produkte
- Bestand
- Historie
- Lagerstruktur
- Einkaufsliste

### Block 219 – API-Fehler robuster behandeln

Netzwerkfehler, Serverausfall und ungültige Antworten sauberer behandeln.

### Block 220 – Projektstand aktualisieren

`docs/PROJEKTSTAND.md` aktualisieren.

Geplante Inhalte:

- Stand Stabilisierung
- bekannte Fehler
- erledigte Blöcke 211 bis 219
- nächste Prioritäten

Status nach tatsächlicher Umsetzung:

- Projektstand wurde nicht bei Block 220, sondern im Anschluss an Block 222 aktualisiert.
- Grund: Die Einkaufsliste wurde in den Blöcken 211 bis 222 weiter ausgebaut und dokumentiert.
- Diese Datei dient vorrangig als Wiederaufnahme- und Chatverlust-Dokument; daher bleibt die historische Roadmap erhalten.

### Block 221 – Datenbankstruktur dokumentieren

Datenbanktabellen dokumentieren.

Geplante Inhalte:

- Produkte
- Bestand
- Historie
- Lagerstruktur
- Etiketten
- Einkaufsliste

### Block 222 – Lokale Browserdaten dokumentieren und aufräumen

Dokumentieren, welche Daten in `localStorage` gespeichert werden.

Zusätzlich prüfen:

- alte Keys
- Entwürfe
- Filter
- aktive Ansicht

### Block 223 – Produktbild-Aufräumlogik planen

Status nach tatsächlicher Umsetzung:

- Block 223 wurde für die Aktualisierung von `docs/PROJEKTSTAND.md` nach Block 222 genutzt.
- Die Produktbild-Aufräumlogik bleibt weiterhin offen und wird auf einen späteren Block verschoben.

Planen, wie nicht mehr verwendete Produktbilder erkannt und bereinigt werden können.

Noch nicht zwingend umsetzen.

### Block 224 – Raspberry-Pi-Start real testen und dokumentieren

Projekt auf dem Raspberry Pi starten und tatsächliche Abweichungen dokumentieren.

Prüfen:

- `git pull`
- `npm install`
- Serverstart
- Clientstart
- Handyzugriff
- Backup-Skript
- Timer

### Block 225 – Commit- und Release-Checkliste ergänzen

Eine kurze Checkliste ergänzen.

Beispiel:

```text
git status
npm run check:client
Backup erstellen
Commit
Push
Projektstand aktualisieren, falls Block 200/210/220/...
```

## Phase 4 – Benutzerkonto vorbereiten

### Block 226 – Benutzerkonto-Anforderungen festlegen

Fachlich festlegen, wozu Benutzerkonten dienen sollen.

Fragen:

- nur ein Nutzer?
- mehrere Nutzer?
- Rollen?
- Admin?
- reine Zugriffssperre?

### Block 227 – Einbenutzer- oder Mehrbenutzerentscheidung dokumentieren

Entscheidung dokumentieren, ob zunächst ein einfaches lokales Login reicht.

### Block 228 – Authentifizierungsmodell planen

Technisches Modell planen.

Mögliche Varianten:

- Session-Cookie
- Token
- später externer Zugriff
- nur lokales Netz

### Block 229 – Sicherheitsrisiken dokumentieren

Risiken dokumentieren.

Themen:

- Passwörter
- Zugriff von außen
- HTTPS
- Backupdaten
- Produktbilder
- private Vorratsdaten

### Block 230 – Projektstand aktualisieren

`docs/PROJEKTSTAND.md` aktualisieren.

Geplante Inhalte:

- Stand Benutzerkonto-Planung
- offene Sicherheitsentscheidungen
- erledigte Blöcke 221 bis 229

### Block 231 – Login-UI entwerfen

Erste Login-Oberfläche planen.

Noch nicht zwingend mit echter Authentifizierung.

### Block 232 – Server-Auth-Konzept festlegen

Serverseitige Authentifizierung planen.

Themen:

- Passwort-Hashing
- Login-Endpunkt
- Logout
- Schutz der API-Routen

### Block 233 – Passwort-Hashing vorbereiten

Prüfen, welche Bibliothek genutzt werden soll.

Mögliche Richtung:

```text
bcrypt
```

### Block 234 – Session- oder Token-Entscheidung treffen

Entscheiden, ob Session-Cookies oder Token genutzt werden.

Für lokale App vermutlich zuerst Session-Cookie prüfen.

### Block 235 – Lokale Nutzung mit Login vorbereiten

Login für lokale Nutzung vorbereiten, aber noch ohne Freigabe ins Internet.

## Phase 5 – Nutzung außerhalb des WLANs vorbereiten

### Block 236 – Zugriffsmöglichkeiten vergleichen

Möglichkeiten vergleichen:

- VPN
- Tailscale
- Cloudflare Tunnel
- klassische Portfreigabe
- eigener Server/VPS

### Block 237 – Empfehlung festlegen

Voraussichtlich keine klassische Portfreigabe.

Wahrscheinliche sichere Richtung:

```text
VPN oder Tailscale
```

### Block 238 – HTTPS- und Domain-Konzept dokumentieren

Dokumentieren, ob und wann HTTPS oder eine Domain nötig wird.

### Block 239 – Sicherheitscheckliste für externen Zugriff erstellen

Checkliste für externen Zugriff erstellen.

Themen:

- Login
- HTTPS
- Backup
- Updates
- keine offenen Standardports
- Firewall
- Logs

### Block 240 – Projektstand aktualisieren

`docs/PROJEKTSTAND.md` aktualisieren.

Geplante Inhalte:

- Stand externe Nutzung
- Sicherheitsentscheidungen
- offene Punkte
- erledigte Blöcke 231 bis 239

### Block 241 – Raspberry Pi als dauerhaften Host vorbereiten

Dauerbetrieb vorbereiten.

Themen:

- feste IP oder DHCP-Reservierung
- Autostart
- Logs
- Backup
- Updateablauf

### Block 242 – systemd-Service für Server vorbereiten

Service-Datei für den Server planen und vorbereiten.

### Block 243 – Client-Build oder statisches Hosting planen

Entscheiden, wie der Client später dauerhaft bereitgestellt wird.

Mögliche Varianten:

- Vite dev nur Entwicklung
- Produktionsbuild
- statischer Webserver
- Reverse Proxy

### Block 244 – Testplan außerhalb des WLANs vorbereiten

Testplan erstellen, aber erst nach Authentifizierung und Sicherheitskonzept praktisch umsetzen.

### Block 245 – Projektstand erneut sichern

`docs/PROJEKTSTAND.md` erneut aktualisieren.

Geplante Inhalte:

- erledigte Blöcke 235 bis 244
- nächste Roadmap
- letzter sauberer Commit
