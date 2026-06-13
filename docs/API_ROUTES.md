<!-- docs/API_ROUTES.md -->

# API-Routen – Food Inventory

Stand: 2026-06-13 – nach Block 241

## Zweck dieses Dokuments

Dieses Dokument beschreibt die aktuell genutzten API-Routen der Food-Inventory-App.

Es dient als technische Übersicht für Entwicklung, Debugging, Raspberry-Pi-Betrieb und spätere Erweiterungen.

Basis-Pfad im Frontend:

- `/api`

Der Server läuft lokal standardmäßig auf:

- `http://localhost:3101`

## Übersicht

| Bereich | Methode | Pfad | Zweck |
|---|---:|---|---|
| Diagnose | GET | `/api/health` | Serverstatus prüfen |
| Lagerstruktur | GET | `/api/storage` | Lagerorte, Lagergeräte und Lagerfächer laden |
| Produkte | GET | `/api/products` | Produktliste laden |
| Produkte | POST | `/api/products` | Produkt anlegen |
| Produkte | PUT | `/api/products/:id` | Produkt bearbeiten |
| Produkte | PATCH | `/api/products/:id/deactivate` | Produkt deaktivieren |
| Bestand | GET | `/api/inventory` | Bestand laden |
| Bestand | POST | `/api/inventory` | Bestandseintrag anlegen |
| Bestand | PUT | `/api/inventory/:id` | Bestandseintrag bearbeiten |
| Bestand | DELETE | `/api/inventory/:id` | Bestand entfernen / freigeben |
| Historie | GET | `/api/history` | Historieneinträge laden |
| Historie | PUT | `/api/history/:id` | Historieneintrag bearbeiten |
| Historie | DELETE | `/api/history/:id` | Historieneintrag löschen |
| Etiketten | GET | `/api/labels/slots` | Etikettenplätze laden |
| Etiketten | PATCH | `/api/labels/:labelCode/print-status` | Druckstatus eines Etiketts ändern |
| Einkaufsliste | GET | `/api/shopping-list` | Einkaufsliste laden |
| Einkaufsliste | POST | `/api/shopping-list` | Einkaufslisteneintrag anlegen |
| Einkaufsliste | PUT | `/api/shopping-list/:id` | Einkaufslisteneintrag bearbeiten |
| Einkaufsliste | PATCH | `/api/shopping-list/:id/complete` | Einkaufslisteneintrag als erledigt markieren |
| Einkaufsliste | PATCH | `/api/shopping-list/:id/reopen` | Einkaufslisteneintrag wieder öffnen |
| Einkaufsliste | DELETE | `/api/shopping-list/:id` | Einkaufslisteneintrag löschen |

## Datenbereiche und Tabellen

### Lagerstruktur

Route:

- `GET /api/storage`

Zugehörige Tabellen:

- `storage_locations`
- `storage_units`
- `storage_compartments`

### Produkte

Routen:

- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `PATCH /api/products/:id/deactivate`

Zugehörige Tabelle:

- `products`

### Bestand

Routen:

- `GET /api/inventory`
- `POST /api/inventory`
- `PUT /api/inventory/:id`
- `DELETE /api/inventory/:id`

Zugehörige Tabellen:

- `inventory_items`
- `inventory_history`
- `label_slots`

### Historie

Routen:

- `GET /api/history`
- `PUT /api/history/:id`
- `DELETE /api/history/:id`

Zugehörige Tabelle:

- `inventory_history`

### Etiketten

Routen:

- `GET /api/labels/slots`
- `PATCH /api/labels/:labelCode/print-status`

Zugehörige Tabelle:

- `label_slots`

### Einkaufsliste

Routen:

- `GET /api/shopping-list`
- `POST /api/shopping-list`
- `PUT /api/shopping-list/:id`
- `PATCH /api/shopping-list/:id/complete`
- `PATCH /api/shopping-list/:id/reopen`
- `DELETE /api/shopping-list/:id`

Bekannter Query-Parameter:

- `includeCompleted=1`

Zugehörige Tabelle:

- `shopping_list_items`

## Offene Ergänzungen

Später sinnvoll:

- Request-Body je Route aus dem Server-Code ergänzen
- Response-Format je Route dokumentieren
- typische Fehlerfälle je Route dokumentieren
- genaue Server-Dateien je Route ergänzen
- Upload-Routen für Produktbilder prüfen und dokumentieren
- API-Dokumentation mit `docs/DATENBANK.md` abgleichen
