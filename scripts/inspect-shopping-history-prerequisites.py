#!/usr/bin/env python3
# scripts/inspect-shopping-history-prerequisites.py

from __future__ import annotations

import sqlite3
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATABASE_PATH = PROJECT_ROOT / "server" / "database" / "food_inventory.db"

TABLE_NAMES = [
    "shopping_list_items",
    "inventory_history",
    "inventory_items",
    "products",
]

SEARCH_DIRECTORIES = [
    PROJECT_ROOT / "server" / "routes",
    PROJECT_ROOT / "server" / "database",
    PROJECT_ROOT / "client" / "src" / "api",
    PROJECT_ROOT / "client" / "src" / "components" / "shopping",
    PROJECT_ROOT / "client" / "src" / "utils",
]

KEYWORDS = [
    "shopping_list_items",
    "inventory_history",
    "inventory_items",
    "completed_at",
    "complete",
    "reopen",
    "history",
    "remove",
    "consume",
    "consumption",
    "quantity",
    "remaining",
    "removal_reason",
    "product_buy_again_status_after_removal",
]


def print_heading(title: str) -> None:
    print()
    print(title)
    print("=" * len(title))


def print_subheading(title: str) -> None:
    print()
    print(title)
    print("-" * len(title))


def connect_database() -> sqlite3.Connection:
    if not DATABASE_PATH.exists():
        raise FileNotFoundError(f"Datenbank nicht gefunden: {DATABASE_PATH}")

    return sqlite3.connect(DATABASE_PATH)


def get_table_names(connection: sqlite3.Connection) -> set[str]:
    rows = connection.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
    ).fetchall()

    return {row[0] for row in rows}


def print_table_columns(connection: sqlite3.Connection, table_name: str) -> None:
    print_subheading(f"Tabelle: {table_name}")

    rows = connection.execute(f"PRAGMA table_info({table_name});").fetchall()

    if not rows:
        print("Keine Spalten gefunden.")
        return

    for _, name, column_type, not_null, default_value, primary_key in rows:
        not_null_text = "NOT NULL" if not_null else "nullable"
        primary_key_text = "PK" if primary_key else ""
        default_text = f"default={default_value}" if default_value is not None else ""

        print(
            f"- {name}: {column_type or 'ohne Typ'} "
            f"{not_null_text} {primary_key_text} {default_text}".strip()
        )


def print_table_counts(connection: sqlite3.Connection, table_name: str) -> None:
    try:
        count = connection.execute(f"SELECT COUNT(*) FROM {table_name};").fetchone()[0]
    except sqlite3.Error as error:
        print(f"Anzahl konnte nicht gelesen werden: {error}")
        return

    print(f"Datensätze: {count}")


def inspect_database() -> None:
    print_heading("Datenbankprüfung Einkaufsliste, Historie und Bestand")
    print(f"Datenbank: {DATABASE_PATH.relative_to(PROJECT_ROOT)}")

    with connect_database() as connection:
        existing_table_names = get_table_names(connection)

        for table_name in TABLE_NAMES:
            if table_name not in existing_table_names:
                print_subheading(f"Tabelle fehlt: {table_name}")
                continue

            print_table_columns(connection, table_name)
            print_table_counts(connection, table_name)


def iter_code_files() -> list[Path]:
    code_files = []

    for search_directory in SEARCH_DIRECTORIES:
        if not search_directory.exists():
            continue

        for path in sorted(search_directory.rglob("*")):
            if path.suffix not in {".js", ".jsx"}:
                continue

            code_files.append(path)

    return code_files


def get_matching_lines(path: Path) -> list[tuple[int, str]]:
    text = path.read_text(encoding="utf-8")
    matching_lines = []

    for line_number, line in enumerate(text.splitlines(), start=1):
        normalized_line = line.lower()

        if any(keyword.lower() in normalized_line for keyword in KEYWORDS):
            matching_lines.append((line_number, line.rstrip()))

    return matching_lines


def inspect_code_files() -> None:
    print_heading("Codeprüfung relevante Fundstellen")

    matching_file_count = 0

    for path in iter_code_files():
        matching_lines = get_matching_lines(path)

        if not matching_lines:
            continue

        matching_file_count += 1
        relative_path = path.relative_to(PROJECT_ROOT)

        print_subheading(str(relative_path))

        for line_number, line in matching_lines:
            print(f"{line_number}: {line}")

    if matching_file_count == 0:
        print("Keine relevanten Fundstellen gefunden.")


def print_summary() -> None:
    print_heading("Vorläufige technische Bewertung")
    print("- Die Prüfung verändert keine Datenbankdaten.")
    print("- Einkaufsliste, Historie und Bestand werden getrennt betrachtet.")
    print("- Entscheidend für eine spätere Anbindung sind Produktbezug, Mengenfelder, Statusfelder und Historienfelder.")
    print("- Das Skript sucht die relevanten Code-Fundstellen dynamisch in Server-, Client-API-, Shopping- und Utils-Dateien.")
    print("- Eine produktive Verknüpfung sollte erst nach fachlicher Klärung des Datenflusses erfolgen.")


def main() -> None:
    inspect_database()
    inspect_code_files()
    print_summary()


if __name__ == "__main__":
    main()
