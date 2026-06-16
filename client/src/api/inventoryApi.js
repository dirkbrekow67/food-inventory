// client/src/api/inventoryApi.js

import {
  API_METHOD,
  createJsonRequest,
  createRequest,
  fetchJson,
} from "./apiClient";


const API_QUERY_PARAM = Object.freeze({
  INCLUDE_COMPLETED: "includeCompleted",
});

const API_QUERY_VALUE = Object.freeze({
  TRUE: "1",
});

const API_PATH = Object.freeze({
  HISTORY: "/history",
  INVENTORY: "/inventory",
  LABELS: "/labels",
  PRODUCTS: "/products",
  SHOPPING_LIST: "/shopping-list",
  STORAGE: "/storage",
});

const SHOPPING_LIST_ACTION = Object.freeze({
  COMPLETE: "complete",
  REOPEN: "reopen",
});

const LABEL_PATH_SEGMENT = Object.freeze({
  ALL: "all",
  FREE: "free",
  MARK_PRINTED: "mark-printed",
  PRINT_STATUS: "print-status",
});

const PRODUCT_PATH_SEGMENT = Object.freeze({
  PHOTOS: "photos",
});

const STORAGE_PATH_SEGMENT = Object.freeze({
  COMPARTMENTS: "compartments",
  GENERATE: "generate",
  INACTIVE: "inactive",
  LOCATIONS: "locations",
  REACTIVATE: "reactivate",
  TREE: "tree",
  UNITS: "units",
});


function createQueryString(queryParams) {
  const searchParams = new URLSearchParams(queryParams);

  return `?${searchParams.toString()}`;
}

function createBooleanQueryString(paramName, enabled) {
  if (!enabled) {
    return "";
  }

  return createQueryString({
    [paramName]: API_QUERY_VALUE.TRUE,
  });
}

function createShoppingListQuery(includeCompleted) {
  return createBooleanQueryString(
    API_QUERY_PARAM.INCLUDE_COMPLETED,
    includeCompleted,
  );
}

function createPathWithId(basePath, id) {
  return `${basePath}/${id}`;
}

function createPathWithSegments(basePath, ...segments) {
  return [basePath, ...segments].join("/");
}

function createLabelMarkPrintedPath() {
  return createPathWithSegments(API_PATH.LABELS, LABEL_PATH_SEGMENT.MARK_PRINTED);
}

function createLabelPrintStatusPath(labelCode) {
  return createPathWithSegments(
    API_PATH.LABELS,
    labelCode,
    LABEL_PATH_SEGMENT.PRINT_STATUS,
  );
}

function createFreeLabelsPath() {
  return createPathWithSegments(API_PATH.LABELS, LABEL_PATH_SEGMENT.FREE);
}

function createResetFreeLabelsPath() {
  return createPathWithSegments(
    API_PATH.LABELS,
    LABEL_PATH_SEGMENT.FREE,
    LABEL_PATH_SEGMENT.ALL,
  );
}

function createProductItemPath(productId) {
  return createPathWithId(API_PATH.PRODUCTS, productId);
}

function createProductPhotosPath() {
  return createPathWithSegments(API_PATH.PRODUCTS, PRODUCT_PATH_SEGMENT.PHOTOS);
}

function createInventoryItemPath(inventoryItemId) {
  return createPathWithId(API_PATH.INVENTORY, inventoryItemId);
}

function createHistoryItemPath(historyItemId) {
  return createPathWithId(API_PATH.HISTORY, historyItemId);
}

function createStorageTreePath() {
  return createPathWithSegments(API_PATH.STORAGE, STORAGE_PATH_SEGMENT.TREE);
}

function createInactiveStoragePath() {
  return createPathWithSegments(API_PATH.STORAGE, STORAGE_PATH_SEGMENT.INACTIVE);
}

function createStorageLocationsPath() {
  return createPathWithSegments(API_PATH.STORAGE, STORAGE_PATH_SEGMENT.LOCATIONS);
}

function createStorageLocationItemPath(locationId) {
  return createPathWithId(createStorageLocationsPath(), locationId);
}

function createStorageLocationReactivatePath(locationId) {
  return createPathWithSegments(
    createStorageLocationItemPath(locationId),
    STORAGE_PATH_SEGMENT.REACTIVATE,
  );
}

function createStorageUnitsPath() {
  return createPathWithSegments(API_PATH.STORAGE, STORAGE_PATH_SEGMENT.UNITS);
}

function createStorageUnitItemPath(unitId) {
  return createPathWithId(createStorageUnitsPath(), unitId);
}

function createStorageUnitReactivatePath(unitId) {
  return createPathWithSegments(
    createStorageUnitItemPath(unitId),
    STORAGE_PATH_SEGMENT.REACTIVATE,
  );
}

function createStorageUnitCompartmentsPath(unitId) {
  return createPathWithSegments(
    createStorageUnitItemPath(unitId),
    STORAGE_PATH_SEGMENT.COMPARTMENTS,
  );
}

function createStorageUnitGenerateCompartmentsPath(unitId) {
  return createPathWithSegments(
    createStorageUnitCompartmentsPath(unitId),
    STORAGE_PATH_SEGMENT.GENERATE,
  );
}

function createStorageCompartmentsPath() {
  return createPathWithSegments(
    API_PATH.STORAGE,
    STORAGE_PATH_SEGMENT.COMPARTMENTS,
  );
}

function createStorageCompartmentItemPath(compartmentId) {
  return createPathWithId(createStorageCompartmentsPath(), compartmentId);
}

