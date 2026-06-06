# Food Inventory

Lebensmittel-Inventar-App für Gefrierschrank, Kühlschrank, Vorratskammer und Auslandseinkäufe.

Das Projekt besteht aus:

- `server` – Express/SQLite-Backend
- `client` – React/Vite-Frontend

## Entwicklung starten

Es werden zwei Terminals benötigt. Die Befehle können direkt aus dem Projekt-Hauptordner ausgeführt werden.

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

## Qualitätssicherung

Vor jedem Commit ausführen:

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
