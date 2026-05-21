// client/src/components/history/HistorySection.jsx

import { HistoryList } from "./HistoryList";

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

      <HistoryList
        filteredHistoryItems={filteredHistoryItems}
        onOpenHistoryDialog={onOpenHistoryDialog}
        onOpenHistoryDeleteDialog={onOpenHistoryDeleteDialog}
      />
    </section>
  );
}
