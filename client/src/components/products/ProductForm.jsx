// client/src/components/products/ProductForm.jsx

import { useRef, useState } from "react";

import {
  buyAgainStatusOptions,
  productCategoryOptions,
  ratingOptions,
} from "../../constants/selectOptions";

import { renderSelectOptions } from "../form/FormSelectOptions";

import { compressImageFileToDataUrl } from "../../utils/imageFileUtils";

import {
  PRODUCT_IMAGE_UPLOAD_MISSING_PATH_ERROR_MESSAGE,
  getProductImageErrorMessage,
  isProductImageFile,
  resetProductImageInput,
} from "../../utils/productImageFormUtils";

import { uploadProductPhoto } from "../../api/productApi";

import { createImageSrc } from "../../utils/imageUrlUtils";

import { countryOptions, storeOptions } from "../../constants/productOptions";

export function ProductForm({
  productForm,
  editingProductId,
  savingProduct,
  onSaveProduct,
  onUpdateProductForm,
  onResetProductForm,
}) {
  const frontUploadInputRef = useRef(null);
  const frontCameraInputRef = useRef(null);
  const backUploadInputRef = useRef(null);
  const backCameraInputRef = useRef(null);

  const [processingProductImageSide, setProcessingProductImageSide] =
    useState("");

  const isProcessingProductImage = Boolean(processingProductImageSide);

  async function handleProductImageChange(event, fieldName, side) {
    event.preventDefault();
    event.stopPropagation();

    if (isProcessingProductImage) {
      return;
    }

    const inputElement = event.currentTarget;
    const file = inputElement.files?.[0];

    if (!file) {
      resetProductImageInput(inputElement);
      return;
    }

    if (!isProductImageFile(file)) {
      resetProductImageInput(inputElement);
      window.alert("Bitte eine Bilddatei auswählen oder ein Foto aufnehmen.");
      return;
    }

    try {
      setProcessingProductImageSide(side);

      const compressedImageDataUrl = await compressImageFileToDataUrl(file);

      if (!compressedImageDataUrl) {
        return;
      }

      const uploadedPhoto = await uploadProductPhoto({
        productId: editingProductId || "new",
        side,
        imageDataUrl: compressedImageDataUrl,
      });

      if (!uploadedPhoto?.imagePath) {
        throw new Error(PRODUCT_IMAGE_UPLOAD_MISSING_PATH_ERROR_MESSAGE);
      }

      onUpdateProductForm(fieldName, uploadedPhoto.imagePath);
    } catch (error) {
      console.error(error);
      window.alert(getProductImageErrorMessage(error));
    } finally {
      resetProductImageInput(inputElement);
      setProcessingProductImageSide("");
    }
  }

  function getProductImageButtonText(side, defaultText) {
    return processingProductImageSide === side ? "Verarbeite..." : defaultText;
  }

  function removeProductImage(fieldName) {
    onUpdateProductForm(fieldName, "");
  }

  function openFileInput(event, inputRef) {
    event.preventDefault();
    event.stopPropagation();

    const inputElement = inputRef.current;

    if (!inputElement || isProcessingProductImage) {
      return;
    }

    inputElement.value = "";
    inputElement.click();
  }

  function renderProductImageField({
    fieldName,
    side,
    uploadInputRef,
    cameraInputRef,
    label,
    processingText,
    imagePath,
    altText,
    removeText,
  }) {
    return (
      <div className="product-image-field">
        <span className="product-image-label">{label}</span>

        <div className="product-image-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={isProcessingProductImage}
            onClick={(event) => openFileInput(event, uploadInputRef)}
          >
            {getProductImageButtonText(side, "Hochladen")}
          </button>

          <button
            type="button"
            className="secondary-button"
            disabled={isProcessingProductImage}
            onClick={(event) => openFileInput(event, cameraInputRef)}
          >
            {getProductImageButtonText(side, "Kamera")}
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
          onChange={(event) => handleProductImageChange(event, fieldName, side)}
        />

        <input
          ref={cameraInputRef}
          className="visually-hidden-file-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => handleProductImageChange(event, fieldName, side)}
        />

        {imagePath && (
          <div className="product-image-preview">
            <img src={createImageSrc(imagePath)} alt={altText} />

            <button
              type="button"
              className="secondary-button danger-outline-button"
              disabled={isProcessingProductImage}
              onClick={() => removeProductImage(fieldName)}
            >
              {removeText}
            </button>
          </div>
        )}
      </div>
    );
  }

  function handleProductFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isProcessingProductImage) {
      return;
    }

    onSaveProduct(event);
  }

  return (
    <form
      className="product-form"
      aria-busy={isProcessingProductImage ? "true" : "false"}
      onSubmit={handleProductFormSubmit}
    >
      <div className="form-title-row">
        <h3>
          {editingProductId ? "Produkt bearbeiten" : "Neues Produkt anlegen"}
        </h3>

        {editingProductId && (
          <button
            type="button"
            className="secondary-button"
            onClick={onResetProductForm}
          >
            Bearbeitung abbrechen
          </button>
        )}
      </div>

      <div className="form-grid">
        <label>
          Produktname *
          <input
            type="text"
            value={productForm.name}
            onChange={(event) =>
              onUpdateProductForm("name", event.target.value)
            }
            placeholder="z. B. Pommes Frites"
          />
        </label>

        <label>
          Marke
          <input
            type="text"
            value={productForm.brand}
            onChange={(event) =>
              onUpdateProductForm("brand", event.target.value)
            }
            placeholder="z. B. Coop Italia"
          />
        </label>

        <label>
          Kategorie
          <select
            value={productForm.category}
            onChange={(event) =>
              onUpdateProductForm("category", event.target.value)
            }
          >
            {renderSelectOptions(productCategoryOptions)}
          </select>
        </label>

        <label>
          Land
          <input
            type="text"
            list="country-options"
            value={productForm.country}
            onChange={(event) =>
              onUpdateProductForm("country", event.target.value)
            }
            placeholder="z. B. Italien"
          />
          <datalist id="country-options">
            {countryOptions.map((country) => (
              <option value={country} key={country} />
            ))}
          </datalist>
        </label>

        <label>
          Geschäft
          <input
            type="text"
            list="store-options"
            value={productForm.store}
            onChange={(event) =>
              onUpdateProductForm("store", event.target.value)
            }
            placeholder="z. B. Lidl"
          />
          <datalist id="store-options">
            {storeOptions.map((store) => (
              <option value={store} key={store} />
            ))}
          </datalist>
        </label>

        <label>
          Bewertung
          <select
            value={productForm.buyAgainStatus}
            onChange={(event) =>
              onUpdateProductForm("buyAgainStatus", event.target.value)
            }
          >
            {renderSelectOptions(buyAgainStatusOptions)}
          </select>
        </label>

        <label>
          Sterne
          <select
            value={productForm.rating}
            onChange={(event) =>
              onUpdateProductForm("rating", event.target.value)
            }
          >
            {renderSelectOptions(ratingOptions)}
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={productForm.favorite}
            onChange={(event) =>
              onUpdateProductForm("favorite", event.target.checked)
            }
          />
          Favorit
        </label>
      </div>

      <div className="product-image-grid">
        {renderProductImageField({
          fieldName: "imageFront",
          side: "front",
          uploadInputRef: frontUploadInputRef,
          cameraInputRef: frontCameraInputRef,
          label: "Produktfoto Vorderseite",
          processingText: "Vorderseite wird verarbeitet...",
          imagePath: productForm.imageFront,
          altText: "Produkt Vorderseite",
          removeText: "Vorderseite entfernen",
        })}

        {renderProductImageField({
          fieldName: "imageBack",
          side: "back",
          uploadInputRef: backUploadInputRef,
          cameraInputRef: backCameraInputRef,
          label: "Produktfoto Rückseite",
          processingText: "Rückseite wird verarbeitet...",
          imagePath: productForm.imageBack,
          altText: "Produkt Rückseite",
          removeText: "Rückseite entfernen",
        })}
      </div>

      <label>
        Notiz
        <textarea
          value={productForm.notes}
          onChange={(event) => onUpdateProductForm("notes", event.target.value)}
          placeholder="z. B. beim nächsten Italien-Einkauf wieder mitnehmen"
          rows="3"
        />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={savingProduct || isProcessingProductImage}>
          {isProcessingProductImage
            ? "Foto wird verarbeitet..."
            : savingProduct
              ? "Speichern..."
              : editingProductId
                ? "Änderungen speichern"
                : "Produkt anlegen"}
        </button>
      </div>
    </form>
  );
}
