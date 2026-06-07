<!-- docs/PROJEKTSTAND.md -->

# Projektstand – Food Inventory

Stand: 2026-06-07

## Ziel des Projekts

Food Inventory ist eine lokale Lebensmittel-Inventar-App für Gefrierschrank, Kühlschrank, Vorratskammer und Auslandseinkäufe.

Ziel ist die strukturierte Verwaltung von Produkten, Beständen, Lagerorten, Haltbarkeiten, Historie, QR-Etiketten und später der Betrieb auf einem Raspberry Pi im lokalen Netzwerk.

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
f04a930 Document database backup retention
49e08bd Limit retained database backups
9088e9e Document Raspberry Pi backup timer setup
459c3fb Document SQLite backup dependency
908e2a9 Use SQLite backup command for database backups
```

## Arbeitsregel für Projektstand

Diese Datei wird künftig spätestens alle 10 Blöcke aktualisiert.

Geplante Aktualisierungspunkte:

```text
Block 200
Block 210
Block 220
Block 230
Block 240
```

Ziel: Bei Chatverlust reicht die aktuelle Projekt-ZIP plus diese Datei, um den Stand wieder aufzunehmen.

## Roadmap – nächste 50 Blöcke

Die folgende Roadmap ist eine Arbeitsplanung und kann angepasst werden. Die Reihenfolge ist bewusst so gewählt, dass zuerst der Bestand und die Wiederherstellung abgesichert werden. Danach folgt die Einkaufsliste. Benutzerkonto und Nutzung außerhalb des WLANs kommen später, weil diese Themen zusätzliche Sicherheits- und Betriebskonzepte benötigen.

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

`docs/PROJEKTSTAND.md` aktualisieren.

Geplante Inhalte:

- neuer letzter Commit
- abgeschlossene Blöcke 195 bis 199
- offene Punkte
- ggf. angepasste Roadmap

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

### Block 208 – Artikel abhaken und erledigen

Einträge als erledigt markieren.

Geplante Funktionen:

- abhaken
- wieder öffnen
- erledigte Einträge ausblenden
- erledigte Einträge anzeigen

### Block 209 – Erledigte Einkäufe in Historie übernehmen

Prüfen, ob erledigte Einkaufseinträge in die Historie übernommen werden sollen.

Mögliche Historieninformation:

```text
Artikel gekauft
```

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
