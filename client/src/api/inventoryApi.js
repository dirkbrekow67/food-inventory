// client/src/api/inventoryApi.js

import { API_BASE_URL } from "../config/apiConfig";

const API_METHOD = Object.freeze({
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
});

const API_HEADER = Object.freeze({
  ACCEPT: "Accept",
  CONTENT_TYPE: "Content-Type",
});

const API_CONTENT_TYPE = Object.freeze({
  JSON: "application/json",
});

const API_ERROR_FALLBACK_MESSAGE = "API-Anfrage fehlgeschlagen.";

const API_ERROR_FIELD_NAMES = Object.freeze(["error", "message", "detail"]);

const API_STATUS = Object.freeze({
  NO_CONTENT: 204,
});

const API_QUERY_PARAM = Object.freeze({
  INCLUDE_COMPLETED: "includeCompleted",
});

const API_QUERY_VALUE = Object.freeze({
  TRUE: "1",
});

function createHeaders(extraHeaders = {}) {
  return {
    [API_HEADER.ACCEPT]: API_CONTENT_TYPE.JSON,
    ...extraHeaders,
  };
}

function createBaseHeaders() {
  return createHeaders();
}

function createJsonHeaders() {
  return createHeaders({
    [API_HEADER.CONTENT_TYPE]: API_CONTENT_TYPE.JSON,
  });
}

function createRequest(method) {
  return {
    method,
    headers: createBaseHeaders(),
  };
}

function createJsonRequest(method, payload) {
  return {
    method,
    headers: createJsonHeaders(),
    body: JSON.stringify(payload),
  };
}

function createApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

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

function createShoppingListPath(includeCompleted) {
  return `/shopping-list${createShoppingListQuery(includeCompleted)}`;
}

