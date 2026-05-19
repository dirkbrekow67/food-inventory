import { API_BASE_URL } from "../config/apiConfig";

async function fetchJson(path, errorMessage) {
  const response = await fetch(`${API_BASE_URL}${path}`);

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