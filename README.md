<!-- README.md -->

# Food Inventory

Lebensmittel-Inventar-App für Gefrierschrank, Kühlschrank, Vorratskammer und Auslandseinkäufe.

Das Projekt besteht aus:

- `server` – Express/SQLite-Backend
- `client` – React/Vite-Frontend

## Entwicklung starten

Es werden zwei Terminals benötigt. Die Befehle können direkt aus dem Projekt-Hauptordner ausgeführt werden.

### Abhängigkeiten installieren

Nach dem ersten Klonen oder Entpacken des Projekts einmalig aus dem Projekt-Hauptordner ausführen:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### Terminal 1 – Server

```bash
npm run dev:server
```

Der Server läuft auf Port `3101`.

API-Test:

```bash
curl http://localhost:3101/api/health
```

Erwartete Antwort:

```json
{ "status": "ok", "service": "food-inventory-server" }
```

### Terminal 2 – Client

```bash
npm run dev:client
```

Der Client läuft auf Port `5174`.

Vite zeigt z. B.:

```text
Local:   http://localhost:5174/
Network: http://192.168.176.82:5174/
```

## Handytest im lokalen Netzwerk

Voraussetzungen:

- Mac und Handy sind im selben WLAN.
- Server läuft.
- Client läuft.
- Die Mac-IP ist erreichbar.

Auf dem Handy öffnen:

```text
http://192.168.176.82:5174
```

API-Test mit Mac-IP:

```bash
curl http://192.168.176.82:3101/api/health
```

## Start auf dem Raspberry Pi

Geplanter Projektpfad auf dem Raspberry Pi:

```text
~/projekte/food-inventory
```

### Projekt aktualisieren

```bash
cd ~/projekte/food-inventory
git pull
```

### Abhängigkeiten installieren oder aktualisieren

Nach dem ersten Klonen oder nach Änderungen an `package.json` aus dem Projekt-Hauptordner ausführen:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### Server starten

```bash
npm run dev:server
```

Der Server läuft auf Port `3101`.

API-Test direkt auf dem Raspberry Pi:

```bash
curl http://localhost:3101/api/health
```

Erwartete Antwort:

```json
{ "status": "ok", "service": "food-inventory-server" }
```

API-Test aus dem lokalen Netzwerk, Beispiel:

```bash
curl http://192.168.176.89:3101/api/health
```

### Client starten

In einem zweiten Terminal:

```bash
cd ~/projekte/food-inventory
npm run dev:client
```

Der Client läuft auf Port `5174`.

Vite zeigt z. B.:

```text
Local:   http://localhost:5174/
Network: http://192.168.176.89:5174/
```

Auf einem Handy oder Mac im selben Netzwerk öffnen:

```text
http://192.168.176.89:5174
```

### QR-Code-Basisadresse auf dem Raspberry Pi

Für QR-Codes muss die lokale Raspberry-Pi-Adresse in `client/.env.local` stehen, nicht `localhost`.

Beispiel:

```env
VITE_APP_BASE_URL=http://192.168.176.89:5174
```

Die Vorlage liegt in:

```text
client/.env.example
```

Falls die Datei `client/.env.local` noch nicht existiert:

```bash
cp client/.env.example client/.env.local
```

Danach `client/.env.local` prüfen und die passende Raspberry-Pi-IP eintragen.

### IP-Adresse des Raspberry Pi prüfen

```bash
hostname -I
```

Die IP-Adresse kann sich durch DHCP oder Netzwerkwechsel ändern. Wenn sich die IP ändert, muss auch `client/.env.local` angepasst werden, damit neue QR-Codes auf die richtige Adresse zeigen.

### Datenbank auf dem Raspberry Pi

Die SQLite-Datenbank liegt unter:

```text
server/database/food_inventory.db
```

Vor größeren Änderungen sollte die Datenbank gesichert werden.

### Qualitätssicherung auf dem Raspberry Pi

Vor Commits mit Client-Änderungen:

```bash
npm run check:client
```

Dieser Befehl führt im Client nacheinander aus:

```bash
npm run build
npm run lint
```

## Entwicklungsanzeige der API-Adresse und Serverstatus

Im Entwicklungsmodus zeigt die App oben im Kopfbereich die aktuell verwendete API-Adresse und den Serverstatus an.

Beispiel am Mac:

```text
API: http://localhost:3101/api · Server erreichbar
```

Beispiel auf dem Handy im lokalen Netzwerk:

