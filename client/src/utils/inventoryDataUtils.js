// client/src/utils/inventoryDataUtils.js

import {
  getInventoryDateStatus,
  getInventoryEffectiveDate,
} from "./formattersUtils";

export function getAllStorageUnits(storageTree) {
  return storageTree.flatMap((location) =>
    location.units.map((unit) => ({
      ...unit,
      locationName: location.name,
    })),
  );
}

export function getCompartmentsForSelectedUnit(storageTree, storageUnitId) {
  const selectedUnitId = Number(storageUnitId);

  if (!selectedUnitId) {
    return [];
  }

  return (
    storageTree
      .flatMap((location) => location.units)
      .find((unit) => unit.id === selectedUnitId)?.compartments || []
  );
}

export function getLatestInventoryItemForProduct(inventoryItems, productId) {
  return inventoryItems
    .filter((item) => item.product_id === Number(productId))
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
}

export function getInventoryStorageFilterOptions(inventoryItems) {
  const storageOptions = inventoryItems.map((item) => ({
    id: item.storage_unit_id,
    name: item.storage_unit_name,
  }));

  return storageOptions
    .filter(
      (option, index, allOptions) =>
        allOptions.findIndex((item) => item.id === option.id) === index,
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name, "de", { sensitivity: "base" }),
    );
}

export function matchesInventorySearch(item, searchTerm) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return true;
  }

  const searchableText = [
    item.label_code,
    item.product_name,
    item.product_brand,
    item.product_category,
    item.storage_unit_name,
    item.storage_compartment_name,
    item.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedSearchTerm);
}

export function getFilteredInventoryItems(
  inventoryItems,
  inventorySearchTerm,
  inventoryStatusFilter,
  inventoryStorageFilter,
) {
  return inventoryItems.filter((item) => {
    const matchesSearch = matchesInventorySearch(item, inventorySearchTerm);

    const matchesStatus =
      inventoryStatusFilter === "all" ||
      getInventoryDateStatus(item) === inventoryStatusFilter;

    const matchesStorage =
      inventoryStorageFilter === "all" ||
      String(item.storage_unit_id) === inventoryStorageFilter;

    return matchesSearch && matchesStatus && matchesStorage;
  });
}

export function getHistoryItemsForProduct(historyItems, productId) {
  return historyItems.filter((item) => item.product_id === Number(productId));
}

export function getLatestHistoryItemForProduct(historyItems, productId) {
  return getHistoryItemsForProduct(historyItems, productId)[0] || null;
}

export function getProductHistorySummary(historyItems, productId) {
  const productHistoryItems = getHistoryItemsForProduct(historyItems, productId);
  const latestHistoryItem = getLatestHistoryItemForProduct(
    historyItems,
    productId,
  );

  return {
    count: productHistoryItems.length,
    latestItem: latestHistoryItem,
  };
}

export function matchesHistorySearch(item, searchTerm) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return true;
  }

  const searchableText = [
    item.product_name,
    item.product_brand,
    item.product_category,
    item.product_country,
    item.product_store,
    item.label_code,
    item.removal_reason,
    item.product_buy_again_status_after_removal,
    item.experience_reason,
    item.experience_note,
    item.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedSearchTerm);
}

export function getFilteredHistoryItems(
  historyItems,
  historySearchTerm,
  historyReasonFilter,
  historyBuyAgainFilter,
  historyProductFilter,
) {
  return historyItems.filter((item) => {
    const matchesSearch = matchesHistorySearch(item, historySearchTerm);

    const matchesReason =
      historyReasonFilter === "all" || item.removal_reason === historyReasonFilter;

    const matchesBuyAgain =
      historyBuyAgainFilter === "all" ||
      item.product_buy_again_status_after_removal === historyBuyAgainFilter;

    const matchesProduct =
      historyProductFilter === "all" ||
      String(item.product_id) === historyProductFilter;

    return matchesSearch && matchesReason && matchesBuyAgain && matchesProduct;
  });
}

export function parseRemainingFraction(value) {
  if (!value) {
    return {
      numerator: null,
      denominator: null,
    };
  }

  const [numerator, denominator] = value.split("/").map(Number);

  return {
    numerator,
    denominator,
  };
}

export function updateInventoryListAfterCreate(currentItems, createdItem) {
  return [...currentItems, createdItem].sort((a, b) => {
    const dateA = getInventoryEffectiveDate(a);
    const dateB = getInventoryEffectiveDate(b);

    if (!dateA && dateB) return 1;
    if (dateA && !dateB) return -1;

    return String(dateA || "").localeCompare(String(dateB || ""));
  });
}

export function updateInventoryListAfterRemove(currentItems, inventoryItemId) {
  return currentItems.filter((item) => item.id !== inventoryItemId);
}

export function updateInventoryListAfterUpdate(currentItems, updatedItem) {
  return currentItems
    .map((item) => (item.id === updatedItem.id ? updatedItem : item))
    .sort((a, b) => {
      const dateA = getInventoryEffectiveDate(a);
      const dateB = getInventoryEffectiveDate(b);

      if (!dateA && dateB) return 1;
      if (dateA && !dateB) return -1;

      return String(dateA || "").localeCompare(String(dateB || ""));
    });
}