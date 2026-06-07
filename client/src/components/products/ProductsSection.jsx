// client/src/components/products/ProductsSection.jsx

import { useMemo, useState } from "react";

import {
  productCategoryOptions,
  productSortOptions,
} from "../../constants/selectOptions";

import { renderSelectOptions } from "../form/FormSelectOptions";

import { ProductForm } from "./ProductForm";
import { ProductGrid } from "./ProductGrid";

const PRODUCT_FILTER_STORAGE_KEY = "food-inventory.productFilters";

const initialProductFilterState = {
  productSearchTerm: "",
  productCategoryFilter: "all",
  productCountryFilter: "all",
  productStoreFilter: "all",
  productSortMode: "name_asc",
};

function loadProductFilterState() {
  try {
    const storedValue = window.localStorage.getItem(PRODUCT_FILTER_STORAGE_KEY);

    if (!storedValue) {
      return initialProductFilterState;
    }

    return {
      ...initialProductFilterState,
      ...JSON.parse(storedValue),
    };
  } catch (error) {
    console.error(error);
    return initialProductFilterState;
  }
}

function saveProductFilterState(nextFilterState) {
  try {
    window.localStorage.setItem(
      PRODUCT_FILTER_STORAGE_KEY,
      JSON.stringify(nextFilterState),
    );
  } catch (error) {
    console.error(error);
  }

  return nextFilterState;
}

function compareText(firstValue, secondValue) {
  return String(firstValue || "").localeCompare(
    String(secondValue || ""),
    "de",
    {
      sensitivity: "base",
      numeric: true,
    },
  );
}

function getUniqueProductOptions(products, fieldName, defaultLabel) {
  const uniqueValues = Array.from(
    new Set(
      products
        .map((product) => product[fieldName])
        .filter((value) => value && String(value).trim()),
    ),
  ).sort((firstValue, secondValue) => compareText(firstValue, secondValue));

  return [
    { value: "all", label: defaultLabel },
    ...uniqueValues.map((value) => ({
      value,
      label: value,
    })),
  ];
}