function createStorageCompartmentReactivatePath(compartmentId) {
  return createPathWithSegments(
    createStorageCompartmentItemPath(compartmentId),
    STORAGE_PATH_SEGMENT.REACTIVATE,
  );
}

function createShoppingListPath(includeCompleted) {
  return `${API_PATH.SHOPPING_LIST}${createShoppingListQuery(includeCompleted)}`;
}

function createShoppingListItemPath(itemId) {
  return createPathWithId(API_PATH.SHOPPING_LIST, itemId);
}

function createShoppingListActionPath(itemId, action) {
  return `${createShoppingListItemPath(itemId)}/${action}`;
}

function createShoppingListCompletePath(itemId) {
  return createShoppingListActionPath(itemId, SHOPPING_LIST_ACTION.COMPLETE);
}

function createShoppingListReopenPath(itemId) {
  return createShoppingListActionPath(itemId, SHOPPING_LIST_ACTION.REOPEN);
}

export function loadStorageTree() {
  return fetchJson(createStorageTreePath(), "Lagerstruktur konnte nicht geladen werden.");
}

export function loadInactiveStorageItems() {
  return fetchJson(
    createInactiveStoragePath(),
    "Inaktive Lagerstruktur konnte nicht geladen werden.",
  );
}

export function createStorageLocation(name) {
  return fetchJson(
    createStorageLocationsPath(),
    "Standort konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, { name }),
  );
}

export function deactivateStorageLocationById(locationId) {
  return fetchJson(
    createStorageLocationItemPath(locationId),
    "Standort konnte nicht deaktiviert werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function reactivateStorageLocationById(locationId) {
  return fetchJson(
    createStorageLocationReactivatePath(locationId),
    "Standort konnte nicht reaktiviert werden.",
    createRequest(API_METHOD.PATCH),
  );
}

export function createStorageUnit(payload) {
  return fetchJson(
    createStorageUnitsPath(),
    "Lagergerät konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function generateStorageCompartments(unitId, payload) {
  return fetchJson(
    createStorageUnitGenerateCompartmentsPath(unitId),
    "Fächer konnten nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function createStorageCompartment(unitId, payload) {
  return fetchJson(
    createStorageUnitCompartmentsPath(unitId),
    "Fach konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function loadProducts() {
  return fetchJson(API_PATH.PRODUCTS, "Produkte konnten nicht geladen werden.");
}

export function loadLabelSlots() {
  return fetchJson(API_PATH.LABELS, "Etikettenpool konnte nicht geladen werden.");
}

export function markLabelCodesAsPrinted(labelCodes) {
  return fetchJson(
    createLabelMarkPrintedPath(),
    "Etikettenbogen konnte nicht als gedruckt markiert werden.",
    createJsonRequest(API_METHOD.POST, { labelCodes }),
  );
}

export function updateLabelPrintStatus(labelCode, printStatus) {
  return fetchJson(
    createLabelPrintStatusPath(labelCode),
    "Druckstatus konnte nicht aktualisiert werden.",
    createJsonRequest(API_METHOD.PATCH, { printStatus }),
  );
}

export function releaseFreeLabelCodes(labelCodes) {
  return fetchJson(
    createFreeLabelsPath(),
    "Freie Etiketten konnten nicht entfernt werden.",
    createJsonRequest(API_METHOD.DELETE, { labelCodes }),
  );
}

export function resetFreeLabelCodes() {
  return fetchJson(
    createResetFreeLabelsPath(),
    "Freie Etiketten konnten nicht zurückgesetzt werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function loadInventoryItems() {
  return fetchJson(API_PATH.INVENTORY, "Bestand konnte nicht geladen werden.");
}

export function loadHistoryItems() {
  return fetchJson(API_PATH.HISTORY, "Produkthistorie konnte nicht geladen werden.");
}

export function saveProduct(productId, payload) {
  const path = productId ? createProductItemPath(productId) : API_PATH.PRODUCTS;
  const method = productId ? API_METHOD.PUT : API_METHOD.POST;

  return fetchJson(
    path,
    "Produkt konnte nicht gespeichert werden.",
    createJsonRequest(method, payload),
  );
}

export function deactivateProductById(productId) {
  return fetchJson(
    createProductItemPath(productId),
    "Produkt konnte nicht deaktiviert werden.",
    createRequest(API_METHOD.DELETE),
  );
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

export function deactivateStorageUnitById(unitId) {
  return fetchJson(
    createStorageUnitItemPath(unitId),
    "Lagergerät konnte nicht deaktiviert werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function reactivateStorageUnitById(unitId) {
  return fetchJson(
    createStorageUnitReactivatePath(unitId),
    "Lagergerät konnte nicht reaktiviert werden.",
    createRequest(API_METHOD.PATCH),
  );
}

export function deactivateStorageCompartmentById(compartmentId) {
  return fetchJson(
    createStorageCompartmentItemPath(compartmentId),
    "Fach konnte nicht deaktiviert werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function reactivateStorageCompartmentById(compartmentId) {
  return fetchJson(
    createStorageCompartmentReactivatePath(compartmentId),
    "Fach konnte nicht reaktiviert werden.",
    createRequest(API_METHOD.PATCH),
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

export function uploadProductPhoto({
  productId = "new",
  side = "front",
  imageDataUrl,
}) {
  return fetchJson(
    createProductPhotosPath(),
    "Produktfoto konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, {
      productId,
      side,
      imageDataUrl,
    }),
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
