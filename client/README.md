<!-- client/README.md -->

# Food Inventory – Client

React/Vite-Frontend für die Lebensmittel-Inventar-App.

## Entwicklung starten

Der Client läuft standardmäßig auf Port `5174` und ist im lokalen Netzwerk erreichbar.

Bevorzugt aus dem Projekt-Hauptordner starten:

```bash
npm run dev:client
```

Vite zeigt danach z. B.:

```text
Local:   http://localhost:5174/
Network: http://192.168.176.82:5174/
```

## Server starten

In einem zweiten Terminal den Server starten.

Bevorzugt aus dem Projekt-Hauptordner:

```bash
npm run dev:server
```

Alternativ direkt aus dem Server-Ordner:

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

## Entwicklungsanzeige der API-Adresse

Im Entwicklungsmodus zeigt die App oben im Kopfbereich die aktuell verwendete API-Adresse an.

Beispiel am Mac:

```text
API: http://localhost:3101/api
```

Beispiel auf dem Handy im lokalen Netzwerk:

```text
API: http://192.168.176.82:3101/api
```

Diese Anzeige erscheint nur bei `npm run dev:client` bzw. `npm run dev` im Client-Ordner und nicht im Produktions-Build.

## Qualitätssicherung

Vor jedem Commit bevorzugt aus dem Projekt-Hauptordner ausführen:

```bash
npm run check:client
```

Alternativ direkt aus dem Client-Ordner:

```bash
cd client
npm run build
npm run lint
```

## Hinweise

Die IP-Adresse `192.168.176.82` ist die aktuelle lokale Mac-IP. Sie kann sich durch DHCP oder Netzwerkwechsel ändern.
