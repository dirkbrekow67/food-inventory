// client/src/components/dialogs/InventoryEditDialog.jsx

import { InventoryForm } from "../inventory/InventoryForm";

export function InventoryEditDialog({
  inventoryEditDialogItem,
  inventoryEditForm,
  products,
  storageTree,
  savingInventoryEdit,
  onCloseInventoryEditDialog,
  onSaveInventoryEdit,
  onUpdateInventoryEditForm,
}) {
  if (!inventoryEditDialogItem) {
    return null;
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <div className="dialog-header">
          <div>
            <h3>Bestand bearbeiten</h3>
            <p className="muted">
              {inventoryEditDialogItem.product_name}
              {inventoryEditDialogItem.label_code
                ? ` · ${inventoryEditDialogItem.label_code}`
                : ""}
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={onCloseInventoryEditDialog}
            disabled={savingInventoryEdit}
          >
            Schließen
          </button>
        </div>

        <InventoryForm
          inventoryForm={inventoryEditForm}
          products={products}
          storageTree={storageTree}
          selectedInventoryProductHistorySummary={null}
          savingInventoryItem={savingInventoryEdit}
          onCreateInventoryItem={onSaveInventoryEdit}
          onInventoryProductChange={() => {}}
          onUpdateInventoryForm={onUpdateInventoryEditForm}
          title="Bestand bearbeiten"
          submitLabel="Änderungen speichern"
          productSelectionDisabled
        />
      </div>
    </div>
  );
}