function productMatchesSearch(product, searchTerm) {
  if (!searchTerm.trim()) {
    return true;
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  return [
    product.name,
    product.brand,
    product.category,
    product.country,
    product.store,
    product.notes,
  ]
    .filter(Boolean)
    .some((value) =>
      String(value).toLowerCase().includes(normalizedSearchTerm),
    );
}

function sortProducts(products, productSortMode) {
  return [...products].sort((firstProduct, secondProduct) => {
    if (productSortMode === "name_desc") {
      return compareText(secondProduct.name, firstProduct.name);
    }

    if (productSortMode === "id_desc") {
      return Number(secondProduct.id || 0) - Number(firstProduct.id || 0);
    }

    if (productSortMode === "id_asc") {
      return Number(firstProduct.id || 0) - Number(secondProduct.id || 0);
    }

    if (productSortMode === "category_asc") {
      return (
        compareText(firstProduct.category, secondProduct.category) ||
        compareText(firstProduct.name, secondProduct.name)
      );
    }

    if (productSortMode === "country_asc") {
      return (
        compareText(firstProduct.country, secondProduct.country) ||
        compareText(firstProduct.name, secondProduct.name)
      );
    }

    if (productSortMode === "store_asc") {
      return (
        compareText(firstProduct.store, secondProduct.store) ||
        compareText(firstProduct.name, secondProduct.name)
      );
    }

    if (productSortMode === "rating_desc") {
      return (
        Number(secondProduct.rating || 0) - Number(firstProduct.rating || 0) ||
        compareText(firstProduct.name, secondProduct.name)
      );
    }

    return compareText(firstProduct.name, secondProduct.name);
  });
}

export function ProductsSection({
  productForm,
  editingProductId,
  hasProductFormDraft,
  onDiscardProductFormDraft,
  savingProduct,
  loadingProducts,
  products,
  historyItems,
  onSaveProduct,
  onUpdateProductForm,
  onResetProductForm,
  onEditProduct,
  onShowProductHistory,
  onDeactivateProduct,
  onAddProductToShoppingList,
  savingShoppingListItem,
}) {
  const [productFilterState, setProductFilterState] = useState(() =>
    loadProductFilterState(),
  );

  const {
    productSearchTerm,
    productCategoryFilter,
    productCountryFilter,
    productStoreFilter,
    productSortMode,
  } = productFilterState;

  const [showProductForm, setShowProductForm] = useState(false);

  const productCountryFilterOptions = useMemo(
    () => getUniqueProductOptions(products, "country", "Alle Länder"),
    [products],
  );

  const productStoreFilterOptions = useMemo(
    () => getUniqueProductOptions(products, "store", "Alle Geschäfte"),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const nextProducts = products.filter((product) => {
      const matchesSearch = productMatchesSearch(product, productSearchTerm);

      const matchesCategory =
        productCategoryFilter === "all" ||
        product.category === productCategoryFilter;

      const matchesCountry =
        productCountryFilter === "all" ||
        product.country === productCountryFilter;

      const matchesStore =
        productStoreFilter === "all" || product.store === productStoreFilter;

      return matchesSearch && matchesCategory && matchesCountry && matchesStore;
    });

    return sortProducts(nextProducts, productSortMode);
  }, [
    products,
    productSearchTerm,
    productCategoryFilter,
    productCountryFilter,
    productStoreFilter,
    productSortMode,
  ]);

  const productCategoryFilterOptions = [
    { value: "all", label: "Alle Kategorien" },
    ...productCategoryOptions.filter((option) => option.value),
  ];

  const hasActiveProductFilters =
    Boolean(productSearchTerm.trim()) ||
    productCategoryFilter !== "all" ||
    productCountryFilter !== "all" ||
    productStoreFilter !== "all" ||
    productSortMode !== "name_asc";

  function updateProductFilter(field, value) {
    setProductFilterState((currentFilterState) => {
      const nextFilterState = {
        ...currentFilterState,
        [field]: value,
      };

      return saveProductFilterState(nextFilterState);
    });
  }

  function resetProductFilters() {
    setProductFilterState(saveProductFilterState(initialProductFilterState));
  }

  function openProductForm() {
    setShowProductForm(true);
  }

  function closeProductForm() {
    setShowProductForm(false);
    onResetProductForm();
  }

  async function handleSaveProduct(event) {
    const savedSuccessfully = await onSaveProduct(event);

    if (savedSuccessfully) {
      setShowProductForm(false);
    }
  }

  const shouldShowProductForm = showProductForm || Boolean(editingProductId);

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Produkte</h2>
          <p>Produkt-Stammdaten mit Bewertung für spätere Einkäufe.</p>
        </div>

        <div className="section-header-actions">
          <span className="result-count">
            {filteredProducts.length} von {products.length} Produkten
          </span>

          {!shouldShowProductForm && (
            <button
              type="button"
              className="secondary-button"
              onClick={openProductForm}
            >
              {hasProductFormDraft
                ? "Produktentwurf öffnen"
                : "Neues Produkt anlegen"}
            </button>
          )}
        </div>
      </div>

      {hasProductFormDraft && !editingProductId && (
        <div className="draft-hint">
          <div>
            <strong>Gespeicherter Produktentwurf vorhanden.</strong>
            <p>
              Das zuletzt begonnene Produkt wurde lokal gespeichert und kann
              weiterbearbeitet werden.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button danger-outline-button"
            onClick={onDiscardProductFormDraft}
            disabled={savingProduct}
          >
            Entwurf verwerfen
          </button>
        </div>
      )}

      {shouldShowProductForm && (
        <ProductForm
          productForm={productForm}
          editingProductId={editingProductId}
          savingProduct={savingProduct}
          onSaveProduct={handleSaveProduct}
          onUpdateProductForm={onUpdateProductForm}
          onResetProductForm={closeProductForm}
        />
      )}

      <div className="inventory-toolbar">
        <label className="inventory-search">
          Produkte suchen
          <input
            type="search"
            value={productSearchTerm}
            onChange={(event) =>
              updateProductFilter("productSearchTerm", event.target.value)
            }
            placeholder="z. B. Pommes, Lidl, Polen, Milch"
          />
        </label>

        <div className="inventory-filter-row">
          <label>
            Kategorie
            <select
              value={productCategoryFilter}
              onChange={(event) =>
                updateProductFilter("productCategoryFilter", event.target.value)
              }
            >
              {renderSelectOptions(productCategoryFilterOptions)}
            </select>
          </label>

          <label>
            Land
            <select
              value={productCountryFilter}
              onChange={(event) =>
                updateProductFilter("productCountryFilter", event.target.value)
              }
            >
              {renderSelectOptions(productCountryFilterOptions)}
            </select>
          </label>

          <label>
            Geschäft
            <select
              value={productStoreFilter}
              onChange={(event) =>
                updateProductFilter("productStoreFilter", event.target.value)
              }
            >
              {renderSelectOptions(productStoreFilterOptions)}
            </select>
          </label>

          <label>
            Sortierung
            <select
              value={productSortMode}
              onChange={(event) =>
                updateProductFilter("productSortMode", event.target.value)
              }
            >
              {renderSelectOptions(productSortOptions)}
            </select>
          </label>

          <button
            type="button"
            className="secondary-button"
            onClick={resetProductFilters}
            disabled={!hasActiveProductFilters}
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>

      {loadingProducts && <p className="muted">Produkte werden geladen...</p>}

      {!loadingProducts && products.length === 0 && (
        <p className="muted">Noch keine Produkte vorhanden.</p>
      )}

      {!loadingProducts &&
        products.length > 0 &&
        filteredProducts.length === 0 && (
          <p className="muted">Keine passenden Produkte gefunden.</p>
        )}

      <ProductGrid
        products={filteredProducts}
        historyItems={historyItems}
        onEditProduct={onEditProduct}
        onShowProductHistory={onShowProductHistory}
        onDeactivateProduct={onDeactivateProduct}
        onAddProductToShoppingList={onAddProductToShoppingList}
        savingShoppingListItem={savingShoppingListItem}
      />
    </section>
  );
}
