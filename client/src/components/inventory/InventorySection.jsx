// client/src/components/inventory/InventorySection.jsx

import { useState } from "react";

import { InventoryForm } from "./InventoryForm";
import { InventoryOverview } from "./InventoryOverview";

export function InventorySection({
  inventoryForm,
  products,
  storageTree,
  hasInventoryFormDraft,
  onDiscardInventoryFormDraft,
  selectedInventoryProductHistorySummary,
  savingInventoryItem,
  inventoryItems,
  filteredInventoryItems,
  inventorySearchTerm,
  inventoryStatusFilter,
  inventoryStorageFilter,
  inventorySortMode,
  inventoryStorageFilterOptions,
  hasActiveInventoryFilters,
  loadingInventory,
  onCreateInventoryItem,
  onInventoryProductChange,
  onUpdateInventoryForm,
  onInventorySearchTermChange,
  onInventoryStatusFilterChange,
  onInventoryStorageFilterChange,
  onInventorySortModeChange,
  onResetInventoryFilters,
  onOpenRemovalDialog,
  labelScanInput,
  highlightedInventoryItemId,
  onLabelScanInputChange,
  onLabelScanSubmit,
  labelScanMessage,
  onResetLabelScan,
  onUpdateLabelPrintStatus,
  onOpenInventoryEditDialog,
  editingInventoryItemId,
  onCancelInventoryEdit,
}) {
  const [showInventoryForm, setShowInventoryForm] = useState(false);

  const shouldShowInventoryForm =
    showInventoryForm || Boolean(editingInventoryItemId);

  function openInventoryForm() {
    setShowInventoryForm(true);
  }

  function closeInventoryForm() {
    setShowInventoryForm(false);
    onCancelInventoryEdit();
  }

  async function handleCreateInventoryItem(event) {
    const savedSuccessfully = await onCreateInventoryItem(event);

    if (savedSuccessfully) {
      setShowInventoryForm(false);
    }
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Bestand</h2>
          <p>Konkrete Packungen mit Lagerort, MHD und Restmenge.</p>
        </div>

        <div className="section-header-actions">
          <span className="result-count">
            {filteredInventoryItems.length} von {inventoryItems.length}{" "}
            Einträgen
          </span>

          {!shouldShowInventoryForm && (
            <button
              type="button"
              className="secondary-button"
              onClick={openInventoryForm}
            >
              {hasInventoryFormDraft
                ? "Bestandsentwurf öffnen"
                : "Neuen Bestand erfassen"}
            </button>
          )}
        </div>
      </div>

      {hasInventoryFormDraft && !editingInventoryItemId && (
        <div className="draft-hint">
          <div>
            <strong>Gespeicherter Bestandsentwurf vorhanden.</strong>
            <p>
              Der zuletzt begonnene Bestandseintrag wurde lokal gespeichert und
              kann weiterbearbeitet werden.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button danger-outline-button"
            onClick={onDiscardInventoryFormDraft}
            disabled={savingInventoryItem}
          >
            Entwurf verwerfen
          </button>
        </div>
      )}

      {shouldShowInventoryForm && (
        <InventoryForm
          inventoryForm={inventoryForm}
          products={products}
          storageTree={storageTree}
          selectedInventoryProductHistorySummary={
            selectedInventoryProductHistorySummary
          }
          savingInventoryItem={savingInventoryItem}
          onCreateInventoryItem={handleCreateInventoryItem}
          onInventoryProductChange={onInventoryProductChange}
          onUpdateInventoryForm={onUpdateInventoryForm}
          editingInventoryItemId={editingInventoryItemId}
          onCancelInventoryEdit={closeInventoryForm}
        />
      )}

      <InventoryOverview
        inventoryItems={inventoryItems}
        filteredInventoryItems={filteredInventoryItems}
        inventorySearchTerm={inventorySearchTerm}
        inventoryStatusFilter={inventoryStatusFilter}
        inventoryStorageFilter={inventoryStorageFilter}
        inventorySortMode={inventorySortMode}
        inventoryStorageFilterOptions={inventoryStorageFilterOptions}
        hasActiveInventoryFilters={hasActiveInventoryFilters}
        loadingInventory={loadingInventory}
        onInventorySearchTermChange={onInventorySearchTermChange}
        onInventoryStatusFilterChange={onInventoryStatusFilterChange}
        onInventoryStorageFilterChange={onInventoryStorageFilterChange}
        onInventorySortModeChange={onInventorySortModeChange}
        onResetInventoryFilters={onResetInventoryFilters}
        onOpenRemovalDialog={onOpenRemovalDialog}
        onUpdateLabelPrintStatus={onUpdateLabelPrintStatus}
        labelScanInput={labelScanInput}
        highlightedInventoryItemId={highlightedInventoryItemId}
        onLabelScanInputChange={onLabelScanInputChange}
        onLabelScanSubmit={onLabelScanSubmit}
        labelScanMessage={labelScanMessage}
        onResetLabelScan={onResetLabelScan}
        onOpenInventoryEditDialog={onOpenInventoryEditDialog}
      />
    </section>
  );
}
