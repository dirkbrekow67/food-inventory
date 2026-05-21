// client/src/components/inventory/InventoryOverview.jsx

import { InventoryCard } from "./InventoryCard";

import { InventoryToolbar } from "./InventoryToolbar";

export function InventoryOverview({
  inventoryItems,
  filteredInventoryItems,
  inventorySearchTerm,
  inventoryStatusFilter,
  inventoryStorageFilter,
  inventoryStorageFilterOptions,
  hasActiveInventoryFilters,
  loadingInventory,
  onInventorySearchTermChange,
  onInventoryStatusFilterChange,
  onInventoryStorageFilterChange,
  onResetInventoryFilters,
  onOpenRemovalDialog,
}) {
  return (
    <>
      <div className="inventory-overview-header">
        <div>
          <h3>Bestandsübersicht</h3>
          <p className="muted">
            Suche und Filter für vorhandene Packungen, Dosen und Gebinde.
          </p>
        </div>

        <span className="result-count">
          {filteredInventoryItems.length} von {inventoryItems.length} Einträgen
        </span>
      </div>

      <InventoryToolbar
        inventorySearchTerm={inventorySearchTerm}
        inventoryStatusFilter={inventoryStatusFilter}
        inventoryStorageFilter={inventoryStorageFilter}
        inventoryStorageFilterOptions={inventoryStorageFilterOptions}
        hasActiveInventoryFilters={hasActiveInventoryFilters}
        onInventorySearchTermChange={onInventorySearchTermChange}
        onInventoryStatusFilterChange={onInventoryStatusFilterChange}
        onInventoryStorageFilterChange={onInventoryStorageFilterChange}
        onResetInventoryFilters={onResetInventoryFilters}
      />

      {loadingInventory && <p className="muted">Bestand wird geladen...</p>}

      {!loadingInventory && inventoryItems.length === 0 && (
        <p className="muted">Noch kein Bestand vorhanden.</p>
      )}

      {!loadingInventory &&
        inventoryItems.length > 0 &&
        filteredInventoryItems.length === 0 && (
          <p className="muted">Keine passenden Bestandseinträge gefunden.</p>
        )}

      <div className="inventory-list">
        {filteredInventoryItems.map((item) => (
          <InventoryCard
            item={item}
            key={item.id}
            onOpenRemovalDialog={onOpenRemovalDialog}
          />
        ))}
      </div>
    </>
  );
}
