import { API_BASE_URL } from "../config/apiConfig";

function createJsonRequest(method, payload) {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
}

async function fetchJson(path, errorMessage, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    let serverErrorMessage;

    try {
      const errorData = await response.json();
      serverErrorMessage = errorData.error;
    } catch (error) {
      console.error(error);
    }

    throw new Error(serverErrorMessage || errorMessage);
  }

  return response.json();
}

export function loadStorageTree() {
  return fetchJson("/storage/tree", "Lagerstruktur konnte nicht geladen werden.");
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
    {
      method: "DELETE",
    },
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
    {
    method: "DELETE",
    }
  );
}

export function createInventoryItem(payload) {
  return fetchJson(
    "/inventory",
    "Bestand konnte nicht gespeichert werden.",
    createJsonRequest("POST", payload),
  );
}

export function deactivateStorageUnitById(unitId) {
  return fetchJson(
    `/storage/units/${unitId}`,
    "Lagergerät konnte nicht deaktiviert werden.",
    {
      method: "DELETE",
    },
  );
}

export function deactivateStorageCompartmentById(compartmentId) {
  return fetchJson(
    `/storage/compartments/${compartmentId}`,
    "Fach konnte nicht deaktiviert werden.",
    {
      method: "DELETE",
    },
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
    {
      method: "DELETE",
    },
  );
}

export function uploadProductPhoto({ productId = "new", side = "front", imageDataUrl }) {
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