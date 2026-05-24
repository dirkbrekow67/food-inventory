// client/src/utils/imageUrlUtils.js

import { API_BASE_URL } from "../config/apiConfig";

export function createImageSrc(imageValue) {
  if (!imageValue) {
    return "";
  }

  if (imageValue.startsWith("data:image/")) {
    return imageValue;
  }

  if (imageValue.startsWith("http://") || imageValue.startsWith("https://")) {
    return imageValue;
  }

  return `${API_BASE_URL.replace("/api", "")}${imageValue}`;
}