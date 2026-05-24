// client/src/components/products/ProductForm.jsx

import { useRef } from "react";

import {
  buyAgainStatusOptions,
  productCategoryOptions,
  ratingOptions,
} from "../../constants/selectOptions";

import { renderSelectOptions } from "../form/FormSelectOptions";

import { compressImageFileToDataUrl } from "../../utils/imageFileUtils";

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

  async function handleProductImageChange(event, fieldName) {
    const file = event.target.files?.[0];

    try {
      const compressedImageDataUrl = await compressImageFileToDataUrl(file);

      if (compressedImageDataUrl) {
        onUpdateProductForm(fieldName, compressedImageDataUrl);
      }
    } catch (error) {
      console.error(error);
      window.alert("Das Produktfoto konnte nicht verarbeitet werden.");
    } finally {
      event.target.value = "";
    }
  }

  function removeProductImage(fieldName) {
    onUpdateProductForm(fieldName, "");
  }

  function openFileInput(inputRef) {
    inputRef.current?.click();
  }

  return (
    <form className="product-form" onSubmit={onSaveProduct}>
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
            value={productForm.country}
            onChange={(event) =>
              onUpdateProductForm("country", event.target.value)
            }
            placeholder="z. B. Italien"
          />
        </label>

        <label>
          Geschäft
          <input
            type="text"
            value={productForm.store}
            onChange={(event) =>
              onUpdateProductForm("store", event.target.value)
            }
            placeholder="z. B. Coop"
          />
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
        <div className="product-image-field">
          <span className="product-image-label">Produktfoto Vorderseite</span>

          <div className="product-image-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => openFileInput(frontUploadInputRef)}
            >
              Hochladen
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => openFileInput(frontCameraInputRef)}
            >
              Kamera
            </button>
          </div>

          <input
            ref={frontUploadInputRef}
            className="visually-hidden-file-input"
            type="file"
            accept="image/*"
            onChange={(event) => handleProductImageChange(event, "imageFront")}
          />

          <input
            ref={frontCameraInputRef}
            className="visually-hidden-file-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => handleProductImageChange(event, "imageFront")}
          />

          {productForm.imageFront && (
            <div className="product-image-preview">
              <img src={productForm.imageFront} alt="Produkt Vorderseite" />

              <button
                type="button"
                className="secondary-button danger-outline-button"
                onClick={() => removeProductImage("imageFront")}
              >
                Vorderseite entfernen
              </button>
            </div>
          )}
        </div>

        <div className="product-image-field">
          <span className="product-image-label">Produktfoto Rückseite</span>

          <div className="product-image-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => openFileInput(backUploadInputRef)}
            >
              Hochladen
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => openFileInput(backCameraInputRef)}
            >
              Kamera
            </button>
          </div>

          <input
            ref={backUploadInputRef}
            className="visually-hidden-file-input"
            type="file"
            accept="image/*"
            onChange={(event) => handleProductImageChange(event, "imageBack")}
          />

          <input
            ref={backCameraInputRef}
            className="visually-hidden-file-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => handleProductImageChange(event, "imageBack")}
          />

          {productForm.imageBack && (
            <div className="product-image-preview">
              <img src={productForm.imageBack} alt="Produkt Rückseite" />

              <button
                type="button"
                className="secondary-button danger-outline-button"
                onClick={() => removeProductImage("imageBack")}
              >
                Rückseite entfernen
              </button>
            </div>
          )}
        </div>
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
        <button type="submit" disabled={savingProduct}>
          {savingProduct
            ? "Speichern..."
            : editingProductId
              ? "Änderungen speichern"
              : "Produkt anlegen"}
        </button>
      </div>
    </form>
  );
}
