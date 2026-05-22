// client/src/utils/labelQrUtils.js

export function getInventoryLabelBaseUrl() {
  return import.meta.env.VITE_APP_BASE_URL || window.location.origin;
}

export function createInventoryLabelQrPayload(item) {
  if (!item?.label_code) {
    return "";
  }

  return JSON.stringify({
    type: "food-inventory-label",
    version: 1,
    labelCode: item.label_code,
    inventoryItemId: item.id,
    url: createInventoryLabelQrText(item),
  });
}

export function createInventoryLabelQrText(item) {
  if (!item?.label_code) {
    return "";
  }

  const baseUrl = getInventoryLabelBaseUrl();
  const url = new URL(baseUrl);

  url.searchParams.set("label", item.label_code);

  return url.toString();
}