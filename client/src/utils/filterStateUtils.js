// client/src/utils/filterStateUtils.js

export function createInitialInventoryFilterState() {
  return {
    inventorySearchTerm: "",
    inventoryStatusFilter: "all",
    inventoryStorageFilter: "all",
  };
}

export function createInitialHistoryFilterState() {
  return {
    historySearchTerm: "",
    historyReasonFilter: "all",
    historyBuyAgainFilter: "all",
    historyProductFilter: "all",
  };
}
