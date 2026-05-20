// client/src/utils/viewStateUtils.js

export function getInventoryViewState({
  inventoryItems,
  inventorySearchTerm,
  inventoryStatusFilter,
  inventoryStorageFilter,
  getFilteredInventoryItems,
  getInventoryStorageFilterOptions,
}) {
  const filteredInventoryItems = getFilteredInventoryItems(
    inventoryItems,
    inventorySearchTerm,
    inventoryStatusFilter,
    inventoryStorageFilter,
  );

  const inventoryStorageFilterOptions =
    getInventoryStorageFilterOptions(inventoryItems);

  const hasActiveInventoryFilters =
    Boolean(inventorySearchTerm.trim()) ||
    inventoryStatusFilter !== "all" ||
    inventoryStorageFilter !== "all";

  return {
    filteredInventoryItems,
    inventoryStorageFilterOptions,
    hasActiveInventoryFilters,
  };
}

export function getHistoryViewState({
  historyItems,
  historySearchTerm,
  historyReasonFilter,
  historyBuyAgainFilter,
  historyProductFilter,
  products,
  inventoryForm,
  getFilteredHistoryItems,
  getProductHistorySummary,
}) {
  const filteredHistoryItems = getFilteredHistoryItems(
    historyItems,
    historySearchTerm,
    historyReasonFilter,
    historyBuyAgainFilter,
    historyProductFilter,
  );

  const hasActiveHistoryFilters =
    Boolean(historySearchTerm.trim()) ||
    historyReasonFilter !== "all" ||
    historyBuyAgainFilter !== "all" ||
    historyProductFilter !== "all";

  const selectedHistoryProduct =
    historyProductFilter === "all"
      ? null
      : products.find((product) => String(product.id) === historyProductFilter);

  const selectedInventoryProductHistorySummary = inventoryForm.productId
    ? getProductHistorySummary(historyItems, inventoryForm.productId)
    : null;

  return {
    filteredHistoryItems,
    hasActiveHistoryFilters,
    selectedHistoryProduct,
    selectedInventoryProductHistorySummary,
  };
}