function parseJsonText(responseText) {
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error(error);
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getFirstNonEmptyString(...values) {
  return values.find(isNonEmptyString);
}

function getApiErrorFieldValue(responseData, fieldName) {
  if (!responseData || typeof responseData !== "object") {
    return undefined;
  }

  return responseData[fieldName];
}

function createApiErrorMessage(responseData, fallbackMessage) {
  const responseMessages = API_ERROR_FIELD_NAMES.map((fieldName) =>
    getApiErrorFieldValue(responseData, fieldName),
  );

  return (
    getFirstNonEmptyString(...responseMessages, fallbackMessage) ||
    API_ERROR_FALLBACK_MESSAGE
  );
}

function createNetworkError(errorMessage, error) {
  return new Error(errorMessage, { cause: error });
}

function createApiHttpError(responseData, errorMessage) {
  return new Error(createApiErrorMessage(responseData, errorMessage));
}

async function readResponseText(response) {
  return response.text();
}

function isNoContentResponse(response) {
  return response.status === API_STATUS.NO_CONTENT;
}

function hasEmptyResponseText(responseText) {
  return !responseText;
}

function isEmptyResponse(response, responseText) {
  return isNoContentResponse(response) || hasEmptyResponseText(responseText);
}

async function fetchJson(path, errorMessage, options = createRequest(API_METHOD.GET)) {
  let response;

  try {
    response = await fetch(createApiUrl(path), options);
  } catch (error) {
    console.error(error);
    throw createNetworkError(errorMessage, error);
  }

  const responseText = await readResponseText(response);
  const responseData = parseJsonText(responseText);

  if (!response.ok) {
    throw createApiHttpError(responseData, errorMessage);
  }

  if (isEmptyResponse(response, responseText)) {
    return null;
  }

  return responseData;
}

export function loadStorageTree() {
  return fetchJson("/storage/tree", "Lagerstruktur konnte nicht geladen werden.");
}

export function loadInactiveStorageItems() {
  return fetchJson(
    "/storage/inactive",
    "Inaktive Lagerstruktur konnte nicht geladen werden.",
  );
}

export function createStorageLocation(name) {
  return fetchJson(
    "/storage/locations",
    "Standort konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, { name }),
  );
}

export function deactivateStorageLocationById(locationId) {
  return fetchJson(
    `/storage/locations/${locationId}`,
    "Standort konnte nicht deaktiviert werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function reactivateStorageLocationById(locationId) {
  return fetchJson(
    `/storage/locations/${locationId}/reactivate`,
    "Standort konnte nicht reaktiviert werden.",
    createRequest(API_METHOD.PATCH),
  );
}

export function createStorageUnit(payload) {
  return fetchJson(
    "/storage/units",
    "Lagergerät konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function generateStorageCompartments(unitId, payload) {
  return fetchJson(
    `/storage/units/${unitId}/compartments/generate`,
    "Fächer konnten nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function createStorageCompartment(unitId, payload) {
  return fetchJson(
    `/storage/units/${unitId}/compartments`,
    "Fach konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function loadProducts() {
  return fetchJson("/products", "Produkte konnten nicht geladen werden.");
}

export function loadLabelSlots() {
  return fetchJson("/labels", "Etikettenpool konnte nicht geladen werden.");
}

export function markLabelCodesAsPrinted(labelCodes) {
  return fetchJson(
    "/labels/mark-printed",
    "Etikettenbogen konnte nicht als gedruckt markiert werden.",
    createJsonRequest(API_METHOD.POST, { labelCodes }),
  );
}

export function updateLabelPrintStatus(labelCode, printStatus) {
  return fetchJson(
    `/labels/${labelCode}/print-status`,
    "Druckstatus konnte nicht aktualisiert werden.",
    createJsonRequest(API_METHOD.PATCH, { printStatus }),
  );
}

export function releaseFreeLabelCodes(labelCodes) {
  return fetchJson(
    "/labels/free",
    "Freie Etiketten konnten nicht entfernt werden.",
    createJsonRequest(API_METHOD.DELETE, { labelCodes }),
  );
}

export function resetFreeLabelCodes() {
  return fetchJson(
    "/labels/free/all",
    "Freie Etiketten konnten nicht zurückgesetzt werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function loadInventoryItems() {
  return fetchJson("/inventory", "Bestand konnte nicht geladen werden.");
}

export function loadHistoryItems() {
  return fetchJson("/history", "Produkthistorie konnte nicht geladen werden.");
}

export function saveProduct(productId, payload) {
  const path = productId ? `/products/${productId}` : "/products";
  const method = productId ? API_METHOD.PUT : API_METHOD.POST;

  return fetchJson(
    path,
    "Produkt konnte nicht gespeichert werden.",
    createJsonRequest(method, payload),
  );
}

export function deactivateProductById(productId) {
  return fetchJson(
    `/products/${productId}`,
    "Produkt konnte nicht deaktiviert werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function createInventoryItem(payload) {
  return fetchJson(
    "/inventory",
    "Bestand konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function updateInventoryItemById(inventoryItemId, payload) {
  return fetchJson(
    `/inventory/${inventoryItemId}`,
    "Bestandseintrag konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.PUT, payload),
  );
}

export function deactivateStorageUnitById(unitId) {
  return fetchJson(
    `/storage/units/${unitId}`,
    "Lagergerät konnte nicht deaktiviert werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function reactivateStorageUnitById(unitId) {
  return fetchJson(
    `/storage/units/${unitId}/reactivate`,
    "Lagergerät konnte nicht reaktiviert werden.",
    createRequest(API_METHOD.PATCH),
  );
}

export function deactivateStorageCompartmentById(compartmentId) {
  return fetchJson(
    `/storage/compartments/${compartmentId}`,
    "Fach konnte nicht deaktiviert werden.",
    createRequest(API_METHOD.DELETE),
  );
}

export function reactivateStorageCompartmentById(compartmentId) {
  return fetchJson(
    `/storage/compartments/${compartmentId}/reactivate`,
    "Fach konnte nicht reaktiviert werden.",
    createRequest(API_METHOD.PATCH),
  );
}

export function removeInventoryItemById(inventoryItemId, payload) {
  return fetchJson(
    `/inventory/${inventoryItemId}`,
    "Bestand konnte nicht entfernt werden.",
    createJsonRequest(API_METHOD.DELETE, payload),
  );
}

export function updateHistoryItemById(historyItemId, payload) {
  return fetchJson(
    `/history/${historyItemId}`,
    "Historieneintrag konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.PUT, payload),
  );
}

export function deleteHistoryItemById(historyItemId) {
  return fetchJson(
    `/history/${historyItemId}`,
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
    "/products/photos",
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
    "/shopping-list",
    "Einkaufslisteneintrag konnte nicht gespeichert werden.",
    createJsonRequest(API_METHOD.POST, payload),
  );
}

export function updateShoppingListItemById(itemId, payload) {
  return fetchJson(
    `/shopping-list/${itemId}`,
    "Einkaufslisteneintrag konnte nicht aktualisiert werden.",
    createJsonRequest(API_METHOD.PUT, payload),
  );
}

export function completeShoppingListItemById(itemId) {
  return fetchJson(
    `/shopping-list/${itemId}/complete`,
    "Einkaufslisteneintrag konnte nicht erledigt werden.",
    createRequest(API_METHOD.PATCH),
  );
}

export function reopenShoppingListItemById(itemId) {
  return fetchJson(
    `/shopping-list/${itemId}/reopen`,
    "Einkaufslisteneintrag konnte nicht wieder geöffnet werden.",
    createRequest(API_METHOD.PATCH),
  );
}

export function deleteShoppingListItemById(itemId) {
  return fetchJson(
    `/shopping-list/${itemId}`,
    "Einkaufslisteneintrag konnte nicht gelöscht werden.",
    createRequest(API_METHOD.DELETE),
  );
}
