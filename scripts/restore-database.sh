#!/usr/bin/env bash
# scripts/restore-database.sh

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATABASE_FILE="$PROJECT_ROOT/server/database/food_inventory.db"
SAFETY_BACKUP_FILE="$PROJECT_ROOT/server/database/food_inventory_before_restore_$(date +"%Y-%m-%d_%H-%M-%S").db"

if [ "$#" -ne 1 ]; then
  echo "Verwendung:"
  echo "./scripts/restore-database.sh backups/food_inventory_YYYY-MM-DD_HH-MM-SS.db"
  exit 1
fi

RESTORE_SOURCE="$1"

if [ ! -f "$RESTORE_SOURCE" ]; then
  echo "Fehler: Backup-Datei nicht gefunden:"
  echo "$RESTORE_SOURCE"
  exit 1
fi

if [ ! -f "$DATABASE_FILE" ]; then
  echo "Fehler: aktuelle Datenbank nicht gefunden:"
  echo "$DATABASE_FILE"
  exit 1
fi

echo "WARNUNG: Die aktuelle Datenbank wird durch dieses Backup ersetzt."
echo
echo "Aktuelle Datenbank:"
echo "$DATABASE_FILE"
echo
echo "Wiederherstellung aus:"
echo "$RESTORE_SOURCE"
echo
echo "Vorherige Sicherheitskopie wird erstellt unter:"
echo "$SAFETY_BACKUP_FILE"
echo

read -r -p "Zum Fortfahren exakt RESTORE eingeben: " CONFIRMATION

if [ "$CONFIRMATION" != "RESTORE" ]; then
  echo "Abgebrochen. Es wurde nichts geändert."
  exit 1
fi

cp "$DATABASE_FILE" "$SAFETY_BACKUP_FILE"
cp "$RESTORE_SOURCE" "$DATABASE_FILE"

echo
echo "Datenbank wurde wiederhergestellt."
echo
echo "Sicherheitskopie der vorherigen Datenbank:"
echo "$SAFETY_BACKUP_FILE"
echo
echo "Bitte Server neu starten und Funktion prüfen:"
echo "npm run dev:server"
echo "curl http://localhost:3101/api/health"