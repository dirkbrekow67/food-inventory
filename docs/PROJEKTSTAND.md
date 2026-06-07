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

## Offene sinnvolle nächste Blöcke

### Block 195 – README auf Dopplungen prüfen

Die README enthält aktuell bewusst viele Informationen. Als nächster Schritt kann geprüft werden, ob Abschnitte wie Datenbank, Qualitätssicherung und Raspberry-Pi-Hinweise gestrafft werden sollen.

### Block 196 – Backup-Wiederherstellung dokumentieren

Es fehlt noch eine Anleitung, wie ein Backup wiederhergestellt wird.

Beispielthemen:

- Server stoppen
- aktuelle Datenbank sichern
- Backup zurückkopieren
- Server neu starten
- Funktion prüfen

### Block 197 – Upload- und Bildspeicher dokumentieren

Es sollte dokumentiert werden, wie Produktbilder gespeichert werden und wie mit alten oder nicht mehr verwendeten Uploads umgegangen wird.

### Block 198 – QR-Scannerlogik prüfen

Die Scannerlogik sollte final darauf geprüft werden, ob alle Varianten erkannt werden:

```text
F038
FI:F038
URL mit ?label=F038
ältere JSON-QR-Codes
```

### Block 199 – Raspberry-Pi-Systembetrieb vorbereiten

Später sinnvoll:

- systemd-Service für Server
- systemd-Service oder Build/Preview für Client
- Autostart
- Logprüfung
- Updateablauf

### Block 200 – Projektstand erneut sichern

Nach den nächsten Schritten sollte der Projektstand erneut in dieser Datei aktualisiert werden.
