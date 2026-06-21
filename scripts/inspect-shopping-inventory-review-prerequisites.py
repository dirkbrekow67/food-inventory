#!/usr/bin/env python3
# scripts/inspect-shopping-inventory-review-prerequisites.py

from pathlib import Path
import sqlite3


DATABASE_PATH = Path("server/database/food_inventory.db")

RELEVANT_FILES = [
    Path("client/src/components/shopping/ShoppingListSection.jsx"),
    Path("client/src/utils/shoppingHistoryDecisionUtils.js"),
    Path("client/src/utils/shoppingListUtils.js"),
    Path("client/src/api/shoppingListApi.js"),
    Path("client/src/components/inventory/InventoryForm.jsx"),
    Path("client/src/components/inventory/InventorySection.jsx"),
    Path("client/src/utils/inventoryFormUtils.js"),
    Path("client/src/api/inventoryItemsApi.js"),
    Path("server/src/routes/shoppingListRoutes.js"),
    Path("server/src/routes/inventoryRoutes.js"),
    Path("server/src/routes/historyRoutes.js"),
]

TABLE_NAMES = [
    "shopping_list_items",
    "inventory_items",
    "inventory_history",
    "products",
    "storage_locations",
    "storage_units",
    "storage_compartments",
]

SEARCH_TERMS = [
    "shoppingList",
    "shopping_list_items",
    "completed_at",
    "product_id",
    "quantity",
    "unit",
    "inventory_items",
    "inventory_history",
    "saveInventory",
    "inventoryForm",
    "removeInventory",
    "createShoppingListHistoryTransferDecision",
    "manual_inventory_review",
    "automaticTransferAllowed",
]


def print_heading(title):
    print()
    print("=" * len(title))
    print(title)
    print("=" * len(title))


def connect_database():
    if not DATABASE_PATH.exists():
        raise FileNotFoundError(f"Datenbank nicht gefunden: {DATABASE_PATH}")

    return sqlite3.connect(DATABASE_PATH)


def get_table_columns(connection, table_name):
    rows = connection.execute(f"PRAGMA table_info({table_name});").fetchall()

    return [
        {
            "cid": row[0],
            "name": row[1],
            "type": row[2],
            "not_null": bool(row[3]),
            "default": row[4],
            "primary_key": bool(row[5]),
        }
        for row in rows
    ]


def get_table_count(connection, table_name):
    row = connection.execute(f"SELECT COUNT(*) FROM {table_name};").fetchone()

    return row[0]


def inspect_database():
    print_heading("Datenbankstruktur")

    with connect_database() as connection:
        for table_name in TABLE_NAMES:
            columns = get_table_columns(connection, table_name)

            if not columns:
                print(f"- {table_name}: nicht gefunden")
                continue

            count = get_table_count(connection, table_name)
            print(f"- {table_name}: {count} Datensätze")

            for column in columns:
                required = "NOT NULL" if column["not_null"] else "nullable"
                primary_key = "PK" if column["primary_key"] else ""
                default = f"default={column['default']}" if column["default"] is not None else ""
                details = ", ".join(value for value in [required, primary_key, default] if value)
                print(f"  - {column['name']} ({column['type']}) {details}".rstrip())


def read_file(path):
    if not path.exists():
        return None

    return path.read_text(encoding="utf-8", errors="replace")


def inspect_files():
    print_heading("Code-Fundstellen")

    for path in RELEVANT_FILES:
        text = read_file(path)

        if text is None:
            print(f"- {path}: nicht vorhanden")
            continue

        matches = []

        for term in SEARCH_TERMS:
            if term in text:
                matches.append(term)

        if matches:
            print(f"- {path}")
            print(f"  Treffer: {', '.join(matches)}")
        else:
            print(f"- {path}: keine Treffer")


def inspect_inventory_creation_requirements():
    print_heading("Vorläufige technische Bewertung")

    print("- Einkaufsliste und Bestand sind getrennte Datenbereiche.")
    print("- Erledigte Einkaufslisteneinträge enthalten Produktbezug, Menge, Einheit und Abschlusszeitpunkt.")
    print("- Bestandseinträge benötigen zusätzlich eine konkrete Lagerzuordnung.")
    print("- Ein erledigter Einkaufslisteneintrag ist deshalb kein vollständiger Bestandseintrag.")
    print("- Eine spätere Übernahme darf nur als manuelle Bestandsprüfung vorbereitet werden.")
    print("- automaticTransferAllowed bleibt fachlich false.")
    print("- Für eine produktive Bestandsanlage sind Produkt, Menge, Einheit und Lagerort/Lagerfach bewusst zu prüfen.")


def main():
    print("Prüfung: Einkaufsliste zu manueller Bestandsprüfung")
    print(f"Datenbank: {DATABASE_PATH}")

    inspect_database()
    inspect_files()
    inspect_inventory_creation_requirements()


if __name__ == "__main__":
    main()
