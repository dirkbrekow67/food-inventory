# client/README.md

# Food Inventory – Client

React/Vite-Frontend für die Lebensmittel-Inventar-App.

## Entwicklung starten

Der Client läuft standardmäßig auf Port `5174` und ist im lokalen Netzwerk erreichbar.

```bash
cd client
npm run dev
```

Vite zeigt danach z. B.:

```text
Local:   http://localhost:5174/
Network: http://192.168.176.82:5174/
```

## Server starten

In einem zweiten Terminal den Server starten:

```bash
cd server
npm run dev
```

Der Server läuft auf Port `3101`.

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

API-Test vom Mac:

```bash
curl http://localhost:3101/api/health
curl http://192.168.176.82:3101/api/health
```

Erwartete Antwort:

```json
{ "status": "ok", "service": "food-inventory-server" }
```

## API-Adresse

Der Client ermittelt die API-Adresse automatisch aus der geöffneten Host-Adresse.

Beispiele:

```text
http://localhost:5174
→ API: http://localhost:3101/api
```

```text
http://192.168.176.82:5174
→ API: http://192.168.176.82:3101/api
```

Die Konfiguration befindet sich in:

```text
src/config/apiConfig.js
```

## Qualitätssicherung

Vor jedem Commit ausführen:

```bash
npm run build
npm run lint
```

## Hinweise

Die IP-Adresse `192.168.176.82` ist die aktuelle lokale Mac-IP. Sie kann sich durch DHCP oder Netzwerkwechsel ändern.
