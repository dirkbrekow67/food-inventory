// client/src/components/history/HistorySection.jsx

import {
  formatDateGerman,
  getBuyAgainLabel,
  getExperienceReasonLabel,
  getRemovalReasonLabel,
} from "../../utils/formattersUtils";

import { HistoryToolbar } from "./HistoryToolbar";

export function HistorySection({
  historyItems,
  filteredHistoryItems,
  historySearchTerm,
  historyReasonFilter,
  historyBuyAgainFilter,
  historyProductFilter,
  selectedHistoryProduct,
  hasActiveHistoryFilters,
  loadingHistory,
  onHistorySearchTermChange,
  onHistoryReasonFilterChange,
  onHistoryBuyAgainFilterChange,
  onResetHistoryFilters,
  onOpenHistoryDialog,
  onOpenHistoryDeleteDialog,
}) {
  return (
    <section className="card" id="product-history-section">
      <div className="section-header">
        <div>
          <h2>Produkthistorie</h2>
          <p>
            Gespeicherte Produkterfahrungen für spätere Einkaufsentscheidungen.
          </p>
        </div>
      </div>

      <div className="history-overview-header">
        <div>
          <h3>Historieneinträge</h3>
          <p className="muted">
            Nur ausgewählte Entnahmen werden hier als Produkterfahrung
            gespeichert.
          </p>

          {historyProductFilter !== "all" && (
            <p className="muted">
              Gefiltert nach Produkt:{" "}
              {selectedHistoryProduct
                ? selectedHistoryProduct.name
                : `Produkt-ID ${historyProductFilter}`}
              .
            </p>
          )}
        </div>

        <span className="result-count">
          {filteredHistoryItems.length} von {historyItems.length} Einträgen
        </span>
      </div>

      <HistoryToolbar
        historySearchTerm={historySearchTerm}
        historyReasonFilter={historyReasonFilter}
        historyBuyAgainFilter={historyBuyAgainFilter}
        hasActiveHistoryFilters={hasActiveHistoryFilters}
        onHistorySearchTermChange={onHistorySearchTermChange}
        onHistoryReasonFilterChange={onHistoryReasonFilterChange}
        onHistoryBuyAgainFilterChange={onHistoryBuyAgainFilterChange}
        onResetHistoryFilters={onResetHistoryFilters}
      />

      {loadingHistory && (
        <p className="muted">Produkthistorie wird geladen...</p>
      )}

      {!loadingHistory && historyItems.length === 0 && (
        <p className="muted">Noch keine Produkthistorie vorhanden.</p>
      )}

      {!loadingHistory &&
        historyItems.length > 0 &&
        filteredHistoryItems.length === 0 && (
          <p className="muted">Keine passenden Historieneinträge gefunden.</p>
        )}

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

            {item.notes && (
              <p className="history-technical-note">{item.notes}</p>
            )}

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
    </section>
  );
}
