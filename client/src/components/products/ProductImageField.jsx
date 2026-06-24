// client/src/components/products/ProductImageField.jsx

import { createImageSrc } from "../../utils/imageUrlUtils";

export function ProductImageField({
  fieldName,
  side,
  uploadInputRef,
  cameraInputRef,
  label,
  processingText,
  imagePath,
  altText,
  removeText,
  isProcessingProductImage,
  processingProductImageSide,
  onOpenFileInput,
  onImageChange,
  onRemoveImage,
}) {
  const buttonText =
    processingProductImageSide === side ? "Verarbeite..." : null;

  return (
    <div className="product-image-field">
      <span className="product-image-label">{label}</span>

      <div className="product-image-actions">
        <button
          type="button"
          className="secondary-button"
          disabled={isProcessingProductImage}
          onClick={(event) => onOpenFileInput(event, uploadInputRef)}
        >
          {buttonText || "Hochladen"}
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={isProcessingProductImage}
          onClick={(event) => onOpenFileInput(event, cameraInputRef)}
        >
          {buttonText || "Kamera"}
        </button>
      </div>

      {processingProductImageSide === side && (
        <p className="form-hint">{processingText}</p>
      )}

      <input
        ref={uploadInputRef}
        className="visually-hidden-file-input"
        type="file"
        accept="image/*"
        onChange={(event) => onImageChange(event, fieldName, side)}
      />

      <input
        ref={cameraInputRef}
        className="visually-hidden-file-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => onImageChange(event, fieldName, side)}
      />

      {imagePath && (
        <div className="product-image-preview">
          <img src={createImageSrc(imagePath)} alt={altText} />

          <button
            type="button"
            className="secondary-button danger-outline-button"
            disabled={isProcessingProductImage}
            onClick={() => onRemoveImage(fieldName)}
          >
            {removeText}
          </button>
        </div>
      )}
    </div>
  );
}
