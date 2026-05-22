// client/src/components/inventory/InventorySection.jsx

import { InventoryForm } from "./InventoryForm";
import { InventoryOverview } from "./InventoryOverview";

export function InventorySection({
  inventoryForm,
  products,
  storageTree,
  selectedInventoryProductHistorySummary,
  savingInventoryItem,
  inventoryItems,
  filteredInventoryItems,
  inventorySearchTerm,
  inventoryStatusFilter,
  inventoryStorageFilter,
  inventoryStorageFilterOptions,
  hasActiveInventoryFilters,
  loadingInventory,
  onCreateInventoryItem,
  onInventoryProductChange,
  onUpdateInventoryForm,
  onInventorySearchTermChange,
  onInventoryStatusFilterChange,
  onInventoryStorageFilterChange,
  onResetInventoryFilters,
  onOpenRemovalDialog,
  labelScanInput,
  highlightedInventoryItemId,
  onLabelScanInputChange,
  onLabelScanSubmit,
  labelScanMessage,
  onResetLabelScan,
}) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Bestand</h2>
          <p>Konkrete Packungen mit Lagerort, MHD und Restmenge.</p>
        </div>
      </div>

      <InventoryForm
        inventoryForm={inventoryForm}
        products={products}
        storageTree={storageTree}
        selectedInventoryProductHistorySummary={
          selectedInventoryProductHistorySummary
        }
        savingInventoryItem={savingInventoryItem}
        onCreateInventoryItem={onCreateInventoryItem}
        onInventoryProductChange={onInventoryProductChange}
        onUpdateInventoryForm={onUpdateInventoryForm}
      />

      <InventoryOverview
        inventoryItems={inventoryItems}
        filteredInventoryItems={filteredInventoryItems}
        inventorySearchTerm={inventorySearchTerm}
        inventoryStatusFilter={inventoryStatusFilter}
        inventoryStorageFilter={inventoryStorageFilter}
        inventoryStorageFilterOptions={inventoryStorageFilterOptions}
        hasActiveInventoryFilters={hasActiveInventoryFilters}
        loadingInventory={loadingInventory}
        onInventorySearchTermChange={onInventorySearchTermChange}
        onInventoryStatusFilterChange={onInventoryStatusFilterChange}
        onInventoryStorageFilterChange={onInventoryStorageFilterChange}
        onResetInventoryFilters={onResetInventoryFilters}
        onOpenRemovalDialog={onOpenRemovalDialog}
        labelScanInput={labelScanInput}
        highlightedInventoryItemId={highlightedInventoryItemId}
        onLabelScanInputChange={onLabelScanInputChange}
        onLabelScanSubmit={onLabelScanSubmit}
        labelScanMessage={labelScanMessage}
        onResetLabelScan={onResetLabelScan}
      />
    </section>
  );
}
