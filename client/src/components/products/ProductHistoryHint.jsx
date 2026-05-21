// client/src/components/products/ProductHistoryHint.jsx

import {
  getBuyAgainLabel,
  getExperienceReasonLabel,
  getRemovalReasonLabel,
} from "../../utils/formattersUtils";

export function ProductHistoryHint({ productHistorySummary }) {
  if (productHistorySummary.count === 0) {
    return null;
  }

  return (
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
  );
}
