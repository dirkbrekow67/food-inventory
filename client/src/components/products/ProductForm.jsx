// client/src/components/products/ProductForm.jsx

import { useRef, useState } from "react";

import { compressImageFileToDataUrl } from "../../utils/imageFileUtils";

import {
  PRODUCT_IMAGE_UPLOAD_MISSING_PATH_ERROR_MESSAGE,
  getProductImageErrorMessage,
  isProductImageFile,
  resetProductImageInput,
} from "../../utils/productImageFormUtils";

import { uploadProductPhoto } from "../../api/productApi";

import { ProductImageSection } from "./ProductImageSection";

import { ProductDetailsFields } from "./ProductDetailsFields";


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

      <ProductDetailsFields
        productForm={productForm}
        onUpdateProductForm={onUpdateProductForm}
      />

      <ProductImageSection
        productForm={productForm}
        frontUploadInputRef={frontUploadInputRef}
        frontCameraInputRef={frontCameraInputRef}
        backUploadInputRef={backUploadInputRef}
        backCameraInputRef={backCameraInputRef}
        isProcessingProductImage={isProcessingProductImage}
        processingProductImageSide={processingProductImageSide}
        onOpenFileInput={openFileInput}
        onImageChange={handleProductImageChange}
        onRemoveImage={removeProductImage}
      />

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
