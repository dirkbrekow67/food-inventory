// client/src/components/inventory/InventoryList.jsx

import { InventoryCard } from "./InventoryCard";

export function InventoryList({ filteredInventoryItems, onOpenRemovalDialog }) {
  return (
    <div className="inventory-list">
      {filteredInventoryItems.map((item) => (
        <InventoryCard
          item={item}
          key={item.id}
          onOpenRemovalDialog={onOpenRemovalDialog}
        />
      ))}
    </div>
  );
}
