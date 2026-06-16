// client/src/api/productApi.js

import {
  API_METHOD,
  createJsonRequest,
  createRequest,
  fetchJson,
} from "./apiClient";

import { API_PATH } from "./apiPaths";

import {
  createProductItemPath,
  createProductPhotosPath,
} from "./inventoryApiPaths";

export function loadProducts() {
  return fetchJson(API_PATH.PRODUCTS, "Produkte konnten nicht geladen werden.");
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
