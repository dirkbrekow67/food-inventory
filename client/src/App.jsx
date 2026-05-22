// client/src/App.jsx
import { useEffect, useState } from "react";
import "./App.css";

import { emptyInventoryForm, emptyProductForm } from "./constants/formDefaults";

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

import { HistorySection } from "./components/history/HistorySection";

import { StorageSection } from "./components/storage/StorageSection";

import { RemovalDialog } from "./components/dialogs/RemovalDialog";
import { HistoryDeleteDialog } from "./components/dialogs/HistoryDeleteDialog";
import { HistoryEditDialog } from "./components/dialogs/HistoryEditDialog";

import {
  extractLabelCodeFromScanText,
  findInventoryItemByLabelCode,
} from "./utils/labelScanUtils";

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

  const [labelScanInput, setLabelScanInput] = useState("");
  const [highlightedInventoryItemId, setHighlightedInventoryItemId] =
    useState(null);
  const [labelScanMessage, setLabelScanMessage] = useState("");

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

  function handleLabelScanSubmit(event) {
    event.preventDefault();

    const labelCode = extractLabelCodeFromScanText(labelScanInput);

    if (!labelCode) {
      setHighlightedInventoryItemId(null);
      setLabelScanMessage(
        "Bitte eine Etiketten-ID oder einen QR-Code-Inhalt eingeben.",
      );
      return;
    }

    const matchingItem = findInventoryItemByLabelCode(
      inventoryItems,
      labelCode,
    );

    if (!matchingItem) {
      setHighlightedInventoryItemId(null);
      setLabelScanMessage(
        `Kein Bestandseintrag für Etikett ${labelCode} gefunden.`,
      );
      return;
    }

    setHighlightedInventoryItemId(matchingItem.id);
    setLabelScanMessage(
      `Etikett ${matchingItem.label_code} gefunden: ${matchingItem.product_name}`,
    );

    window.setTimeout(() => {
      document
        .getElementById(`inventory-item-${matchingItem.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  function resetLabelScan() {
    setLabelScanInput("");
    setHighlightedInventoryItemId(null);
    setLabelScanMessage("");
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

  function handleRemovalReasonChange(nextReason) {
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
  }

  function handleRemovalProductStatusChange(nextStatus) {
    setRemovalProductStatus(nextStatus);

    if (removalReason === "falsch_erfasst") {
      setSaveRemovalToHistory(false);
      return;
    }

    setSaveRemovalToHistory(shouldSuggestHistory(removalReason, nextStatus));
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
        labelScanInput={labelScanInput}
        highlightedInventoryItemId={highlightedInventoryItemId}
        onCreateInventoryItem={handleCreateInventoryItem}
        onInventoryProductChange={handleInventoryProductChange}
        onUpdateInventoryForm={updateInventoryForm}
        onInventorySearchTermChange={setInventorySearchTerm}
        onInventoryStatusFilterChange={setInventoryStatusFilter}
        onInventoryStorageFilterChange={setInventoryStorageFilter}
        onResetInventoryFilters={resetInventoryFilters}
        onOpenRemovalDialog={openRemovalDialog}
        onLabelScanInputChange={setLabelScanInput}
        onLabelScanSubmit={handleLabelScanSubmit}
        labelScanMessage={labelScanMessage}
        onResetLabelScan={resetLabelScan}
      />

      <HistorySection
        historyItems={historyItems}
        filteredHistoryItems={filteredHistoryItems}
        historySearchTerm={historySearchTerm}
        historyReasonFilter={historyReasonFilter}
        historyBuyAgainFilter={historyBuyAgainFilter}
        historyProductFilter={historyProductFilter}
        selectedHistoryProduct={selectedHistoryProduct}
        hasActiveHistoryFilters={hasActiveHistoryFilters}
        loadingHistory={loadingHistory}
        onHistorySearchTermChange={setHistorySearchTerm}
        onHistoryReasonFilterChange={setHistoryReasonFilter}
        onHistoryBuyAgainFilterChange={setHistoryBuyAgainFilter}
        onResetHistoryFilters={resetHistoryFilters}
        onOpenHistoryDialog={openHistoryDialog}
        onOpenHistoryDeleteDialog={openHistoryDeleteDialog}
      />

      <StorageSection
        storageTree={storageTree}
        loadingStorage={loadingStorage}
      />

      <RemovalDialog
        removalDialogItem={removalDialogItem}
        removalReason={removalReason}
        removalProductStatus={removalProductStatus}
        saveRemovalToHistory={saveRemovalToHistory}
        experienceReason={experienceReason}
        experienceNote={experienceNote}
        removingInventoryItem={removingInventoryItem}
        onCloseRemovalDialog={closeRemovalDialog}
        onConfirmRemoveInventoryItem={confirmRemoveInventoryItem}
        onRemovalReasonChange={handleRemovalReasonChange}
        onRemovalProductStatusChange={handleRemovalProductStatusChange}
        onSaveRemovalToHistoryChange={setSaveRemovalToHistory}
        onExperienceReasonChange={setExperienceReason}
        onExperienceNoteChange={setExperienceNote}
      />

      <HistoryDeleteDialog
        historyDeleteDialogItem={historyDeleteDialogItem}
        deletingHistoryItem={deletingHistoryItem}
        onCloseHistoryDeleteDialog={closeHistoryDeleteDialog}
        onConfirmDeleteHistoryItem={confirmDeleteHistoryItem}
      />

      <HistoryEditDialog
        historyDialogItem={historyDialogItem}
        historyEditReason={historyEditReason}
        historyEditBuyAgainStatus={historyEditBuyAgainStatus}
        historyEditExperienceReason={historyEditExperienceReason}
        historyEditExperienceNote={historyEditExperienceNote}
        historyEditNotes={historyEditNotes}
        savingHistoryItem={savingHistoryItem}
        onCloseHistoryDialog={closeHistoryDialog}
        onConfirmSaveHistoryItem={confirmSaveHistoryItem}
        onHistoryEditReasonChange={setHistoryEditReason}
        onHistoryEditBuyAgainStatusChange={setHistoryEditBuyAgainStatus}
        onHistoryEditExperienceReasonChange={setHistoryEditExperienceReason}
        onHistoryEditExperienceNoteChange={setHistoryEditExperienceNote}
        onHistoryEditNotesChange={setHistoryEditNotes}
      />
    </main>
  );
}

export default App;
