// client/src/components/products/ProductGrid.jsx

import { getProductHistorySummary } from "../../utils/inventoryDataUtils";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  historyItems,
  onEditProduct,
  onShowProductHistory,
  onDeactivateProduct,
  onAddProductToShoppingList,
  savingShoppingListItem,
}) {
  return (
    <div className="product-grid">
      {products.map((product) => {
        const productHistorySummary = getProductHistorySummary(
          historyItems,
          product.id,
        );

        return (
          <ProductCard
            key={product.id}
            product={product}
            productHistorySummary={productHistorySummary}
            onEditProduct={onEditProduct}
            onShowProductHistory={onShowProductHistory}
            onDeactivateProduct={onDeactivateProduct}
            onAddProductToShoppingList={onAddProductToShoppingList}
            savingShoppingListItem={savingShoppingListItem}
          />
        );
      })}
    </div>
  );
}
