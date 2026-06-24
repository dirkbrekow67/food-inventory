// client/src/components/products/ProductDetailsFields.jsx

import {
  buyAgainStatusOptions,
  productCategoryOptions,
  ratingOptions,
} from "../../constants/selectOptions";

import { countryOptions, storeOptions } from "../../constants/productOptions";

import { renderSelectOptions } from "../form/FormSelectOptions";

export function ProductDetailsFields({ productForm, onUpdateProductForm }) {
  return (
    <div className="form-grid">
      <label>
        Produktname *
        <input
          type="text"
          value={productForm.name}
          onChange={(event) => onUpdateProductForm("name", event.target.value)}
          placeholder="z. B. Pommes Frites"
        />
      </label>

      <label>
        Marke
        <input
          type="text"
          value={productForm.brand}
          onChange={(event) => onUpdateProductForm("brand", event.target.value)}
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
          onChange={(event) => onUpdateProductForm("rating", event.target.value)}
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
  );
}
