import { useEffect, useState } from "react";
import "./App.css";

import {
  formatDateGerman,
  formatQuantity,
  getBuyAgainLabel,
  getExperienceReasonLabel,
  getInventoryDateStatus,
  getInventoryDateStatusLabel,
  getInventoryEffectiveDate,
  getPackageStateLabel,
  getRemovalReasonLabel,
} from "./utils/formattersUtils";

import { emptyInventoryForm, emptyProductForm } from "./constants/formDefaults";

const API_BASE_URL = "http://localhost:3101/api";

function App() {
  const [storageTree, setStorageTree] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyReasonFilter, setHistoryReasonFilter] = useState("all");
  const [historyBuyAgainFilter, setHistoryBuyAgainFilter] = useState("all");
  const [historyProductFilter, setHistoryProductFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");
  const [historyDialogItem, setHistoryDialogItem] = useState(null);
  const [historyEditReason, setHistoryEditReason] = useState("sonstiges");
  const [historyDeleteDialogItem, setHistoryDeleteDialogItem] = useState(null);
  const [deletingHistoryItem, setDeletingHistoryItem] = useState(false);
  const [historyEditBuyAgainStatus, setHistoryEditBuyAgainStatus] =
    useState("neutral");
  const [historyEditExperienceReason, setHistoryEditExperienceReason] =
    useState("keine");
  const [historyEditExperienceNote, setHistoryEditExperienceNote] =
    useState("");
  const [historyEditNotes, setHistoryEditNotes] = useState("");
  const [savingHistoryItem, setSavingHistoryItem] = useState(false);

  const [productForm, setProductForm] = useState(() => emptyProductForm);
  const [inventoryForm, setInventoryForm] = useState(() => emptyInventoryForm);

  const [savingInventoryItem, setSavingInventoryItem] = useState(false);
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState("all");
  const [inventoryStorageFilter, setInventoryStorageFilter] = useState("all");
  const [removalDialogItem, setRemovalDialogItem] = useState(null);
  const [removalReason, setRemovalReason] = useState("verbraucht");
  const [removalProductStatus, setRemovalProductStatus] =
    useState("unverändert");
  const [removingInventoryItem, setRemovingInventoryItem] = useState(false);
  const [saveRemovalToHistory, setSaveRemovalToHistory] = useState(false);
  const [experienceReason, setExperienceReason] = useState("keine");
  const [experienceNote, setExperienceNote] = useState("");

  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setErrorMessage("");

        const [
          storageResponse,
          productsResponse,
          inventoryResponse,
          historyResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/storage/tree`),
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/inventory`),
          fetch(`${API_BASE_URL}/history`),
        ]);

        if (!storageResponse.ok) {
          throw new Error("Lagerstruktur konnte nicht geladen werden.");
        }

        if (!productsResponse.ok) {
          throw new Error("Produkte konnten nicht geladen werden.");
        }

        if (!inventoryResponse.ok) {
          throw new Error("Bestand konnte nicht geladen werden.");
        }

        if (!historyResponse.ok) {
          throw new Error("Produkthistorie konnte nicht geladen werden.");
        }

        const storageData = await storageResponse.json();
        const productData = await productsResponse.json();
        const inventoryData = await inventoryResponse.json();
        const historyData = await historyResponse.json();

        setStorageTree(storageData);
        setProducts(productData);
        setInventoryItems(inventoryData);
        setHistoryItems(historyData);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Daten konnten nicht geladen werden. Läuft der Server?",
        );
      } finally {
        setLoadingStorage(false);
        setLoadingProducts(false);
        setLoadingInventory(false);
        setLoadingHistory(false);
      }
    }

    loadData();
  }, []);

  function updateProductForm(field, value) {
    setProductForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function resetProductForm() {
    setProductForm({ ...emptyProductForm });
    setEditingProductId(null);
  }

  function updateInventoryForm(field, value) {
    setInventoryForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function resetInventoryForm() {
    setInventoryForm({ ...emptyInventoryForm });
  }

  function getAllStorageUnits() {
    return storageTree.flatMap((location) =>
      location.units.map((unit) => ({
        ...unit,
        locationName: location.name,
      })),
    );
  }

  function getCompartmentsForSelectedUnit() {
    const selectedUnitId = Number(inventoryForm.storageUnitId);

    if (!selectedUnitId) {
      return [];
    }

    return (
      storageTree
        .flatMap((location) => location.units)
        .find((unit) => unit.id === selectedUnitId)?.compartments || []
    );
  }

  function getLatestInventoryItemForProduct(productId) {
    return inventoryItems
      .filter((item) => item.product_id === Number(productId))
      .sort((a, b) =>
        String(b.created_at).localeCompare(String(a.created_at)),
      )[0];
  }

  function handleInventoryProductChange(productId) {
    const latestItem = getLatestInventoryItemForProduct(productId);

    setInventoryForm((currentForm) => ({
      ...currentForm,
      productId,

      storageUnitId: latestItem ? String(latestItem.storage_unit_id) : "",
      storageCompartmentId: latestItem?.storage_compartment_id
        ? String(latestItem.storage_compartment_id)
        : "",

      originalQuantity: latestItem?.original_quantity
        ? String(latestItem.original_quantity)
        : "",
      originalUnit: latestItem?.original_unit || "g",

      remainingQuantity: "",
      remainingUnit:
        latestItem?.remaining_unit || latestItem?.original_unit || "g",
      remainingFraction: "",

      quantityEstimated: latestItem?.quantity_estimated === 1,
      packageState: latestItem?.package_state || "ungeoeffnet",

      bestBeforeDate: "",
      frozenDate: "",
      openedDate: "",

      isFrozenChilledFood: latestItem?.is_frozen_chilled_food === 1,
      internalExtensionMonths: latestItem?.internal_extension_months
        ? String(latestItem.internal_extension_months)
        : "6",

      notes: "",
    }));
  }

  function getInventoryStorageFilterOptions() {
    const storageOptions = inventoryItems.map((item) => ({
      id: item.storage_unit_id,
      name: item.storage_unit_name,
    }));

    return storageOptions
      .filter(
        (option, index, allOptions) =>
          allOptions.findIndex((item) => item.id === option.id) === index,
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, "de", { sensitivity: "base" }),
      );
  }

  function matchesInventorySearch(item, searchTerm) {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return true;
    }

    const searchableText = [
      item.label_code,
      item.product_name,
      item.product_brand,
      item.product_category,
      item.storage_unit_name,
      item.storage_compartment_name,
      item.notes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  }

  function getFilteredInventoryItems() {
    return inventoryItems.filter((item) => {
      const matchesSearch = matchesInventorySearch(item, inventorySearchTerm);

      const matchesStatus =
        inventoryStatusFilter === "all" ||
        getInventoryDateStatus(item) === inventoryStatusFilter;

      const matchesStorage =
        inventoryStorageFilter === "all" ||
        String(item.storage_unit_id) === inventoryStorageFilter;

      return matchesSearch && matchesStatus && matchesStorage;
    });
  }

  function getHistoryItemsForProduct(productId) {
    return historyItems.filter((item) => item.product_id === Number(productId));
  }

  function getLatestHistoryItemForProduct(productId) {
    return getHistoryItemsForProduct(productId)[0] || null;
  }

  function getProductHistorySummary(productId) {
    const productHistoryItems = getHistoryItemsForProduct(productId);
    const latestHistoryItem = getLatestHistoryItemForProduct(productId);

    return {
      count: productHistoryItems.length,
      latestItem: latestHistoryItem,
    };
  }

  function showProductHistory(product) {
    setHistoryProductFilter(String(product.id));
    setHistorySearchTerm("");
    setHistoryReasonFilter("all");
    setHistoryBuyAgainFilter("all");

    document
      .getElementById("product-history-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function matchesHistorySearch(item, searchTerm) {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return true;
    }

    const searchableText = [
      item.product_name,
      item.product_brand,
      item.product_category,
      item.product_country,
      item.product_store,
      item.label_code,
      item.removal_reason,
      item.product_buy_again_status_after_removal,
      item.experience_reason,
      item.experience_note,
      item.notes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  }

  function getFilteredHistoryItems() {
    return historyItems.filter((item) => {
      const matchesSearch = matchesHistorySearch(item, historySearchTerm);

      const matchesReason =
        historyReasonFilter === "all" ||
        item.removal_reason === historyReasonFilter;

      const matchesBuyAgain =
        historyBuyAgainFilter === "all" ||
        item.product_buy_again_status_after_removal === historyBuyAgainFilter;

      const matchesProduct =
        historyProductFilter === "all" ||
        String(item.product_id) === historyProductFilter;

      return (
        matchesSearch && matchesReason && matchesBuyAgain && matchesProduct
      );
    });
  }

  function parseRemainingFraction(value) {
    if (!value) {
      return {
        numerator: null,
        denominator: null,
      };
    }

    const [numerator, denominator] = value.split("/").map(Number);

    return {
      numerator,
      denominator,
    };
  }

  async function handleSaveProduct(event) {
    event.preventDefault();

    if (!productForm.name.trim()) {
      setErrorMessage("Bitte einen Produktnamen eingeben.");
      return;
    }

    try {
      setSavingProduct(true);
      setErrorMessage("");

      const payload = {
        name: productForm.name.trim(),
        brand: productForm.brand.trim() || null,
        category: productForm.category.trim() || null,
        country: productForm.country.trim() || null,
        store: productForm.store.trim() || null,
        buyAgainStatus: productForm.buyAgainStatus,
        rating: productForm.rating ? Number(productForm.rating) : null,
        notes: productForm.notes.trim() || null,
        favorite: productForm.favorite ? 1 : 0,
      };

      const url = editingProductId
        ? `${API_BASE_URL}/products/${editingProductId}`
        : `${API_BASE_URL}/products`;

      const method = editingProductId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Produkt konnte nicht gespeichert werden.");
      }

      const savedProduct = await response.json();

      setProducts((currentProducts) => {
        const productExists = currentProducts.some(
          (product) => product.id === savedProduct.id,
        );

        const nextProducts = productExists
          ? currentProducts.map((product) =>
              product.id === savedProduct.id ? savedProduct : product,
            )
          : [...currentProducts, savedProduct];

        return nextProducts.sort((a, b) =>
          a.name.localeCompare(b.name, "de", { sensitivity: "base" }),
        );
      });

      resetProductForm();
    } catch (error) {
      console.error(error);
      setErrorMessage("Produkt konnte nicht gespeichert werden.");
    } finally {
      setSavingProduct(false);
    }
  }

  function startEditProduct(product) {
    setEditingProductId(product.id);

    setProductForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      country: product.country || "",
      store: product.store || "",
      buyAgainStatus: product.buy_again_status || "neutral",
      rating: product.rating ? String(product.rating) : "",
      notes: product.notes || "",
      favorite: product.favorite === 1,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deactivateProduct(productId) {
    const confirmed = window.confirm(
      "Dieses Produkt wirklich deaktivieren? Es wird nicht endgültig gelöscht.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Produkt konnte nicht deaktiviert werden.");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId),
      );

      if (editingProductId === productId) {
        resetProductForm();
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Produkt konnte nicht deaktiviert werden.");
    }
  }

  async function handleCreateInventoryItem(event) {
    event.preventDefault();

    if (!inventoryForm.productId || !inventoryForm.storageUnitId) {
      setErrorMessage("Bitte Produkt und Lagergerät auswählen.");
      return;
    }

    try {
      setSavingInventoryItem(true);
      setErrorMessage("");

      const fraction = parseRemainingFraction(inventoryForm.remainingFraction);

      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: Number(inventoryForm.productId),
          storageUnitId: Number(inventoryForm.storageUnitId),
          storageCompartmentId: inventoryForm.storageCompartmentId
            ? Number(inventoryForm.storageCompartmentId)
            : null,

          originalQuantity: inventoryForm.originalQuantity
            ? Number(inventoryForm.originalQuantity)
            : null,
          originalUnit: inventoryForm.originalUnit || null,
          remainingQuantity: inventoryForm.remainingQuantity
            ? Number(inventoryForm.remainingQuantity)
            : null,
          remainingUnit: inventoryForm.remainingUnit || null,
          remainingFractionNumerator: fraction.numerator,
          remainingFractionDenominator: fraction.denominator,
          quantityEstimated: inventoryForm.quantityEstimated ? 1 : 0,

          packageState: inventoryForm.packageState,
          bestBeforeDate: inventoryForm.bestBeforeDate || null,
          frozenDate: inventoryForm.frozenDate || null,
          openedDate: inventoryForm.openedDate || null,
          isFrozenChilledFood: inventoryForm.isFrozenChilledFood ? 1 : 0,
          internalExtensionMonths: inventoryForm.internalExtensionMonths
            ? Number(inventoryForm.internalExtensionMonths)
            : 6,
          notes: inventoryForm.notes.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Bestand konnte nicht gespeichert werden.");
      }

      const createdItem = await response.json();

      setInventoryItems((currentItems) =>
        [...currentItems, createdItem].sort((a, b) => {
          const dateA = getInventoryEffectiveDate(a);
          const dateB = getInventoryEffectiveDate(b);

          if (!dateA && dateB) return 1;
          if (dateA && !dateB) return -1;

          return String(dateA || "").localeCompare(String(dateB || ""));
        }),
      );

      resetInventoryForm();
    } catch (error) {
      console.error(error);
      setErrorMessage("Bestand konnte nicht gespeichert werden.");
    } finally {
      setSavingInventoryItem(false);
    }
  }

  function openHistoryDeleteDialog(item) {
    setHistoryDeleteDialogItem(item);
  }

  function closeHistoryDeleteDialog() {
    if (deletingHistoryItem) {
      return;
    }

    setHistoryDeleteDialogItem(null);
  }

  async function confirmDeleteHistoryItem() {
    if (!historyDeleteDialogItem) {
      return;
    }

    try {
      setDeletingHistoryItem(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE_URL}/history/${historyDeleteDialogItem.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Historieneintrag konnte nicht gelöscht werden.");
      }

      setHistoryItems((currentItems) =>
        currentItems.filter((item) => item.id !== historyDeleteDialogItem.id),
      );

      setHistoryDeleteDialogItem(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Historieneintrag konnte nicht gelöscht werden.");
    } finally {
      setDeletingHistoryItem(false);
    }
  }

  function openHistoryDialog(item) {
    setHistoryDialogItem(item);
    setHistoryEditReason(item.removal_reason || "sonstiges");
    setHistoryEditBuyAgainStatus(
      item.product_buy_again_status_after_removal || "neutral",
    );
    setHistoryEditExperienceReason(item.experience_reason || "keine");
    setHistoryEditExperienceNote(item.experience_note || "");
    setHistoryEditNotes(item.notes || "");
  }

  function closeHistoryDialog() {
    if (savingHistoryItem) {
      return;
    }

    setHistoryDialogItem(null);
    setHistoryEditReason("sonstiges");
    setHistoryEditBuyAgainStatus("neutral");
    setHistoryEditExperienceReason("keine");
    setHistoryEditExperienceNote("");
    setHistoryEditNotes("");
  }

  async function confirmSaveHistoryItem() {
    if (!historyDialogItem) {
      return;
    }

    try {
      setSavingHistoryItem(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE_URL}/history/${historyDialogItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            removalReason: historyEditReason,
            productBuyAgainStatus: historyEditBuyAgainStatus,
            experienceReason: historyEditExperienceReason,
            experienceNote: historyEditExperienceNote,
            notes: historyEditNotes,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Historieneintrag konnte nicht gespeichert werden.");
      }

      const updatedHistoryItem = await response.json();

      setHistoryItems((currentItems) =>
        currentItems.map((item) =>
          item.id === updatedHistoryItem.id ? updatedHistoryItem : item,
        ),
      );

      setHistoryDialogItem(null);
      setHistoryEditReason("sonstiges");
      setHistoryEditBuyAgainStatus("neutral");
      setHistoryEditExperienceReason("keine");
      setHistoryEditExperienceNote("");
      setHistoryEditNotes("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Historieneintrag konnte nicht gespeichert werden.");
    } finally {
      setSavingHistoryItem(false);
    }
  }

  function shouldSuggestHistory(reason, productStatus) {
    if (reason === "falsch_erfasst") {
      return false;
    }

    if (reason === "abgelaufen" || reason === "entsorgt") {
      return true;
    }

    return productStatus !== "unverändert";
  }

  function openRemovalDialog(item) {
    setRemovalDialogItem(item);
    setRemovalReason("verbraucht");
    setRemovalProductStatus("unverändert");
    setSaveRemovalToHistory(false);
    setExperienceReason("keine");
    setExperienceNote("");
  }

  function closeRemovalDialog() {
    if (removingInventoryItem) {
      return;
    }

    setRemovalDialogItem(null);
    setRemovalReason("verbraucht");
    setRemovalProductStatus("unverändert");
    setSaveRemovalToHistory(false);
    setExperienceReason("keine");
    setExperienceNote("");
  }

  async function confirmRemoveInventoryItem() {
    if (!removalDialogItem) {
      return;
    }

    try {
      setRemovingInventoryItem(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE_URL}/inventory/${removalDialogItem.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            removalReason,
            productBuyAgainStatus:
              removalProductStatus === "unverändert"
                ? null
                : removalProductStatus,
            saveToHistory: saveRemovalToHistory,
            experienceReason,
            experienceNote,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Bestand konnte nicht entfernt werden.");
      }

      const result = await response.json();

      if (result.savedToHistory) {
        const historyResponse = await fetch(`${API_BASE_URL}/history`);

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistoryItems(historyData);
        }
      }

      setInventoryItems((currentItems) =>
        currentItems.filter(
          (currentItem) => currentItem.id !== removalDialogItem.id,
        ),
      );

      if (result.product) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === result.product.id ? result.product : product,
          ),
        );
      }

      setRemovalDialogItem(null);
      setRemovalReason("verbraucht");
      setRemovalProductStatus("unverändert");
      setSaveRemovalToHistory(false);
      setExperienceReason("keine");
      setExperienceNote("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Bestand konnte nicht entfernt werden.");
    } finally {
      setRemovingInventoryItem(false);
    }
  }

  const filteredInventoryItems = getFilteredInventoryItems();
  const inventoryStorageFilterOptions = getInventoryStorageFilterOptions();
  const hasActiveInventoryFilters =
    Boolean(inventorySearchTerm.trim()) ||
    inventoryStatusFilter !== "all" ||
    inventoryStorageFilter !== "all";
  const filteredHistoryItems = getFilteredHistoryItems();
  const hasActiveHistoryFilters =
    Boolean(historySearchTerm.trim()) ||
    historyReasonFilter !== "all" ||
    historyBuyAgainFilter !== "all" ||
    historyProductFilter !== "all";

  const selectedHistoryProduct =
    historyProductFilter === "all"
      ? null
      : products.find((product) => String(product.id) === historyProductFilter);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Food Inventory</p>
          <h1>Lebensmittel-Inventar</h1>
          <p className="subtitle">
            Verwaltung für Gefrierschrank, Kühlschrank, Vorratskammer und
            Auslandseinkäufe.
          </p>
        </div>
      </header>

      {errorMessage && <p className="error">{errorMessage}</p>}

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Produkte</h2>
            <p>Produkt-Stammdaten mit Bewertung für spätere Einkäufe.</p>
          </div>
        </div>

        <form className="product-form" onSubmit={handleSaveProduct}>
          <div className="form-title-row">
            <h3>
              {editingProductId
                ? "Produkt bearbeiten"
                : "Neues Produkt anlegen"}
            </h3>

            {editingProductId && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetProductForm}
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
                  updateProductForm("name", event.target.value)
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
                  updateProductForm("brand", event.target.value)
                }
                placeholder="z. B. Coop Italia"
              />
            </label>

            <label>
              Kategorie
              <input
                type="text"
                value={productForm.category}
                onChange={(event) =>
                  updateProductForm("category", event.target.value)
                }
                placeholder="z. B. Tiefkühlware"
              />
            </label>

            <label>
              Land
              <input
                type="text"
                value={productForm.country}
                onChange={(event) =>
                  updateProductForm("country", event.target.value)
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
                  updateProductForm("store", event.target.value)
                }
                placeholder="z. B. Coop"
              />
            </label>

            <label>
              Bewertung
              <select
                value={productForm.buyAgainStatus}
                onChange={(event) =>
                  updateProductForm("buyAgainStatus", event.target.value)
                }
              >
                <option value="neutral">Neutral</option>
                <option value="wieder_kaufen">Wieder kaufen</option>
                <option value="nicht_wieder_kaufen">Nicht wieder kaufen</option>
                <option value="testen">Erst testen</option>
              </select>
            </label>

            <label>
              Sterne
              <select
                value={productForm.rating}
                onChange={(event) =>
                  updateProductForm("rating", event.target.value)
                }
              >
                <option value="">Keine Bewertung</option>
                <option value="1">1/5</option>
                <option value="2">2/5</option>
                <option value="3">3/5</option>
                <option value="4">4/5</option>
                <option value="5">5/5</option>
              </select>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={productForm.favorite}
                onChange={(event) =>
                  updateProductForm("favorite", event.target.checked)
                }
              />
              Favorit
            </label>
          </div>

          <label>
            Notiz
            <textarea
              value={productForm.notes}
              onChange={(event) =>
                updateProductForm("notes", event.target.value)
              }
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

        {loadingProducts && <p className="muted">Produkte werden geladen...</p>}

        {!loadingProducts && products.length === 0 && (
          <p className="muted">Noch keine Produkte vorhanden.</p>
        )}

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-card-header">
                <div>
                  <h3>{product.name}</h3>
                  <p className="muted">
                    {[product.brand, product.category]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {product.favorite === 1 && <span className="favorite">★</span>}
              </div>

              <div className="product-meta">
                {product.country && <span>{product.country}</span>}
                {product.store && <span>{product.store}</span>}
                {product.rating && <span>{product.rating}/5</span>}
              </div>

              <div
                className={`buy-again buy-again-${product.buy_again_status}`}
              >
                {getBuyAgainLabel(product.buy_again_status)}
              </div>

              {getProductHistorySummary(product.id).count > 0 && (
                <div className="product-history-hint">
                  <strong>
                    Historie: {getProductHistorySummary(product.id).count}{" "}
                    {getProductHistorySummary(product.id).count === 1
                      ? "Eintrag"
                      : "Einträge"}
                  </strong>

                  {getProductHistorySummary(product.id).latestItem && (
                    <span>
                      Letzte Erfahrung:{" "}
                      {getRemovalReasonLabel(
                        getProductHistorySummary(product.id).latestItem
                          .removal_reason,
                      )}
                      {getProductHistorySummary(product.id).latestItem
                        .product_buy_again_status_after_removal
                        ? ` · ${getBuyAgainLabel(
                            getProductHistorySummary(product.id).latestItem
                              .product_buy_again_status_after_removal,
                          )}`
                        : ""}
                      {getProductHistorySummary(product.id).latestItem
                        .experience_reason
                        ? ` · ${getExperienceReasonLabel(
                            getProductHistorySummary(product.id).latestItem
                              .experience_reason,
                          )}`
                        : ""}
                    </span>
                  )}
                </div>
              )}

              {product.notes && (
                <p className="product-notes">{product.notes}</p>
              )}
              <div className="product-actions">
                <button type="button" onClick={() => startEditProduct(product)}>
                  Bearbeiten
                </button>

                {getProductHistorySummary(product.id).count > 0 && (
                  <button
                    type="button"
                    onClick={() => showProductHistory(product)}
                  >
                    Historie anzeigen
                  </button>
                )}

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => deactivateProduct(product.id)}
                >
                  Deaktivieren
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Bestand</h2>
            <p>Konkrete Packungen mit Lagerort, MHD und Restmenge.</p>
          </div>
        </div>

        <form className="inventory-form" onSubmit={handleCreateInventoryItem}>
          <h3>Bestand erfassen</h3>

          <div className="form-grid">
            <label>
              Produkt *
              <select
                value={inventoryForm.productId}
                onChange={(event) =>
                  handleInventoryProductChange(event.target.value)
                }
              >
                <option value="">Produkt auswählen</option>
                {products.map((product) => (
                  <option value={product.id} key={product.id}>
                    {product.name}
                    {product.brand ? ` · ${product.brand}` : ""}
                  </option>
                ))}
              </select>
            </label>

            {inventoryForm.productId &&
              getProductHistorySummary(inventoryForm.productId).count > 0 && (
                <div className="inventory-history-hint">
                  <strong>
                    {getProductHistorySummary(inventoryForm.productId).count}{" "}
                    gespeicherte{" "}
                    {getProductHistorySummary(inventoryForm.productId).count ===
                    1
                      ? "Erfahrung"
                      : "Erfahrungen"}
                  </strong>

                  {getProductHistorySummary(inventoryForm.productId)
                    .latestItem && (
                    <span>
                      Letzte Erfahrung:{" "}
                      {getRemovalReasonLabel(
                        getProductHistorySummary(inventoryForm.productId)
                          .latestItem.removal_reason,
                      )}
                      {getProductHistorySummary(inventoryForm.productId)
                        .latestItem.product_buy_again_status_after_removal
                        ? ` · ${getBuyAgainLabel(
                            getProductHistorySummary(inventoryForm.productId)
                              .latestItem
                              .product_buy_again_status_after_removal,
                          )}`
                        : ""}
                      {getProductHistorySummary(inventoryForm.productId)
                        .latestItem.experience_reason
                        ? ` · ${getExperienceReasonLabel(
                            getProductHistorySummary(inventoryForm.productId)
                              .latestItem.experience_reason,
                          )}`
                        : ""}
                    </span>
                  )}
                </div>
              )}

            <label>
              Lagergerät *
              <select
                value={inventoryForm.storageUnitId}
                onChange={(event) => {
                  updateInventoryForm("storageUnitId", event.target.value);
                  updateInventoryForm("storageCompartmentId", "");
                }}
              >
                <option value="">Lagergerät auswählen</option>
                {getAllStorageUnits().map((unit) => (
                  <option value={unit.id} key={unit.id}>
                    {unit.locationName} · {unit.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Fach / Schublade
              <select
                value={inventoryForm.storageCompartmentId}
                onChange={(event) =>
                  updateInventoryForm(
                    "storageCompartmentId",
                    event.target.value,
                  )
                }
              >
                <option value="">Kein Fach ausgewählt</option>
                {getCompartmentsForSelectedUnit().map((compartment) => (
                  <option value={compartment.id} key={compartment.id}>
                    {compartment.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              MHD
              <input
                type="date"
                value={inventoryForm.bestBeforeDate}
                onChange={(event) =>
                  updateInventoryForm("bestBeforeDate", event.target.value)
                }
              />
            </label>

            <label>
              Originalmenge
              <input
                type="number"
                min="0"
                step="0.01"
                value={inventoryForm.originalQuantity}
                onChange={(event) =>
                  updateInventoryForm("originalQuantity", event.target.value)
                }
                placeholder="z. B. 1000"
              />
            </label>

            <label>
              Original-Einheit
              <select
                value={inventoryForm.originalUnit}
                onChange={(event) =>
                  updateInventoryForm("originalUnit", event.target.value)
                }
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="Stück">Stück</option>
                <option value="Packung">Packung</option>
                <option value="Portion">Portion</option>
              </select>
            </label>

            <label>
              Restmenge
              <input
                type="number"
                min="0"
                step="0.01"
                value={inventoryForm.remainingQuantity}
                onChange={(event) =>
                  updateInventoryForm("remainingQuantity", event.target.value)
                }
                placeholder="z. B. 350"
              />
            </label>

            <label>
              Rest-Einheit
              <select
                value={inventoryForm.remainingUnit}
                onChange={(event) =>
                  updateInventoryForm("remainingUnit", event.target.value)
                }
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
                <option value="Stück">Stück</option>
                <option value="Packung">Packung</option>
                <option value="Portion">Portion</option>
              </select>
            </label>

            <label>
              Restanteil
              <select
                value={inventoryForm.remainingFraction}
                onChange={(event) =>
                  updateInventoryForm("remainingFraction", event.target.value)
                }
              >
                <option value="">Kein Anteil</option>
                <option value="1/1">voll</option>
                <option value="3/4">3/4</option>
                <option value="1/2">1/2</option>
                <option value="1/4">1/4</option>
              </select>
            </label>

            <label>
              Packungszustand
              <select
                value={inventoryForm.packageState}
                onChange={(event) =>
                  updateInventoryForm("packageState", event.target.value)
                }
              >
                <option value="ungeoeffnet">Ungeöffnet</option>
                <option value="angebrochen">Angebrochen</option>
                <option value="portioniert">Portioniert</option>
              </select>
            </label>

            <label>
              Eingefroren am
              <input
                type="date"
                value={inventoryForm.frozenDate}
                onChange={(event) =>
                  updateInventoryForm("frozenDate", event.target.value)
                }
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={inventoryForm.isFrozenChilledFood}
                onChange={(event) =>
                  updateInventoryForm(
                    "isFrozenChilledFood",
                    event.target.checked,
                  )
                }
              />
              Kühlware eingefroren
            </label>

            <label>
              Interne Frist
              <select
                value={inventoryForm.internalExtensionMonths}
                onChange={(event) =>
                  updateInventoryForm(
                    "internalExtensionMonths",
                    event.target.value,
                  )
                }
                disabled={!inventoryForm.isFrozenChilledFood}
              >
                <option value="3">+ 3 Monate</option>
                <option value="6">+ 6 Monate</option>
                <option value="12">+ 12 Monate</option>
              </select>
            </label>

            <label>
              Geöffnet am
              <input
                type="date"
                value={inventoryForm.openedDate}
                onChange={(event) =>
                  updateInventoryForm("openedDate", event.target.value)
                }
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={inventoryForm.quantityEstimated}
                onChange={(event) =>
                  updateInventoryForm("quantityEstimated", event.target.checked)
                }
              />
              Restmenge geschätzt
            </label>
          </div>

          <label>
            Notiz
            <textarea
              value={inventoryForm.notes}
              onChange={(event) =>
                updateInventoryForm("notes", event.target.value)
              }
              placeholder="z. B. angebrochene Tüte, zuerst verbrauchen"
              rows="3"
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={savingInventoryItem}>
              {savingInventoryItem ? "Speichern..." : "Bestand erfassen"}
            </button>
          </div>
        </form>

        <div className="inventory-overview-header">
          <div>
            <h3>Bestandsübersicht</h3>
            <p className="muted">
              Suche und Filter für vorhandene Packungen, Dosen und Gebinde.
            </p>
          </div>

          <span className="result-count">
            {filteredInventoryItems.length} von {inventoryItems.length}{" "}
            Einträgen
          </span>
        </div>

        <div className="inventory-toolbar">
          <label className="inventory-search">
            Bestand suchen
            <input
              type="search"
              value={inventorySearchTerm}
              onChange={(event) => setInventorySearchTerm(event.target.value)}
              placeholder="z. B. Pommes, Coop, Wohnzimmer, Schublade 2"
            />
          </label>

          <div className="inventory-filter-row">
            <label>
              Status
              <select
                value={inventoryStatusFilter}
                onChange={(event) =>
                  setInventoryStatusFilter(event.target.value)
                }
              >
                <option value="all">Alle</option>
                <option value="ok">OK</option>
                <option value="soon">Bald fällig</option>
                <option value="expired">Abgelaufen</option>
                <option value="no_date">Ohne Datum</option>
              </select>
            </label>

            <label>
              Lagergerät
              <select
                value={inventoryStorageFilter}
                onChange={(event) =>
                  setInventoryStorageFilter(event.target.value)
                }
              >
                <option value="all">Alle Lagergeräte</option>
                {inventoryStorageFilterOptions.map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setInventorySearchTerm("");
                setInventoryStatusFilter("all");
                setInventoryStorageFilter("all");
              }}
              disabled={!hasActiveInventoryFilters}
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>

        {loadingInventory && <p className="muted">Bestand wird geladen...</p>}

        {!loadingInventory && inventoryItems.length === 0 && (
          <p className="muted">Noch kein Bestand vorhanden.</p>
        )}

        {!loadingInventory &&
          inventoryItems.length > 0 &&
          filteredInventoryItems.length === 0 && (
            <p className="muted">Keine passenden Bestandseinträge gefunden.</p>
          )}

        <div className="inventory-list">
          {filteredInventoryItems.map((item) => (
            <article className="inventory-card" key={item.id}>
              <div className="inventory-card-header">
                <div>
                  <h3>{item.product_name}</h3>
                  <p className="muted">
                    {[item.product_brand, item.product_category]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <div className="inventory-status-group">
                  {item.label_code && (
                    <span className="label-code">{item.label_code}</span>
                  )}

                  {item.product_favorite === 1 && (
                    <span className="favorite-badge">★ Standardartikel</span>
                  )}

                  <span
                    className={`package-state package-state-${item.package_state}`}
                  >
                    {getPackageStateLabel(item.package_state)}
                  </span>

                  <span
                    className={`date-status date-status-${getInventoryDateStatus(item)}`}
                  >
                    {getInventoryDateStatusLabel(getInventoryDateStatus(item))}
                  </span>
                </div>
              </div>

              <div className="inventory-meta">
                <span>{item.storage_unit_name}</span>
                {item.storage_compartment_name && (
                  <span>{item.storage_compartment_name}</span>
                )}
                <span>{formatQuantity(item)}</span>
                {item.best_before_date && (
                  <span>MHD: {formatDateGerman(item.best_before_date)}</span>
                )}
                {item.internal_use_until_date && (
                  <span>
                    Intern bis: {formatDateGerman(item.internal_use_until_date)}
                  </span>
                )}
              </div>

              {item.notes && <p className="product-notes">{item.notes}</p>}

              <div className="product-actions">
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => openRemovalDialog(item)}
                >
                  Entfernen
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card" id="product-history-section">
        <div className="section-header">
          <div>
            <h2>Produkthistorie</h2>
            <p>
              Gespeicherte Produkterfahrungen für spätere
              Einkaufsentscheidungen.
            </p>
          </div>
        </div>

        <div className="history-overview-header">
          <div>
            <h3>Historieneinträge</h3>
            <p className="muted">
              Nur ausgewählte Entnahmen werden hier als Produkterfahrung
              gespeichert.
            </p>

            {historyProductFilter !== "all" && (
              <p className="muted">
                Gefiltert nach Produkt:{" "}
                {selectedHistoryProduct
                  ? selectedHistoryProduct.name
                  : `Produkt-ID ${historyProductFilter}`}
                .
              </p>
            )}
          </div>

          <span className="result-count">
            {filteredHistoryItems.length} von {historyItems.length} Einträgen
          </span>
        </div>

        <div className="history-toolbar">
          <label className="history-search">
            Historie suchen
            <input
              type="search"
              value={historySearchTerm}
              onChange={(event) => setHistorySearchTerm(event.target.value)}
              placeholder="z. B. Ravioli, Coop, Italien, F001, vergessen"
            />
          </label>

          <div className="history-filter-row">
            <label>
              Grund
              <select
                value={historyReasonFilter}
                onChange={(event) => setHistoryReasonFilter(event.target.value)}
              >
                <option value="all">Alle Gründe</option>
                <option value="verbraucht">Verbraucht</option>
                <option value="abgelaufen">Abgelaufen</option>
                <option value="entsorgt">Entsorgt</option>
                <option value="verschenkt">Verschenkt</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </label>

            <label>
              Bewertung danach
              <select
                value={historyBuyAgainFilter}
                onChange={(event) =>
                  setHistoryBuyAgainFilter(event.target.value)
                }
              >
                <option value="all">Alle Bewertungen</option>
                <option value="neutral">Neutral</option>
                <option value="wieder_kaufen">Wieder kaufen</option>
                <option value="nicht_wieder_kaufen">Nicht wieder kaufen</option>
                <option value="testen">Erst testen</option>
              </select>
            </label>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setHistorySearchTerm("");
                setHistoryReasonFilter("all");
                setHistoryBuyAgainFilter("all");
                setHistoryProductFilter("all");
              }}
              disabled={!hasActiveHistoryFilters}
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>

        {loadingHistory && (
          <p className="muted">Produkthistorie wird geladen...</p>
        )}

        {!loadingHistory && historyItems.length === 0 && (
          <p className="muted">Noch keine Produkthistorie vorhanden.</p>
        )}

        {!loadingHistory &&
          historyItems.length > 0 &&
          filteredHistoryItems.length === 0 && (
            <p className="muted">Keine passenden Historieneinträge gefunden.</p>
          )}

        <div className="history-list">
          {filteredHistoryItems.map((item) => (
            <article className="history-card" key={item.id}>
              <div className="history-card-header">
                <div>
                  <h3>{item.product_name}</h3>
                  <p className="muted">
                    {[item.product_brand, item.product_category]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <div className="inventory-status-group">
                  {item.label_code && (
                    <span className="label-code">{item.label_code}</span>
                  )}

                  {item.product_favorite === 1 && (
                    <span className="favorite-badge">★ Standardartikel</span>
                  )}

                  <span className="history-reason">
                    {getRemovalReasonLabel(item.removal_reason)}
                  </span>

                  {item.product_buy_again_status_after_removal && (
                    <span
                      className={`buy-again buy-again-${item.product_buy_again_status_after_removal}`}
                    >
                      {getBuyAgainLabel(
                        item.product_buy_again_status_after_removal,
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="history-meta">
                {item.product_country && <span>{item.product_country}</span>}

                {item.product_store && (
                  <span>
                    {item.product_store.toLowerCase() === "egal"
                      ? "Bezugsquelle beliebig"
                      : item.product_store}
                  </span>
                )}

                {item.removed_at && (
                  <span>
                    Entfernt: {formatDateGerman(item.removed_at.slice(0, 10))}
                  </span>
                )}

                {item.experience_reason &&
                  item.experience_reason !== "keine" && (
                    <span>
                      {getExperienceReasonLabel(item.experience_reason)}
                    </span>
                  )}
              </div>

              {item.experience_note && (
                <p className="product-notes">{item.experience_note}</p>
              )}

              {item.notes && (
                <p className="history-technical-note">{item.notes}</p>
              )}
              <div className="product-actions">
                <button type="button" onClick={() => openHistoryDialog(item)}>
                  Bearbeiten
                </button>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() => openHistoryDeleteDialog(item)}
                >
                  Löschen
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Lagerstruktur</h2>
            <p>Standorte, Geräte und Fächer aus der SQLite-Datenbank.</p>
          </div>
        </div>

        {loadingStorage && (
          <p className="muted">Lagerstruktur wird geladen...</p>
        )}

        {!loadingStorage && storageTree.length === 0 && (
          <p className="muted">Noch keine Lagerorte vorhanden.</p>
        )}

        <div className="storage-tree">
          {storageTree.map((location) => (
            <article className="location-card" key={location.id}>
              <h3>{location.name}</h3>
              {location.description && (
                <p className="muted">{location.description}</p>
              )}

              <div className="unit-list">
                {location.units.map((unit) => (
                  <div className="unit-card" key={unit.id}>
                    <div className="unit-header">
                      <div>
                        <h4>{unit.name}</h4>
                        <p className="muted">{unit.type}</p>
                      </div>
                      <span className="badge">{unit.status}</span>
                    </div>

                    <div className="compartment-list">
                      {unit.compartments.map((compartment) => (
                        <span className="compartment-pill" key={compartment.id}>
                          {compartment.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      {removalDialogItem && (
        <div className="dialog-backdrop" role="presentation">
          <div
            className="dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="removal-dialog-title"
          >
            <h3 id="removal-dialog-title">Bestand entfernen</h3>

            <p className="muted">
              {removalDialogItem.product_name}
              {removalDialogItem.label_code
                ? ` · Etikett ${removalDialogItem.label_code}`
                : ""}
            </p>
            {removalDialogItem.product_favorite === 1 && (
              <p className="muted">★ Standardartikel</p>
            )}

            <p className="dialog-warning">
              Der Bestandseintrag wird entfernt. Eine vorhandene Etiketten-ID
              wird wieder freigegeben und kann später erneut verwendet werden.
            </p>

            <div className="dialog-form">
              <label>
                Grund
                <select
                  value={removalReason}
                  onChange={(event) => {
                    const nextReason = event.target.value;
                    setRemovalReason(nextReason);

                    if (nextReason === "falsch_erfasst") {
                      setRemovalProductStatus("unverändert");
                      setSaveRemovalToHistory(false);
                      setExperienceReason("keine");
                      setExperienceNote("");
                      return;
                    }

                    setSaveRemovalToHistory(
                      shouldSuggestHistory(nextReason, removalProductStatus),
                    );
                  }}
                  disabled={removingInventoryItem}
                >
                  <option value="verbraucht">Verbraucht</option>
                  <option value="abgelaufen">Abgelaufen</option>
                  <option value="entsorgt">Entsorgt</option>
                  <option value="falsch_erfasst">Falsch erfasst</option>
                  <option value="verschenkt">Verschenkt</option>
                  <option value="sonstiges">Sonstiges</option>
                </select>
              </label>

              <label>
                Produktbewertung
                <select
                  value={removalProductStatus}
                  onChange={(event) => {
                    const nextStatus = event.target.value;
                    setRemovalProductStatus(nextStatus);

                    if (removalReason === "falsch_erfasst") {
                      setSaveRemovalToHistory(false);
                      return;
                    }

                    setSaveRemovalToHistory(
                      shouldSuggestHistory(removalReason, nextStatus),
                    );
                  }}
                  disabled={
                    removingInventoryItem || removalReason === "falsch_erfasst"
                  }
                >
                  <option value="unverändert">Unverändert</option>
                  <option value="wieder_kaufen">Wieder kaufen</option>
                  <option value="nicht_wieder_kaufen">
                    Nicht wieder kaufen
                  </option>
                  <option value="testen">Erst testen</option>
                </select>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={saveRemovalToHistory}
                  onChange={(event) =>
                    setSaveRemovalToHistory(event.target.checked)
                  }
                  disabled={
                    removingInventoryItem || removalReason === "falsch_erfasst"
                  }
                />
                In Produkthistorie speichern
              </label>

              {saveRemovalToHistory && (
                <>
                  <label>
                    Erkenntnis
                    <select
                      value={experienceReason}
                      onChange={(event) =>
                        setExperienceReason(event.target.value)
                      }
                      disabled={removingInventoryItem}
                    >
                      <option value="keine">Keine besondere Erkenntnis</option>
                      <option value="zu_viel_gekauft">Zu viel gekauft</option>
                      <option value="kein_bedarf">Kein Bedarf</option>
                      <option value="vergessen_uebersehen">
                        Vergessen / übersehen
                      </option>
                      <option value="lagerort_unguenstig">
                        Lagerort ungünstig
                      </option>
                      <option value="qualitaet_schlecht">
                        Qualität schlecht
                      </option>
                      <option value="rezeptur_geschmack_veraendert">
                        Rezeptur / Geschmack verändert
                      </option>
                      <option value="preis_leistung_schlecht">
                        Preis-Leistung schlecht
                      </option>
                      <option value="sonstiges">Sonstiges</option>
                    </select>
                  </label>

                  <label>
                    Notiz zur Produkterfahrung
                    <textarea
                      value={experienceNote}
                      onChange={(event) =>
                        setExperienceNote(event.target.value)
                      }
                      disabled={removingInventoryItem}
                      placeholder="z. B. lag lange herum, wurde vergessen, schmeckt anders als früher"
                      rows="3"
                    />
                  </label>
                </>
              )}
            </div>

            <div className="dialog-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeRemovalDialog}
                disabled={removingInventoryItem}
              >
                Abbrechen
              </button>

              <button
                type="button"
                className="danger-confirm-button"
                onClick={confirmRemoveInventoryItem}
                disabled={removingInventoryItem}
              >
                {removingInventoryItem ? "Entfernen..." : "Bestand entfernen"}
              </button>
            </div>
          </div>
        </div>
      )}
      {historyDeleteDialogItem && (
        <div className="dialog-backdrop" role="presentation">
          <div
            className="dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-delete-dialog-title"
          >
            <h3 id="history-delete-dialog-title">Historieneintrag löschen</h3>

            <p className="muted">
              {historyDeleteDialogItem.product_name}
              {historyDeleteDialogItem.label_code
                ? ` · Etikett ${historyDeleteDialogItem.label_code}`
                : ""}
            </p>

            <p className="dialog-warning">
              Dieser Historieneintrag wird dauerhaft aus der Produkthistorie
              entfernt. Produkt, Bestand und Etikettenfreigabe bleiben
              unverändert.
            </p>

            <div className="dialog-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeHistoryDeleteDialog}
                disabled={deletingHistoryItem}
              >
                Abbrechen
              </button>

              <button
                type="button"
                className="danger-confirm-button"
                onClick={confirmDeleteHistoryItem}
                disabled={deletingHistoryItem}
              >
                {deletingHistoryItem ? "Löschen..." : "Historie löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
      {historyDialogItem && (
        <div className="dialog-backdrop" role="presentation">
          <div
            className="dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-dialog-title"
          >
            <h3 id="history-dialog-title">Historieneintrag bearbeiten</h3>

            <p className="muted">
              {historyDialogItem.product_name}
              {historyDialogItem.label_code
                ? ` · Etikett ${historyDialogItem.label_code}`
                : ""}
            </p>

            <p className="dialog-warning">
              Hier wird nur die Produkthistorie nachbearbeitet. Bestand,
              Produkt-ID und Etikettenfreigabe bleiben unverändert.
            </p>

            <div className="dialog-form">
              <label>
                Grund
                <select
                  value={historyEditReason}
                  onChange={(event) => setHistoryEditReason(event.target.value)}
                  disabled={savingHistoryItem}
                >
                  <option value="verbraucht">Verbraucht</option>
                  <option value="abgelaufen">Abgelaufen</option>
                  <option value="entsorgt">Entsorgt</option>
                  <option value="verschenkt">Verschenkt</option>
                  <option value="sonstiges">Sonstiges</option>
                </select>
              </label>

              <label>
                Bewertung danach
                <select
                  value={historyEditBuyAgainStatus}
                  onChange={(event) =>
                    setHistoryEditBuyAgainStatus(event.target.value)
                  }
                  disabled={savingHistoryItem}
                >
                  <option value="neutral">Neutral</option>
                  <option value="wieder_kaufen">Wieder kaufen</option>
                  <option value="nicht_wieder_kaufen">
                    Nicht wieder kaufen
                  </option>
                  <option value="testen">Erst testen</option>
                </select>
              </label>

              <label>
                Erkenntnis
                <select
                  value={historyEditExperienceReason}
                  onChange={(event) =>
                    setHistoryEditExperienceReason(event.target.value)
                  }
                  disabled={savingHistoryItem}
                >
                  <option value="keine">Keine besondere Erkenntnis</option>
                  <option value="zu_viel_gekauft">Zu viel gekauft</option>
                  <option value="kein_bedarf">Kein Bedarf</option>
                  <option value="vergessen_uebersehen">
                    Vergessen / übersehen
                  </option>
                  <option value="lagerort_unguenstig">
                    Lagerort ungünstig
                  </option>
                  <option value="qualitaet_schlecht">Qualität schlecht</option>
                  <option value="rezeptur_geschmack_veraendert">
                    Rezeptur / Geschmack verändert
                  </option>
                  <option value="preis_leistung_schlecht">
                    Preis-Leistung schlecht
                  </option>
                  <option value="sonstiges">Sonstiges</option>
                </select>
              </label>

              <label>
                Notiz zur Produkterfahrung
                <textarea
                  value={historyEditExperienceNote}
                  onChange={(event) =>
                    setHistoryEditExperienceNote(event.target.value)
                  }
                  disabled={savingHistoryItem}
                  placeholder="z. B. lag lange herum, wurde vergessen, schmeckt anders als früher"
                  rows="3"
                />
              </label>

              <label>
                Interne Notiz
                <textarea
                  value={historyEditNotes}
                  onChange={(event) => setHistoryEditNotes(event.target.value)}
                  disabled={savingHistoryItem}
                  placeholder="z. B. ursprüngliche technische Notiz oder Ergänzung"
                  rows="3"
                />
              </label>
            </div>

            <div className="dialog-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeHistoryDialog}
                disabled={savingHistoryItem}
              >
                Abbrechen
              </button>

              <button
                type="button"
                className="primary-confirm-button"
                onClick={confirmSaveHistoryItem}
                disabled={savingHistoryItem}
              >
                {savingHistoryItem ? "Speichern..." : "Historie speichern"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
