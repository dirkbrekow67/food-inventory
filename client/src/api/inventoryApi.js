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
    throw new Error(errorMessage);
  }

  return response.json();
}

export function loadStorageTree() {
  return fetchJson("/storage/tree", "Lagerstruktur konnte nicht geladen werden.");
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