// client/src/utils/productImageFormUtils.js

export const PRODUCT_IMAGE_UPLOAD_MISSING_PATH_ERROR_MESSAGE =
  "Foto-Upload ohne Bildpfad erhalten.";

export function resetProductImageInput(inputElement) {
  if (inputElement) {
    inputElement.value = "";
  }
}

export function isProductImageFile(file) {
  return Boolean(file?.type?.startsWith("image/"));
}

export function getProductImageErrorMessage(error) {
  if (
    error instanceof Error &&
    error.message === PRODUCT_IMAGE_UPLOAD_MISSING_PATH_ERROR_MESSAGE
  ) {
    return "Das Foto wurde verarbeitet, aber vom Server wurde kein Bildpfad zurückgegeben.";
  }

  return "Das Produktfoto konnte nicht verarbeitet oder gespeichert werden.";
}
