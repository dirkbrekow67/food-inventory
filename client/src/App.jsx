// client/src/App.jsx
import { useEffect, useState } from "react";
import "./App.css";

import {
  formatDateGerman,
  getBuyAgainLabel,
  getExperienceReasonLabel,
  getRemovalReasonLabel,
} from "./utils/formattersUtils";

import { emptyInventoryForm, emptyProductForm } from "./constants/formDefaults";

import {
  buyAgainStatusOptions,
  experienceReasonOptions,
  historyBuyAgainFilterOptions,
  historyEditRemovalReasonOptions,
  historyRemovalReasonFilterOptions,
  removalProductStatusOptions,
  removalReasonOptions,
} from "./constants/selectOptions";

import {
  createInventoryItem,
  deactivateProductById,
  deleteHistoryItemById,
  loadHistoryItems,
  loadInventoryItems,
  loadProducts,
  loadStorageTree,
  removeInventoryItemById,
  saveProduct,
  updateHistoryItemById,
} from "./api/inventoryApi";

import {
  getLatestInventoryItemForProduct,
  updateInventoryListAfterCreate,
  updateInventoryListAfterRemove,
} from "./utils/inventoryDataUtils";

import { renderSelectOptions } from "./components/form/FormSelectOptions";

import {
  createProductFormFromProduct,
  createProductPayload,
  updateProductListAfterDeactivate,
  updateProductListAfterInventoryRemoval,
  updateProductListAfterSave,
} from "./utils/productDataUtils";

import { createInventoryPayload } from "./utils/inventoryFormUtils";

import {
  createHistoryEditStateFromItem,
  createHistoryUpdatePayload,
  createInitialHistoryEditState,
  shouldSuggestHistory,
  updateHistoryListAfterDelete,
  updateHistoryListAfterSave,
} from "./utils/historyDataUtils";

import {
  createInitialRemovalState,
  createRemovalPayload,
} from "./utils/removalDataUtils";

import {
  createInitialHistoryFilterState,
  createInitialInventoryFilterState,
} from "./utils/filterStateUtils";

import {
  getHistoryViewState,
  getInventoryViewState,
} from "./utils/viewStateUtils";

import { ProductsSection } from "./components/products/ProductsSection";

import { InventorySection } from "./components/inventory/InventorySection";

const initialHistoryEditState = createInitialHistoryEditState();
const initialRemovalState = createInitialRemovalState();

const initialInventoryFilterState = createInitialInventoryFilterState();
const initialHistoryFilterState = createInitialHistoryFilterState();

