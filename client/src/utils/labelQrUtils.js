// client/src/utils/labelQrUtils.js

export function createInventoryLabelQrPayload(item) {
  if (!item?.label_code) {
    return "";
  }

  return JSON.stringify({
    type: "food-inventory-label",
    version: 1,
    labelCode: item.label_code,
    inventoryItemId: item.id,
  });
}

export function createInventoryLabelQrText(item) {
  if (!item?.label_code) {
    return "";
  }

  return `food-inventory://label/${encodeURIComponent(item.label_code)}`;
}