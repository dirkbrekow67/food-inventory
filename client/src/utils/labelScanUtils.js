// client/src/utils/labelScanUtils.js

export function extractLabelCodeFromScanText(scanText) {
  const normalizedText = String(scanText || "").trim();

  if (!normalizedText) {
    return "";
  }

  const appSchemeMatch = normalizedText.match(
    /^food-inventory:\/\/label\/([^/?#]+)/i,
  );

  if (appSchemeMatch?.[1]) {
    return decodeURIComponent(appSchemeMatch[1]).trim();
  }

  const urlMatch = normalizedText.match(/[?&]label=([^&#]+)/i);

  if (urlMatch?.[1]) {
    return decodeURIComponent(urlMatch[1]).trim();
  }

  return normalizedText;
}

export function findInventoryItemByLabelCode(inventoryItems, labelCode) {
  const normalizedLabelCode = String(labelCode || "").trim().toLowerCase();

  if (!normalizedLabelCode) {
    return null;
  }

  return (
    inventoryItems.find(
      (item) =>
        String(item.label_code || "").trim().toLowerCase() ===
        normalizedLabelCode,
    ) || null
  );
}