```text
API: http://192.168.176.82:3101/api · Server erreichbar
```

Wenn der Server nicht erreichbar ist, erscheint entsprechend:

```text
Server nicht erreichbar
```

Diese Anzeige erscheint nur bei `npm run dev:client` und nicht im Produktions-Build.

## Lokal gespeicherte Einstellungen

Die App speichert einige Einstellungen lokal im Browser, damit sie nach dem Neuladen erhalten bleiben.

Gespeichert werden derzeit:

- aktive Hauptseite, z. B. Bestand, Produkte, Historie
- Produktfilter
- Bestandsfilter
- Historienfilter
- Anzeigeoption „Produkte in Bestandsansicht ein-/ausblenden“
- Produktentwürfe
- Bestandsentwürfe

Die Speicherung erfolgt über `localStorage` des jeweiligen Browsers und Geräts. Die Werte werden nicht automatisch zwischen Mac, Handy oder Raspberry Pi synchronisiert.

## Datenbank

Die SQLite-Datenbank liegt unter:

```text
server/database/food_inventory.db
```

## Datensicherung

Die SQLite-Datenbank enthält die eigentlichen Inventardaten und sollte vor größeren Änderungen sowie regelmäßig auf dem Raspberry Pi gesichert werden.

Die Datenbank liegt unter:

```text
server/database/food_inventory.db
```

### Manuelles Datenbank-Backup

Aus dem Projekt-Hauptordner ausführen:

```bash
./scripts/backup-database.sh
```

Das Backup wird im Ordner `backups/` abgelegt.

Beispiel:

```text
backups/food_inventory_2026-06-07_09-47-28.db
```

Der Ordner `backups/` ist in `.gitignore` eingetragen. Lokale Backups werden daher nicht in Git übernommen.

### Voraussetzung für das Backup-Skript

Das Backup-Skript verwendet die SQLite-eigene Backup-Funktion. Dafür muss auf dem jeweiligen System `sqlite3` installiert sein.

Installation auf Debian/Raspberry Pi:

```bash
sudo apt install sqlite3
```

Installation auf macOS mit Homebrew:

```bash
brew install sqlite
```

### Backup prüfen

```bash
ls -lh backups
```

### Backup-Aufbewahrung

Das Backup-Skript behält automatisch nur die letzten 12 Datenbank-Backups im Ordner `backups/`.

Ältere Sicherungen mit diesem Muster werden nach einem neuen Backup automatisch gelöscht:

```text
food_inventory_*.db
```

Die Anzahl der aufzubewahrenden Backups ist im Skript festgelegt:

```bash
BACKUP_RETENTION_COUNT=12
```

Das Skript liegt unter:

```text
scripts/backup-database.sh
```

### Empfehlung für den Raspberry Pi

Auf dem Raspberry Pi sollte die Datenbank zusätzlich automatisch gesichert werden, mindestens einmal wöchentlich.

Empfohlene Strategie:

```text
1× wöchentlich automatisches Backup
+ manuelles Backup vor größeren Änderungen
+ regelmäßiges Kopieren wichtiger Backups auf Mac, NAS, externe Festplatte oder Cloud
```

Ein lokales Backup auf dem Raspberry Pi schützt vor versehentlichem Löschen oder fehlerhaften Änderungen. Gegen Defekte der SD-Karte, SSD oder des Raspberry Pi selbst schützt es nur, wenn die Sicherung zusätzlich auf ein anderes Gerät kopiert wird.

### Automatisches wöchentliches Backup auf dem Raspberry Pi

Für den Raspberry Pi sind vorbereitete `systemd`-Dateien im Projekt enthalten:

```text
scripts/raspi/food-inventory-backup.service
scripts/raspi/food-inventory-backup.timer
```

Der Timer führt das Backup-Skript einmal wöchentlich aus.

Geplanter Zeitpunkt:

```text
Sonntag, 03:30 Uhr
```

Die Einstellung steht in:

```text
scripts/raspi/food-inventory-backup.timer
```

### systemd-Timer installieren

Auf dem Raspberry Pi aus dem Projekt-Hauptordner ausführen:

```bash
cd ~/projekte/food-inventory
sudo cp scripts/raspi/food-inventory-backup.service /etc/systemd/system/
sudo cp scripts/raspi/food-inventory-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now food-inventory-backup.timer
```

### Timer prüfen

```bash
systemctl list-timers | grep food-inventory
```

Status des Timers anzeigen:

```bash
systemctl status food-inventory-backup.timer
```

Status des letzten Backup-Laufs anzeigen:

```bash
systemctl status food-inventory-backup.service
```

Logs des Backup-Laufs anzeigen:

```bash
journalctl -u food-inventory-backup.service
```

### Backup aus einer Sicherung wiederherstellen

Ein Datenbank-Backup sollte nur wiederhergestellt werden, wenn klar ist, welche Sicherung verwendet werden soll.

Vor dem Wiederherstellen wird die aktuelle Datenbank zusätzlich gesichert, damit sie bei Bedarf wieder zurückkopiert werden kann.

#### 1. Server stoppen

Falls der Server im Terminal läuft, den Server mit `CTRL + C` beenden.

Falls später ein systemd-Service für den Server verwendet wird, muss dieser vor der Wiederherstellung gestoppt werden.

#### 2. Vorhandene Backups anzeigen

Aus dem Projekt-Hauptordner ausführen:

```bash
ls -lh backups
```

Beispiel:

```text
food_inventory_2026-06-07_09-47-28.db
```

#### 3. Aktuelle Datenbank vorsichtshalber zusätzlich sichern

```bash
cp server/database/food_inventory.db "server/database/food_inventory_before_restore_$(date +"%Y-%m-%d_%H-%M-%S").db"
```

#### 4. Gewünschtes Backup zurückkopieren

Den Dateinamen im folgenden Befehl an das gewünschte Backup anpassen:

```bash
cp backups/food_inventory_YYYY-MM-DD_HH-MM-SS.db server/database/food_inventory.db
```

Beispiel:

```bash
cp backups/food_inventory_2026-06-07_09-47-28.db server/database/food_inventory.db
```

#### 5. Server neu starten

```bash
npm run dev:server
```

#### 6. Funktion prüfen

In einem zweiten Terminal prüfen:

```bash
curl http://localhost:3101/api/health
```

Erwartete Antwort:

```json
{ "status": "ok", "service": "food-inventory-server" }
```

Danach die App im Browser öffnen und Bestand, Produkte und Historie prüfen.

#### Hinweis

Die Wiederherstellung ersetzt nur die SQLite-Datenbank.

Produktbilder im Ordner `server/uploads/products/` werden dadurch nicht wiederhergestellt. Dafür ist später eine separate Sicherung der Upload-Dateien erforderlich.

### Produktbilder und Upload-Dateien sichern

Die Datenbank-Backups sichern nur die SQLite-Datenbank.

Produktbilder werden separat im Projektordner gespeichert und sind nicht Bestandteil der Datei:

```text
server/database/food_inventory.db
```

Der Speicherort für hochgeladene Produktbilder ist:

```text
server/uploads/products/
```

Dieser Ordner enthält z. B. Bilder der Vorderseite und Rückseite von Produkten.

Der Upload-Ordner ist bewusst nicht Bestandteil von Git. Produktbilder sollen nicht versehentlich in das Repository hochgeladen werden.

Wichtig:

```text
Ein Datenbank-Backup allein reicht nicht aus, um Produktbilder wiederherzustellen.
```

Für eine vollständige Sicherung müssen daher später zusätzlich gesichert werden:

```text
server/database/food_inventory.db
server/uploads/products/
```

Bis eine automatische Upload-Sicherung eingebaut ist, sollten wichtige Produktbilder bei Bedarf manuell mitgesichert werden.

Beispiel für eine manuelle Sicherung des Upload-Ordners:

```bash
mkdir -p backups/uploads
cp -R server/uploads/products "backups/uploads/products_$(date +"%Y-%m-%d_%H-%M-%S")"
```

Hinweis: Diese manuelle Sicherung wird im lokalen Ordner `backups/` abgelegt und nicht in Git übernommen.

### Backup manuell über systemd starten

```bash
sudo systemctl start food-inventory-backup.service
```

Danach prüfen:

```bash
ls -lh ~/projekte/food-inventory/backups
```

### systemd-Timer deaktivieren

```bash
sudo systemctl disable --now food-inventory-backup.timer
```

## Qualitätssicherung

Vor jedem Commit, der Client-Code betrifft, ausführen:

```bash
npm run check:client
```

Dieser Befehl führt im Client nacheinander aus:

```bash
npm run build
npm run lint
```

## Hinweise

Die IP-Adresse `192.168.176.82` ist die aktuelle lokale Mac-IP. Sie kann sich durch DHCP oder Netzwerkwechsel ändern.
