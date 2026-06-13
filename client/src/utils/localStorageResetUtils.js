// client/src/utils/localStorageResetUtils.js

import {
  ALL_FOOD_INVENTORY_LOCAL_STORAGE_KEYS,
  FILTER_AND_VIEW_STORAGE_KEYS,
  FORM_DRAFT_STORAGE_KEYS,
  PRINTED_LABEL_STORAGE_KEYS,
} from "../constants/localStorageKeys";

const FOOD_INVENTORY_LOCAL_STORAGE_PREFIX = "food-inventory.";

function removeLocalStorageKeys(storageKeys) {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  const removedKeys = [];

  storageKeys.forEach((storageKey) => {
    if (
      !String(storageKey || "").startsWith(FOOD_INVENTORY_LOCAL_STORAGE_PREFIX)
    ) {
      return;
    }

    window.localStorage.removeItem(storageKey);
    removedKeys.push(storageKey);
  });

  return removedKeys;
}

export function clearFilterAndViewStorage() {
  return removeLocalStorageKeys(FILTER_AND_VIEW_STORAGE_KEYS);
}

export function clearFormDraftStorage() {
  return removeLocalStorageKeys(FORM_DRAFT_STORAGE_KEYS);
}

export function clearPrintedLabelStorage() {
  return removeLocalStorageKeys(PRINTED_LABEL_STORAGE_KEYS);
}

export function clearAllFoodInventoryLocalStorage() {
  return removeLocalStorageKeys(ALL_FOOD_INVENTORY_LOCAL_STORAGE_KEYS);
}
