// client/src/components/inventory/InventoryToolbar.jsx

import {
  inventorySortOptions,
  inventoryStatusFilterOptions,
} from "../../constants/selectOptions";

import { renderSelectOptions } from "../form/FormSelectOptions";

export function InventoryToolbar({
  inventorySearchTerm,
  inventoryStatusFilter,
  inventoryStorageFilter,
  inventorySortMode,
  inventoryStorageFilterOptions,
  hasActiveInventoryFilters,
  onInventorySearchTermChange,
  onInventoryStatusFilterChange,
  onInventoryStorageFilterChange,
  onInventorySortModeChange,
  onResetInventoryFilters,
}) {
  return (
    <div className="inventory-toolbar">
      <label className="inventory-search">
        Bestand suchen
        <input
          type="search"
          value={inventorySearchTerm}
          onChange={(event) => onInventorySearchTermChange(event.target.value)}
          placeholder="z. B. Pommes, Coop, Wohnzimmer, Schublade 2"
        />
      </label>

      <div className="inventory-filter-row">
        <label>
          Status
          <select
            value={inventoryStatusFilter}
            onChange={(event) =>
              onInventoryStatusFilterChange(event.target.value)
            }
          >
            {renderSelectOptions(inventoryStatusFilterOptions)}
          </select>
        </label>

        <label>
          Lagergerät
          <select
            value={inventoryStorageFilter}
            onChange={(event) =>
              onInventoryStorageFilterChange(event.target.value)
            }
          >
            <option value="all">Alle Lagergeräte</option>
            {inventoryStorageFilterOptions.map((option) => (
              <option value={option.id} key={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sortierung
          <select
            value={inventorySortMode}
            onChange={(event) => onInventorySortModeChange(event.target.value)}
          >
            {renderSelectOptions(inventorySortOptions)}
          </select>
        </label>

        <button
          type="button"
          className="secondary-button"
          onClick={onResetInventoryFilters}
          disabled={!hasActiveInventoryFilters}
        >
          Filter zurücksetzen
        </button>
      </div>
    </div>
  );
}
