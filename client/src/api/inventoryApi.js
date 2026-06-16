// client/src/api/inventoryApi.js

import {
  API_METHOD,
  createJsonRequest,
  createRequest,
  fetchJson,
} from "./apiClient";

import { API_PATH } from "./apiPaths";

import {
  createHistoryItemPath,
  createInventoryItemPath,
  createShoppingListCompletePath,
  createShoppingListItemPath,
  createShoppingListPath,
  createShoppingListReopenPath,
} from "./inventoryApiPaths";

export {
  loadLabelSlots,
  markLabelCodesAsPrinted,
  releaseFreeLabelCodes,
  resetFreeLabelCodes,
  updateLabelPrintStatus,
} from "./labelApi";

export {
  createStorageCompartment,
  createStorageLocation,
  createStorageUnit,
  deactivateStorageCompartmentById,
  deactivateStorageLocationById,
  deactivateStorageUnitById,
  generateStorageCompartments,
  loadInactiveStorageItems,
  loadStorageTree,
  reactivateStorageCompartmentById,
  reactivateStorageLocationById,
  reactivateStorageUnitById,
} from "./storageApi";

export {
  deactivateProductById,
  loadProducts,
  saveProduct,
  uploadProductPhoto,
} from "./productApi";

export function loadInventoryItems() {
  return fetchJson(API_PATH.INVENTORY, "Bestand konnte nicht geladen werden.");
}

export function loadHistoryItems() {
  return fetchJson(API_PATH.HISTORY, "Produkthistorie konnte nicht geladen werden.");
}

export function createInventoryItem(payload) {
  return fetchJson(
    API_PATH.INVENTORY,
    "Bestand konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function updateInventoryItemById(inventoryItemId, payload) {
  return fetchJson(
    createInventoryItemPath(inventoryItemId),
    "Bestandseintrag konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.PUT, payload),
  );
}

export function removeInventoryItemById(inventoryItemId, payload) {
  return fetchJson(
    createInventoryItemPath(inventoryItemId),
    "Bestand konnte nicht entfernt werden.",
    createJsonRequest(API_METHOD.DELETE, payload),
  );
}

export function updateHistoryItemById(historyItemId, payload) {
  return fetchJson(
    createHistoryItemPath(historyItemId),
    "Historieneintrag konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.PUT, payload),
  );
}

export function deleteHistoryItemById(historyItemId) {
  return fetchJson(
    createHistoryItemPath(historyItemId),
    "Historieneintrag konnte nicht gelöscht werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function loadShoppingListItems(includeCompleted = false) {
  return fetchJson(
    createShoppingListPath(includeCompleted),
    "Einkaufsliste konnte nicht geladen werden.",
  );
}

export function createShoppingListItem(payload) {
  return fetchJson(
    API_PATH.SHOPPING_LIST,
    "Einkaufslisteneintrag konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function updateShoppingListItemById(itemId, payload) {
  return fetchJson(
    createShoppingListItemPath(itemId),
    "Einkaufslisteneintrag konnte nicht aktualisiert werden.",
    createJsonRequest(API_METHOD.PUT, payload),
  );
}

export function completeShoppingListItemById(itemId) {
  return fetchJson(
    createShoppingListCompletePath(itemId),
    "Einkaufslisteneintrag konnte nicht erledigt werden.",
    createRequest(API_METHOD.PATCH),
  );
}

export function reopenShoppingListItemById(itemId) {
  return fetchJson(
    createShoppingListReopenPath(itemId),
    "Einkaufslisteneintrag konnte nicht wieder geöffnet werden.",
    createRequest(API_METHOD.PATCH),
  );
}

export function deleteShoppingListItemById(itemId) {
  return fetchJson(
    createShoppingListItemPath(itemId),
    "Einkaufslisteneintrag konnte nicht gelöscht werden.",
    createRequest(API_METHOD.DELETE),
  );
}
