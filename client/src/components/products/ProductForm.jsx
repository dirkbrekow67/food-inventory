// client/src/components/products/ProductForm.jsx

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
  async function handleFrontImageChange(event) {
    const file = event.target.files?.[0];

    try {
      const compressedImageDataUrl = await compressImageFileToDataUrl(file);

      if (compressedImageDataUrl) {
        onUpdateProductForm("imageFront", compressedImageDataUrl);
      }
    } catch (error) {
      console.error(error);
      window.alert("Das Produktfoto konnte nicht verarbeitet werden.");
    } finally {
      event.target.value = "";
    }
  }

  function removeFrontImage() {
    onUpdateProductForm("imageFront", "");
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

      <div className="product-image-field">
        <label>
          Produktfoto Vorderseite
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFrontImageChange}
          />
        </label>

        {productForm.imageFront && (
          <div className="product-image-preview">
            <img src={productForm.imageFront} alt="Produkt Vorderseite" />

            <button
              type="button"
              className="secondary-button danger-outline-button"
              onClick={removeFrontImage}
            >
              Foto entfernen
            </button>
          </div>
        )}
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
