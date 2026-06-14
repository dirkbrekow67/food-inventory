// client/src/api/inventoryApi.js

import { API_BASE_URL } from "../config/apiConfig";

function createRequest(method) {
  return {
    method,
    headers: {
      Accept: "application/json",
    },
  };
}

function createJsonRequest(method, payload) {
  const request = createRequest(method);

  return {
    ...request,
    headers: {
      ...request.headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
}

function createApiUrl(path) {
  return `${API_BASE_URL}${path}`;
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

function createApiErrorMessage(responseData, fallbackMessage) {
  return responseData?.error || fallbackMessage;
}

async function fetchJson(path, errorMessage, options = {}) {
  let response;

  try {
    response = await fetch(createApiUrl(path), options);
  } catch (error) {
    console.error(error);
    throw new Error(errorMessage, { cause: error });
  }

  const responseText = await response.text();
  const responseData = parseJsonText(responseText);

  if (!response.ok) {
    throw new Error(createApiErrorMessage(responseData, errorMessage));
  }

  if (response.status === 204 || !responseText) {
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
    createJsonRequest("POST", { name }),
  );
}

export function deactivateStorageLocationById(locationId) {
  return fetchJson(
    `/storage/locations/${locationId}`,
    "Standort konnte nicht deaktiviert werden.",
    createRequest("DELETE"),
  );
}

export function reactivateStorageLocationById(locationId) {
  return fetchJson(
    `/storage/locations/${locationId}/reactivate`,
    "Standort konnte nicht reaktiviert werden.",
    createRequest("PATCH"),
  );
}

export function createStorageUnit(payload) {
  return fetchJson(
    "/storage/units",
    "Lagergerät konnte nicht gespeichert werden.",
    createJsonRequest("POST", payload),
  );
}

export function generateStorageCompartments(unitId, payload) {
  return fetchJson(
    `/storage/units/${unitId}/compartments/generate`,
    "Fächer konnten nicht gespeichert werden.",
    createJsonRequest("POST", payload),
  );
}

export function createStorageCompartment(unitId, payload) {
  return fetchJson(
    `/storage/units/${unitId}/compartments`,
    "Fach konnte nicht gespeichert werden.",
    createJsonRequest("POST", payload),
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
    createJsonRequest("POST", { labelCodes }),
  );
}

export function updateLabelPrintStatus(labelCode, printStatus) {
  return fetchJson(
    `/labels/${labelCode}/print-status`,
    "Druckstatus konnte nicht aktualisiert werden.",
    createJsonRequest("PATCH", { printStatus }),
  );
}

export function releaseFreeLabelCodes(labelCodes) {
  return fetchJson(
    "/labels/free",
    "Freie Etiketten konnten nicht entfernt werden.",
    createJsonRequest("DELETE", { labelCodes }),
  );
}

export function resetFreeLabelCodes() {
  return fetchJson(
    "/labels/free/all",
    "Freie Etiketten konnten nicht zurückgesetzt werden.",
    createRequest("DELETE"),
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
  const method = productId ? "PUT" : "POST";

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
    createRequest("DELETE"),
  );
}

export function createInventoryItem(payload) {
  return fetchJson(
    "/inventory",
    "Bestand konnte nicht gespeichert werden.",
    createJsonRequest("POST", payload),
  );
}

export function updateInventoryItemById(inventoryItemId, payload) {
  return fetchJson(
    `/inventory/${inventoryItemId}`,
    "Bestandseintrag konnte nicht gespeichert werden.",
    createJsonRequest("PUT", payload),
  );
}

export function deactivateStorageUnitById(unitId) {
  return fetchJson(
    `/storage/units/${unitId}`,
    "Lagergerät konnte nicht deaktiviert werden.",
    createRequest("DELETE"),
  );
}

export function reactivateStorageUnitById(unitId) {
  return fetchJson(
    `/storage/units/${unitId}/reactivate`,
    "Lagergerät konnte nicht reaktiviert werden.",
    createRequest("PATCH"),
  );
}

export function deactivateStorageCompartmentById(compartmentId) {
  return fetchJson(
    `/storage/compartments/${compartmentId}`,
    "Fach konnte nicht deaktiviert werden.",
    createRequest("DELETE"),
  );
}

export function reactivateStorageCompartmentById(compartmentId) {
  return fetchJson(
    `/storage/compartments/${compartmentId}/reactivate`,
    "Fach konnte nicht reaktiviert werden.",
    createRequest("PATCH"),
  );
}

export function removeInventoryItemById(inventoryItemId, payload) {
  return fetchJson(
    `/inventory/${inventoryItemId}`,
    "Bestand konnte nicht entfernt werden.",
    createJsonRequest("DELETE", payload),
  );
}

export function updateHistoryItemById(historyItemId, payload) {
  return fetchJson(
    `/history/${historyItemId}`,
    "Historieneintrag konnte nicht gespeichert werden.",
    createJsonRequest("PUT", payload),
  );
}

export function deleteHistoryItemById(historyItemId) {
  return fetchJson(
    `/history/${historyItemId}`,
    "Historieneintrag konnte nicht gelöscht werden.",
    createRequest("DELETE"),
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
    createJsonRequest("POST", {
      productId,
      side,
      imageDataUrl,
    }),
  );
}

export function loadShoppingListItems(includeCompleted = false) {
  const query = includeCompleted ? "?includeCompleted=1" : "";

  return fetchJson(
    `/shopping-list${query}`,
    "Einkaufsliste konnte nicht geladen werden.",
  );
}

export function createShoppingListItem(payload) {
  return fetchJson(
    "/shopping-list",
    "Einkaufslisteneintrag konnte nicht gespeichert werden.",
    createJsonRequest("POST", payload),
  );
}

export function updateShoppingListItemById(itemId, payload) {
  return fetchJson(
    `/shopping-list/${itemId}`,
    "Einkaufslisteneintrag konnte nicht aktualisiert werden.",
    createJsonRequest("PUT", payload),
  );
}

export function completeShoppingListItemById(itemId) {
  return fetchJson(
    `/shopping-list/${itemId}/complete`,
    "Einkaufslisteneintrag konnte nicht erledigt werden.",
    createRequest("PATCH"),
  );
}

export function reopenShoppingListItemById(itemId) {
  return fetchJson(
    `/shopping-list/${itemId}/reopen`,
    "Einkaufslisteneintrag konnte nicht wieder geöffnet werden.",
    createRequest("PATCH"),
  );
}

export function deleteShoppingListItemById(itemId) {
  return fetchJson(
    `/shopping-list/${itemId}`,
    "Einkaufslisteneintrag konnte nicht gelöscht werden.",
    createRequest("DELETE"),
  );
}
