#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATABASE_FILE="$PROJECT_ROOT/server/database/food_inventory.db"
BACKUP_DIR="$PROJECT_ROOT/backups"

TIMESTAMP="$(date +"%Y-%m-%d_%H-%M-%S")"
BACKUP_FILE="$BACKUP_DIR/food_inventory_$TIMESTAMP.db"

if [ ! -f "$DATABASE_FILE" ]; then
  echo "Fehler: Datenbank nicht gefunden:"
  echo "$DATABASE_FILE"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

cp "$DATABASE_FILE" "$BACKUP_FILE"

echo "Datenbank-Backup erstellt:"
echo "$BACKUP_FILE"