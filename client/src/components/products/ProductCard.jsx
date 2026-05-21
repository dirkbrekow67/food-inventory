// client/src/components/products/ProductCard.jsx

import {
  getBuyAgainLabel,
  getExperienceReasonLabel,
  getRemovalReasonLabel,
} from "../../utils/formattersUtils";

export function ProductCard({
  product,
  productHistorySummary,
  onEditProduct,
  onShowProductHistory,
  onDeactivateProduct,
}) {
  return (
    <article className="product-card">
      <div className="product-card-header">
        <div>
          <h3>{product.name}</h3>
          <p className="muted">
            {[product.brand, product.category].filter(Boolean).join(" · ")}
          </p>
        </div>
        {product.favorite === 1 && <span className="favorite">★</span>}
      </div>

      <div className="product-meta">
        {product.country && <span>{product.country}</span>}
        {product.store && <span>{product.store}</span>}
        {product.rating && <span>{product.rating}/5</span>}
      </div>

      <div className={`buy-again buy-again-${product.buy_again_status}`}>
        {getBuyAgainLabel(product.buy_again_status)}
      </div>

      {productHistorySummary.count > 0 && (
        <div className="product-history-hint">
          <strong>
            Historie: {productHistorySummary.count}{" "}
            {productHistorySummary.count === 1 ? "Eintrag" : "Einträge"}
          </strong>

          {productHistorySummary.latestItem && (
            <span>
              Letzte Erfahrung:{" "}
              {getRemovalReasonLabel(
                productHistorySummary.latestItem.removal_reason,
              )}
              {productHistorySummary.latestItem
                .product_buy_again_status_after_removal
                ? ` · ${getBuyAgainLabel(
                    productHistorySummary.latestItem
                      .product_buy_again_status_after_removal,
                  )}`
                : ""}
              {productHistorySummary.latestItem.experience_reason
                ? ` · ${getExperienceReasonLabel(
                    productHistorySummary.latestItem.experience_reason,
                  )}`
                : ""}
            </span>
          )}
        </div>
      )}

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
