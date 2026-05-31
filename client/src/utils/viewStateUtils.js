// client/src/utils/viewStateUtils.js

import {
  getFilteredHistoryItems,
  getFilteredInventoryItems,
  getInventoryStorageFilterOptions,
  getProductHistorySummary,
} from "./inventoryDataUtils";

import { getInventoryEffectiveDate } from "./formattersUtils";

function getLabelSortNumber(item) {
  const labelCode = item.label_code || "";

  const match = labelCode.match(/(\d+)/);

  if (!match) {
    return 0;
  }

  return Number(match[1]);
}

function compareText(firstValue, secondValue) {
  return String(firstValue || "").localeCompare(String(secondValue || ""), "de", {
    sensitivity: "base",
    numeric: true,
  });
}

function sortInventoryItems(inventoryItems, inventorySortMode) {
  return [...inventoryItems].sort((firstItem, secondItem) => {
    if (inventorySortMode === "label_asc") {
      return getLabelSortNumber(firstItem) - getLabelSortNumber(secondItem);
    }

    if (inventorySortMode === "label_desc") {
      return getLabelSortNumber(secondItem) - getLabelSortNumber(firstItem);
    }

    if (inventorySortMode === "date_asc") {
      return compareText(
        getInventoryEffectiveDate(firstItem),
        getInventoryEffectiveDate(secondItem),
      );
    }

    if (inventorySortMode === "product_asc") {
      return compareText(firstItem.product_name, secondItem.product_name);
    }

    if (inventorySortMode === "storage_asc") {
      return compareText(
        `${firstItem.storage_location_name || ""} ${firstItem.storage_unit_name || ""} ${firstItem.storage_compartment_name || ""}`,
        `${secondItem.storage_location_name || ""} ${secondItem.storage_unit_name || ""} ${secondItem.storage_compartment_name || ""}`,
      );
    }

    return getLabelSortNumber(secondItem) - getLabelSortNumber(firstItem);
  });
}

export function getInventoryViewState({
  inventoryItems,
  inventorySearchTerm,
  inventoryStatusFilter,
  inventoryStorageFilter,
  inventorySortMode,
}) {
  const filteredInventoryItems = sortInventoryItems(
    getFilteredInventoryItems(
      inventoryItems,
      inventorySearchTerm,
      inventoryStatusFilter,
      inventoryStorageFilter,
    ),
    inventorySortMode,
);

  const inventoryStorageFilterOptions =
    getInventoryStorageFilterOptions(inventoryItems);

  const hasActiveInventoryFilters =
    Boolean(inventorySearchTerm.trim()) ||
    inventoryStatusFilter !== "all" ||
    inventoryStorageFilter !== "all" ||
    inventorySortMode !== "label_desc";

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