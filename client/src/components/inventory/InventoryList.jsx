// client/src/components/inventory/InventoryList.jsx

import { InventoryCard } from "./InventoryCard";

export function InventoryList({
  filteredInventoryItems,
  highlightedInventoryItemId,
  onOpenRemovalDialog,
  onOpenInventoryEditDialog,
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
          onUpdateLabelPrintStatus={onUpdateLabelPrintStatus}
          isHighlighted={item.id === highlightedInventoryItemId}
        />
      ))}
    </div>
  );
}
