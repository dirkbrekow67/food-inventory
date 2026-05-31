// client/src/components/products/ProductsSection.jsx

import { useMemo, useState } from "react";

import {
  productCategoryOptions,
  productSortOptions,
} from "../../constants/selectOptions";

import { renderSelectOptions } from "../form/FormSelectOptions";

import { ProductForm } from "./ProductForm";
import { ProductGrid } from "./ProductGrid";

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
}) {
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productCountryFilter, setProductCountryFilter] = useState("all");
  const [productStoreFilter, setProductStoreFilter] = useState("all");
  const [productSortMode, setProductSortMode] = useState("name_asc");

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

  function resetProductFilters() {
    setProductSearchTerm("");
    setProductCategoryFilter("all");
    setProductCountryFilter("all");
    setProductStoreFilter("all");
    setProductSortMode("name_asc");
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Produkte</h2>
          <p>Produkt-Stammdaten mit Bewertung für spätere Einkäufe.</p>
        </div>

        <span className="result-count">
          {filteredProducts.length} von {products.length} Produkten
        </span>
      </div>

      <ProductForm
        productForm={productForm}
        editingProductId={editingProductId}
        savingProduct={savingProduct}
        onSaveProduct={onSaveProduct}
        onUpdateProductForm={onUpdateProductForm}
        onResetProductForm={onResetProductForm}
      />

      <div className="inventory-toolbar">
        <label className="inventory-search">
          Produkte suchen
          <input
            type="search"
            value={productSearchTerm}
            onChange={(event) => setProductSearchTerm(event.target.value)}
            placeholder="z. B. Pommes, Lidl, Polen, Milch"
          />
        </label>

        <div className="inventory-filter-row">
          <label>
            Kategorie
            <select
              value={productCategoryFilter}
              onChange={(event) => setProductCategoryFilter(event.target.value)}
            >
              {renderSelectOptions(productCategoryFilterOptions)}
            </select>
          </label>

          <label>
            Land
            <select
              value={productCountryFilter}
              onChange={(event) => setProductCountryFilter(event.target.value)}
            >
              {renderSelectOptions(productCountryFilterOptions)}
            </select>
          </label>

          <label>
            Geschäft
            <select
              value={productStoreFilter}
              onChange={(event) => setProductStoreFilter(event.target.value)}
            >
              {renderSelectOptions(productStoreFilterOptions)}
            </select>
          </label>

          <label>
            Sortierung
            <select
              value={productSortMode}
              onChange={(event) => setProductSortMode(event.target.value)}
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
      />
    </section>
  );
}
