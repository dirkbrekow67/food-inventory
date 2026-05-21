// client/src/components/history/HistoryList.jsx

import {
  formatDateGerman,
  getBuyAgainLabel,
  getExperienceReasonLabel,
  getRemovalReasonLabel,
} from "../../utils/formattersUtils";

export function HistoryList({
  filteredHistoryItems,
  onOpenHistoryDialog,
  onOpenHistoryDeleteDialog,
}) {
  return (
    <div className="history-list">
      {filteredHistoryItems.map((item) => (
        <article className="history-card" key={item.id}>
          <div className="history-card-header">
            <div>
              <h3>{item.product_name}</h3>
              <p className="muted">
                {[item.product_brand, item.product_category]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            <div className="inventory-status-group">
              {item.label_code && (
                <span className="label-code">{item.label_code}</span>
              )}

              {item.product_favorite === 1 && (
                <span className="favorite-badge">★ Standardartikel</span>
              )}

              <span className="history-reason">
                {getRemovalReasonLabel(item.removal_reason)}
              </span>

              {item.product_buy_again_status_after_removal && (
                <span
                  className={`buy-again buy-again-${item.product_buy_again_status_after_removal}`}
                >
                  {getBuyAgainLabel(
                    item.product_buy_again_status_after_removal,
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="history-meta">
            {item.product_country && <span>{item.product_country}</span>}

            {item.product_store && (
              <span>
                {item.product_store.toLowerCase() === "egal"
                  ? "Bezugsquelle beliebig"
                  : item.product_store}
              </span>
            )}

            {item.removed_at && (
              <span>
                Entfernt: {formatDateGerman(item.removed_at.slice(0, 10))}
              </span>
            )}

            {item.experience_reason && item.experience_reason !== "keine" && (
              <span>{getExperienceReasonLabel(item.experience_reason)}</span>
            )}
          </div>

          {item.experience_note && (
            <p className="product-notes">{item.experience_note}</p>
          )}

          {item.notes && <p className="history-technical-note">{item.notes}</p>}

          <div className="product-actions">
            <button type="button" onClick={() => onOpenHistoryDialog(item)}>
              Bearbeiten
            </button>

            <button
              type="button"
              className="danger-button"
              onClick={() => onOpenHistoryDeleteDialog(item)}
            >
              Löschen
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