function App() {
  const [storageTree, setStorageTree] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historySearchTerm, setHistorySearchTerm] = useState(
    initialHistoryFilterState.historySearchTerm,
  );
  const [historyReasonFilter, setHistoryReasonFilter] = useState(
    initialHistoryFilterState.historyReasonFilter,
  );
  const [historyBuyAgainFilter, setHistoryBuyAgainFilter] = useState(
    initialHistoryFilterState.historyBuyAgainFilter,
  );
  const [historyProductFilter, setHistoryProductFilter] = useState(
    initialHistoryFilterState.historyProductFilter,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [historyDialogItem, setHistoryDialogItem] = useState(null);
  const [historyEditReason, setHistoryEditReason] = useState(
    initialHistoryEditState.historyEditReason,
  );
  const [historyDeleteDialogItem, setHistoryDeleteDialogItem] = useState(null);
  const [deletingHistoryItem, setDeletingHistoryItem] = useState(false);
  const [historyEditBuyAgainStatus, setHistoryEditBuyAgainStatus] = useState(
    initialHistoryEditState.historyEditBuyAgainStatus,
  );
  const [historyEditExperienceReason, setHistoryEditExperienceReason] =
    useState(initialHistoryEditState.historyEditExperienceReason);
  const [historyEditExperienceNote, setHistoryEditExperienceNote] = useState(
    initialHistoryEditState.historyEditExperienceNote,
  );
  const [historyEditNotes, setHistoryEditNotes] = useState(
    initialHistoryEditState.historyEditNotes,
  );
  const [savingHistoryItem, setSavingHistoryItem] = useState(false);

  const [productForm, setProductForm] = useState(() => emptyProductForm);
  const [inventoryForm, setInventoryForm] = useState(() => emptyInventoryForm);

  const [savingInventoryItem, setSavingInventoryItem] = useState(false);
  const [inventorySearchTerm, setInventorySearchTerm] = useState(
    initialInventoryFilterState.inventorySearchTerm,
  );
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState(
    initialInventoryFilterState.inventoryStatusFilter,
  );
  const [inventoryStorageFilter, setInventoryStorageFilter] = useState(
    initialInventoryFilterState.inventoryStorageFilter,
  );
  const [removalDialogItem, setRemovalDialogItem] = useState(null);
  const [removalReason, setRemovalReason] = useState(
    initialRemovalState.removalReason,
  );
  const [removalProductStatus, setRemovalProductStatus] = useState(
    initialRemovalState.removalProductStatus,
  );
  const [removingInventoryItem, setRemovingInventoryItem] = useState(false);
  const [saveRemovalToHistory, setSaveRemovalToHistory] = useState(
    initialRemovalState.saveRemovalToHistory,
  );
  const [experienceReason, setExperienceReason] = useState(
    initialRemovalState.experienceReason,
  );
  const [experienceNote, setExperienceNote] = useState(
    initialRemovalState.experienceNote,
  );

  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setErrorMessage("");

        const [storageData, productData, inventoryData, historyData] =
          await Promise.all([
            loadStorageTree(),
            loadProducts(),
            loadInventoryItems(),
            loadHistoryItems(),
          ]);

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

  function resetInventoryFilters() {
    setInventorySearchTerm(initialInventoryFilterState.inventorySearchTerm);
    setInventoryStatusFilter(initialInventoryFilterState.inventoryStatusFilter);
    setInventoryStorageFilter(
      initialInventoryFilterState.inventoryStorageFilter,
    );
  }

  function resetHistoryFilters() {
    setHistorySearchTerm(initialHistoryFilterState.historySearchTerm);
    setHistoryReasonFilter(initialHistoryFilterState.historyReasonFilter);
    setHistoryBuyAgainFilter(initialHistoryFilterState.historyBuyAgainFilter);
    setHistoryProductFilter(initialHistoryFilterState.historyProductFilter);
  }

  function handleInventoryProductChange(productId) {
    const latestItem = getLatestInventoryItemForProduct(
      inventoryItems,
      productId,
    );

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

  function showProductHistory(product) {
    resetHistoryFilters();
    setHistoryProductFilter(String(product.id));

    document
      .getElementById("product-history-section")
      ?.scrollIntoView({ behavior: "smooth" });
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

      const payload = createProductPayload(productForm);

      const savedProduct = await saveProduct(editingProductId, payload);

      setProducts((currentProducts) =>
        updateProductListAfterSave(currentProducts, savedProduct),
      );

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

    setProductForm(createProductFormFromProduct(product));

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

      await deactivateProductById(productId);

      setProducts((currentProducts) =>
        updateProductListAfterDeactivate(currentProducts, productId),
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

      const payload = createInventoryPayload(inventoryForm);

      const createdItem = await createInventoryItem(payload);

      setInventoryItems((currentItems) =>
        updateInventoryListAfterCreate(currentItems, createdItem),
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

  function resetHistoryDeleteDialogState() {
    setHistoryDeleteDialogItem(null);
  }

  function closeHistoryDeleteDialog() {
    if (deletingHistoryItem) {
      return;
    }

    resetHistoryDeleteDialogState();
  }

  async function confirmDeleteHistoryItem() {
    if (!historyDeleteDialogItem) {
      return;
    }

    try {
      setDeletingHistoryItem(true);
      setErrorMessage("");

      await deleteHistoryItemById(historyDeleteDialogItem.id);

      setHistoryItems((currentItems) =>
        updateHistoryListAfterDelete(currentItems, historyDeleteDialogItem.id),
      );

      resetHistoryDeleteDialogState();
    } catch (error) {
      console.error(error);
      setErrorMessage("Historieneintrag konnte nicht gelöscht werden.");
    } finally {
      setDeletingHistoryItem(false);
    }
  }

  function openHistoryDialog(item) {
    const historyEditState = createHistoryEditStateFromItem(item);

    setHistoryDialogItem(item);
    setHistoryEditReason(historyEditState.historyEditReason);
    setHistoryEditBuyAgainStatus(historyEditState.historyEditBuyAgainStatus);
    setHistoryEditExperienceReason(
      historyEditState.historyEditExperienceReason,
    );
    setHistoryEditExperienceNote(historyEditState.historyEditExperienceNote);
    setHistoryEditNotes(historyEditState.historyEditNotes);
  }

  function resetHistoryEditState() {
    setHistoryDialogItem(null);
    setHistoryEditReason(initialHistoryEditState.historyEditReason);
    setHistoryEditBuyAgainStatus(
      initialHistoryEditState.historyEditBuyAgainStatus,
    );
    setHistoryEditExperienceReason(
      initialHistoryEditState.historyEditExperienceReason,
    );
    setHistoryEditExperienceNote(
      initialHistoryEditState.historyEditExperienceNote,
    );
    setHistoryEditNotes(initialHistoryEditState.historyEditNotes);
  }

  function closeHistoryDialog() {
    if (savingHistoryItem) {
      return;
    }

    resetHistoryEditState();
  }

  async function confirmSaveHistoryItem() {
    if (!historyDialogItem) {
      return;
    }

    try {
      setSavingHistoryItem(true);
      setErrorMessage("");

      const updatedHistoryItem = await updateHistoryItemById(
        historyDialogItem.id,
        createHistoryUpdatePayload({
          historyEditReason,
          historyEditBuyAgainStatus,
          historyEditExperienceReason,
          historyEditExperienceNote,
          historyEditNotes,
        }),
      );

      setHistoryItems((currentItems) =>
        updateHistoryListAfterSave(currentItems, updatedHistoryItem),
      );

      resetHistoryEditState();
    } catch (error) {
      console.error(error);
      setErrorMessage("Historieneintrag konnte nicht gespeichert werden.");
    } finally {
      setSavingHistoryItem(false);
    }
  }

  function openRemovalDialog(item) {
    setRemovalDialogItem(item);
    setRemovalReason(initialRemovalState.removalReason);
    setRemovalProductStatus(initialRemovalState.removalProductStatus);
    setSaveRemovalToHistory(initialRemovalState.saveRemovalToHistory);
    setExperienceReason(initialRemovalState.experienceReason);
    setExperienceNote(initialRemovalState.experienceNote);
  }

  function resetRemovalState() {
    setRemovalDialogItem(null);
    setRemovalReason(initialRemovalState.removalReason);
    setRemovalProductStatus(initialRemovalState.removalProductStatus);
    setSaveRemovalToHistory(initialRemovalState.saveRemovalToHistory);
    setExperienceReason(initialRemovalState.experienceReason);
    setExperienceNote(initialRemovalState.experienceNote);
  }

  function closeRemovalDialog() {
    if (removingInventoryItem) {
      return;
    }

    resetRemovalState();
  }

  async function confirmRemoveInventoryItem() {
    if (!removalDialogItem) {
      return;
    }

    try {
      setRemovingInventoryItem(true);
      setErrorMessage("");

      const result = await removeInventoryItemById(
        removalDialogItem.id,
        createRemovalPayload({
          removalReason,
          removalProductStatus,
          saveRemovalToHistory,
          experienceReason,
          experienceNote,
        }),
      );

      if (result.savedToHistory) {
        const historyData = await loadHistoryItems();
        setHistoryItems(historyData);
      }

      setInventoryItems((currentItems) =>
        updateInventoryListAfterRemove(currentItems, removalDialogItem.id),
      );

      setProducts((currentProducts) =>
        updateProductListAfterInventoryRemoval(currentProducts, result.product),
      );

      resetRemovalState();
    } catch (error) {
      console.error(error);
      setErrorMessage("Bestand konnte nicht entfernt werden.");
    } finally {
      setRemovingInventoryItem(false);
    }
  }

  const {
    filteredInventoryItems,
    inventoryStorageFilterOptions,
    hasActiveInventoryFilters,
  } = getInventoryViewState({
    inventoryItems,
    inventorySearchTerm,
    inventoryStatusFilter,
    inventoryStorageFilter,
  });

  const {
    filteredHistoryItems,
    hasActiveHistoryFilters,
    selectedHistoryProduct,
    selectedInventoryProductHistorySummary,
  } = getHistoryViewState({
    historyItems,
    historySearchTerm,
    historyReasonFilter,
    historyBuyAgainFilter,
    historyProductFilter,
    products,
    inventoryForm,
  });

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

      <ProductsSection
        productForm={productForm}
        editingProductId={editingProductId}
        savingProduct={savingProduct}
        loadingProducts={loadingProducts}
        products={products}
        historyItems={historyItems}
        onSaveProduct={handleSaveProduct}
        onUpdateProductForm={updateProductForm}
        onResetProductForm={resetProductForm}
        onEditProduct={startEditProduct}
        onShowProductHistory={showProductHistory}
        onDeactivateProduct={deactivateProduct}
      />

      <InventorySection
        inventoryForm={inventoryForm}
        products={products}
        storageTree={storageTree}
        selectedInventoryProductHistorySummary={
          selectedInventoryProductHistorySummary
        }
        savingInventoryItem={savingInventoryItem}
        inventoryItems={inventoryItems}
        filteredInventoryItems={filteredInventoryItems}
        inventorySearchTerm={inventorySearchTerm}
        inventoryStatusFilter={inventoryStatusFilter}
        inventoryStorageFilter={inventoryStorageFilter}
        inventoryStorageFilterOptions={inventoryStorageFilterOptions}
        hasActiveInventoryFilters={hasActiveInventoryFilters}
        loadingInventory={loadingInventory}
        onCreateInventoryItem={handleCreateInventoryItem}
        onInventoryProductChange={handleInventoryProductChange}
        onUpdateInventoryForm={updateInventoryForm}
        onInventorySearchTermChange={setInventorySearchTerm}
        onInventoryStatusFilterChange={setInventoryStatusFilter}
        onInventoryStorageFilterChange={setInventoryStorageFilter}
        onResetInventoryFilters={resetInventoryFilters}
        onOpenRemovalDialog={openRemovalDialog}
      />

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
                {renderSelectOptions(historyRemovalReasonFilterOptions)}
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
                {renderSelectOptions(historyBuyAgainFilterOptions)}
              </select>
            </label>

            <button
              type="button"
              className="secondary-button"
              onClick={resetHistoryFilters}
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
                  {renderSelectOptions(removalReasonOptions)}
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
                  {renderSelectOptions(removalProductStatusOptions)}
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
                      {renderSelectOptions(experienceReasonOptions)}
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
                  {renderSelectOptions(historyEditRemovalReasonOptions)}
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
                  {renderSelectOptions(buyAgainStatusOptions)}
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
                  {renderSelectOptions(experienceReasonOptions)}
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
