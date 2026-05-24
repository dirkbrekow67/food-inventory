// client/src/utils/imageFileUtils.js

const DEFAULT_MAX_IMAGE_WIDTH = 1000;
const DEFAULT_IMAGE_QUALITY = 0.75;

function createImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));

    image.src = dataUrl;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Bilddatei konnte nicht gelesen werden."));

    reader.readAsDataURL(file);
  });
}

export async function compressImageFileToDataUrl(
  file,
  {
    maxWidth = DEFAULT_MAX_IMAGE_WIDTH,
    quality = DEFAULT_IMAGE_QUALITY,
  } = {},
) {
  if (!file) {
    return "";
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Bitte eine Bilddatei auswählen.");
  }

  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await createImageFromDataUrl(originalDataUrl);

  const scaleFactor = Math.min(1, maxWidth / image.width);
  const targetWidth = Math.round(image.width * scaleFactor);
  const targetHeight = Math.round(image.height * scaleFactor);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Bild konnte nicht verarbeitet werden.");
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL("image/jpeg", quality);
}