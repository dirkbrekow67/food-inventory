// client/src/components/inventory/InventoryList.jsx

import { InventoryCard } from "./InventoryCard";

export function InventoryList({
  filteredInventoryItems,
  highlightedInventoryItemId,
  onOpenRemovalDialog,
  onOpenInventoryEditDialog,
  onOpenInventoryProduct,
  onUpdateLabelPrintStatus,
}) {
  return (
    <div className="inventory-list">
      {filteredInventoryItems.map((item) => (
        <InventoryCard
          item={item}
          key={item.id}
          onOpenRemovalDialog={onOpenRemovalDialog}
          onOpenInventoryEditDialog={onOpenInventoryEditDialog}
          onOpenInventoryProduct={onOpenInventoryProduct}
          onUpdateLabelPrintStatus={onUpdateLabelPrintStatus}
          isHighlighted={item.id === highlightedInventoryItemId}
        />
      ))}
    </div>
  );
}
