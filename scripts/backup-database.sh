#!/usr/bin/env bash
# scripts/backup-database.sh

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATABASE_FILE="$PROJECT_ROOT/server/database/food_inventory.db"
BACKUP_DIR="$PROJECT_ROOT/backups"
BACKUP_RETENTION_COUNT=12

TIMESTAMP="$(date +"%Y-%m-%d_%H-%M-%S")"
BACKUP_FILE="$BACKUP_DIR/food_inventory_$TIMESTAMP.db"

if [ ! -f "$DATABASE_FILE" ]; then
  echo "Fehler: Datenbank nicht gefunden:"
  echo "$DATABASE_FILE"
  exit 1
fi

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "Fehler: sqlite3 ist nicht installiert."
  echo "Installation auf Debian/Raspberry Pi z. B.:"
  echo "sudo apt install sqlite3"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

sqlite3 "$DATABASE_FILE" ".backup '$BACKUP_FILE'"

echo "Datenbank-Backup erstellt:"
echo "$BACKUP_FILE"

OLD_BACKUPS="$(
  find "$BACKUP_DIR" -maxdepth 1 -type f -name "food_inventory_*.db" \
    | sort -r \
    | tail -n +"$((BACKUP_RETENTION_COUNT + 1))"
)"

if [ -n "$OLD_BACKUPS" ]; then
  echo "Alte Backups werden gelöscht. Es bleiben die letzten $BACKUP_RETENTION_COUNT Sicherungen erhalten."

  echo "$OLD_BACKUPS" | while IFS= read -r OLD_BACKUP; do
    if [ -n "$OLD_BACKUP" ]; then
      rm -f "$OLD_BACKUP"
      echo "Gelöscht: $OLD_BACKUP"
    fi
  done
fi