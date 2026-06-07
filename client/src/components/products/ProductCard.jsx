// client/src/components/products/ProductCard.jsx

import { getBuyAgainLabel } from "../../utils/formattersUtils";

import { ProductCardHeader } from "./ProductCardHeader";

import { ProductMeta } from "./ProductMeta";

import { ProductHistoryHint } from "./ProductHistoryHint";

import { createImageSrc } from "../../utils/imageUrlUtils";

export function ProductCard({
  product,
  productHistorySummary,
  onEditProduct,
  onShowProductHistory,
  onDeactivateProduct,
  onAddProductToShoppingList,
  savingShoppingListItem,
}) {
  return (
    <article className="product-card">
      <ProductCardHeader product={product} />

      {(product.image_front || product.image_back) && (
        <div className="product-card-images">
          {product.image_front && (
            <figure>
              <img
                className="product-card-image"
                src={createImageSrc(product.image_front)}
                alt={`Produktfoto Vorderseite ${product.name}`}
              />
              <figcaption>Vorderseite</figcaption>
            </figure>
          )}

          {product.image_back && (
            <figure>
              <img
                className="product-card-image"
                src={createImageSrc(product.image_back)}
                alt={`Produktfoto Rückseite ${product.name}`}
              />
              <figcaption>Rückseite</figcaption>
            </figure>
          )}
        </div>
      )}

      <ProductMeta product={product} />

      <div className={`buy-again buy-again-${product.buy_again_status}`}>
        {getBuyAgainLabel(product.buy_again_status)}
      </div>

      <ProductHistoryHint productHistorySummary={productHistorySummary} />

      {product.notes && <p className="product-notes">{product.notes}</p>}

      <div className="product-actions">
        <button type="button" onClick={() => onEditProduct(product)}>
          Bearbeiten
        </button>

        <button
          type="button"
          onClick={() => onAddProductToShoppingList(product)}
          disabled={savingShoppingListItem}
        >
          Zur Einkaufsliste
        </button>

        {productHistorySummary.count > 0 && (
          <button type="button" onClick={() => onShowProductHistory(product)}>
            Historie anzeigen
          </button>
        )}

        <button
          type="button"
          className="danger-button"
          onClick={() => onDeactivateProduct(product.id)}
        >
          Deaktivieren
        </button>
      </div>
    </article>
  );
}
