# Food Inventory

Lebensmittel-Inventar-App für Gefrierschrank, Kühlschrank, Vorratskammer und Auslandseinkäufe.

Das Projekt besteht aus:

- `server` – Express/SQLite-Backend
- `client` – React/Vite-Frontend

## Entwicklung starten

Es werden zwei Terminals benötigt.

### Terminal 1 – Server

```bash
cd server
npm run dev
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
cd client
npm run dev
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

## Datenbank

Die SQLite-Datenbank liegt unter:

```text
server/database/food_inventory.db
```

## Qualitätssicherung

Vor jedem Commit ausführen:

```bash
cd client
npm run build
npm run lint
```

## Hinweise

Die IP-Adresse `192.168.176.82` ist die aktuelle lokale Mac-IP. Sie kann sich durch DHCP oder Netzwerkwechsel ändern.
