// client/src/components/products/ProductCard.jsx

import { getBuyAgainLabel } from "../../utils/formattersUtils";

import { ProductCardHeader } from "./ProductCardHeader";

import { ProductMeta } from "./ProductMeta";

import { ProductHistoryHint } from "./ProductHistoryHint";

export function ProductCard({
  product,
  productHistorySummary,
  onEditProduct,
  onShowProductHistory,
  onDeactivateProduct,
}) {
  return (
    <article className="product-card">
      <ProductCardHeader product={product} />

      {product.image_front && (
        <img
          className="product-card-image"
          src={product.image_front}
          alt={`Produktfoto ${product.name}`}
        />
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
