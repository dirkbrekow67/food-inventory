// client/src/components/history/HistoryToolbar.jsx

import {
  historyBuyAgainFilterOptions,
  historyRemovalReasonFilterOptions,
} from "../../constants/selectOptions";

import { renderSelectOptions } from "../form/FormSelectOptions";

export function HistoryToolbar({
  historySearchTerm,
  historyReasonFilter,
  historyBuyAgainFilter,
  hasActiveHistoryFilters,
  onHistorySearchTermChange,
  onHistoryReasonFilterChange,
  onHistoryBuyAgainFilterChange,
  onResetHistoryFilters,
}) {
  return (
    <div className="history-toolbar">
      <label className="history-search">
        Historie suchen
        <input
          type="search"
          value={historySearchTerm}
          onChange={(event) => onHistorySearchTermChange(event.target.value)}
          placeholder="z. B. Ravioli, Coop, Italien, F001, vergessen"
        />
      </label>

      <div className="history-filter-row">
        <label>
          Grund
          <select
            value={historyReasonFilter}
            onChange={(event) =>
              onHistoryReasonFilterChange(event.target.value)
            }
          >
            {renderSelectOptions(historyRemovalReasonFilterOptions)}
          </select>
        </label>

        <label>
          Bewertung danach
          <select
            value={historyBuyAgainFilter}
            onChange={(event) =>
              onHistoryBuyAgainFilterChange(event.target.value)
            }
          >
            {renderSelectOptions(historyBuyAgainFilterOptions)}
          </select>
        </label>

        <button
          type="button"
          className="secondary-button"
          onClick={onResetHistoryFilters}
          disabled={!hasActiveHistoryFilters}
        >
          Filter zurücksetzen
        </button>
      </div>
    </div>
  );
}
