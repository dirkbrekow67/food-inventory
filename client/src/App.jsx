// client/src/App.jsx
import { useCallback, useEffect, useRef, useState } from "react";
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
  loadLabelSlots,
  updateLabelPrintStatus,
  updateInventoryItemById,
} from "./api/inventoryApi";

import {
  getLatestInventoryItemForProduct,
  updateInventoryListAfterCreate,
  updateInventoryListAfterRemove,
  updateInventoryListAfterUpdate,
} from "./utils/inventoryDataUtils";

import {
  createProductFormFromProduct,
  createProductPayload,
  updateProductListAfterDeactivate,
  updateProductListAfterInventoryRemoval,
  updateProductListAfterSave,
} from "./utils/productDataUtils";

import {
  createInventoryEditStateFromItem,
  createInventoryPayload,
} from "./utils/inventoryFormUtils";

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

import { LabelSheetSection } from "./components/labels/LabelSheetSection";

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

const INVENTORY_PRODUCTS_VISIBILITY_STORAGE_KEY =
  "food-inventory.showProductsInInventoryView";

const PRODUCT_FORM_DRAFT_STORAGE_KEY = "food-inventory.productFormDraft";

function loadShowProductsInInventoryView() {
  try {
    const storedValue = window.localStorage.getItem(
      INVENTORY_PRODUCTS_VISIBILITY_STORAGE_KEY,
    );

    if (storedValue === null) {
      return true;
    }

    return storedValue === "true";
  } catch (error) {
    console.error(error);
    return true;
  }
}

function saveShowProductsInInventoryView(nextValue) {
  try {
    window.localStorage.setItem(
      INVENTORY_PRODUCTS_VISIBILITY_STORAGE_KEY,
      String(nextValue),
    );
  } catch (error) {
    console.error(error);
  }

  return nextValue;
}

function loadProductFormDraft() {
  try {
    const storedValue = window.localStorage.getItem(
      PRODUCT_FORM_DRAFT_STORAGE_KEY,
    );

    if (!storedValue) {
      return { ...emptyProductForm };
    }

    return {
      ...emptyProductForm,
      ...JSON.parse(storedValue),
    };
  } catch (error) {
    console.error(error);
    return { ...emptyProductForm };
  }
}

function saveProductFormDraft(nextProductForm) {
  try {
    window.localStorage.setItem(
      PRODUCT_FORM_DRAFT_STORAGE_KEY,
      JSON.stringify(nextProductForm),
    );
  } catch (error) {
    console.error(error);
  }

  return nextProductForm;
}

function clearProductFormDraft() {
  try {
    window.localStorage.removeItem(PRODUCT_FORM_DRAFT_STORAGE_KEY);
  } catch (error) {
    console.error(error);
  }
}

function App() {
  const [storageTree, setStorageTree] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [activeSection, setActiveSection] = useState("inventory");
  const [showProductsInInventoryView, setShowProductsInInventoryView] =
    useState(() => loadShowProductsInInventoryView());
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

  const [productForm, setProductForm] = useState(() => loadProductFormDraft());
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
  const [inventorySortMode, setInventorySortMode] = useState(
    initialInventoryFilterState.inventorySortMode,
  );
  const [removalDialogItem, setRemovalDialogItem] = useState(null);
  const [editingInventoryItemId, setEditingInventoryItemId] = useState(null);
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
  const [labelSlots, setLabelSlots] = useState([]);
  const [highlightedInventoryItemId, setHighlightedInventoryItemId] =
    useState(null);
  const [labelScanMessage, setLabelScanMessage] = useState("");
  const hasHandledInitialLabelUrl = useRef(false);

  useEffect(() => {
    async function loadData() {
      try {
        setErrorMessage("");

        const [
          storageData,
          productData,
          inventoryData,
          historyData,
          labelSlotData,
        ] = await Promise.all([
          loadStorageTree(),
          loadProducts(),
          loadInventoryItems(),
          loadHistoryItems(),
          loadLabelSlots(),
        ]);

        setStorageTree(storageData);
        setProducts(productData);
        setInventoryItems(inventoryData);
        setHistoryItems(historyData);
        setLabelSlots(labelSlotData);
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
    setProductForm((currentForm) => {
      const nextProductForm = {
        ...currentForm,
        [field]: value,
      };

      if (!editingProductId) {
        saveProductFormDraft(nextProductForm);
      }

      return nextProductForm;
    });
  }

  function resetProductForm() {
    clearProductFormDraft();
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
    setInventorySortMode(initialInventoryFilterState.inventorySortMode);
  }

  async function reloadStorageTree() {
    try {
      setLoadingStorage(true);
      setErrorMessage("");

      const storageData = await loadStorageTree();
      setStorageTree(storageData);
    } catch (error) {
      console.error(error);
      setErrorMessage("Lagerstruktur konnte nicht neu geladen werden.");
    } finally {
      setLoadingStorage(false);
    }
  }

  async function reloadLabelSlots() {
    try {
      const labelSlotData = await loadLabelSlots();
      setLabelSlots(labelSlotData);

      return labelSlotData;
    } catch (error) {
      console.error(error);
      setErrorMessage("Etikettenpool konnte nicht neu geladen werden.");
      return [];
    }
  }

  const openInventoryItemFromLabelCode = useCallback(
    (labelCode) => {
      const normalizedLabelCode = extractLabelCodeFromScanText(labelCode);

      if (!normalizedLabelCode) {
        setHighlightedInventoryItemId(null);
        setLabelScanMessage(
          "Bitte eine Etiketten-ID oder einen QR-Code-Inhalt eingeben.",
        );
        return;
      }

      const matchingItem = findInventoryItemByLabelCode(
        inventoryItems,
        normalizedLabelCode,
      );

      setLabelScanInput(normalizedLabelCode);

      if (!matchingItem) {
        setHighlightedInventoryItemId(null);
        setLabelScanMessage(
          `Kein Bestandseintrag für Etikett ${normalizedLabelCode} gefunden.`,
        );
        return;
      }

      resetInventoryFilters();
      setHighlightedInventoryItemId(matchingItem.id);
      setLabelScanMessage(
        `Etikett ${matchingItem.label_code} gefunden: ${matchingItem.product_name}`,
      );

      window.setTimeout(() => {
        document
          .getElementById(`inventory-item-${matchingItem.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    },
    [inventoryItems],
  );

  useEffect(() => {
    if (hasHandledInitialLabelUrl.current || inventoryItems.length === 0) {
      return undefined;
    }

    const labelFromUrl = extractLabelCodeFromScanText(window.location.href);

    if (!labelFromUrl) {
      return undefined;
    }

    hasHandledInitialLabelUrl.current = true;

    const timeoutId = window.setTimeout(() => {
      openInventoryItemFromLabelCode(labelFromUrl);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [inventoryItems, openInventoryItemFromLabelCode]);

  function handleLabelScanSubmit(event) {
    event.preventDefault();

    openInventoryItemFromLabelCode(labelScanInput);
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
      return false;
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

      return true;
    } catch (error) {
      console.error(error);
      setErrorMessage("Produkt konnte nicht gespeichert werden.");
      return false;
    } finally {
      setSavingProduct(false);
    }
  }

  function startEditProduct(product) {
    clearProductFormDraft();
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

  async function handleSaveInventoryItem(event) {
    event.preventDefault();

    if (!inventoryForm.productId) {
      setErrorMessage("Bitte Produkt auswählen.");
      return false;
    }

    if (!inventoryForm.createMultipleItems && !inventoryForm.storageUnitId) {
      setErrorMessage("Bitte Produkt und Lagergerät auswählen.");
      return false;
    }

    try {
      setSavingInventoryItem(true);
      setErrorMessage("");

      const payload = createInventoryPayload(inventoryForm);

      if (editingInventoryItemId) {
        const updatedItem = await updateInventoryItemById(
          editingInventoryItemId,
          payload,
        );

        setInventoryItems((currentItems) =>
          updateInventoryListAfterUpdate(currentItems, updatedItem),
        );

        setLabelScanMessage(
          `Bestand ${updatedItem.label_code || updatedItem.product_name} wurde aktualisiert.`,
        );

        setEditingInventoryItemId(null);
        resetInventoryForm();

        return true;
      }

      const createdResult = await createInventoryItem(payload);

      const createdItems = Array.isArray(createdResult)
        ? createdResult
        : [createdResult];

      setInventoryItems((currentItems) =>
        createdItems.reduce(
          (nextItems, createdItem) =>
            updateInventoryListAfterCreate(nextItems, createdItem),
          currentItems,
        ),
      );

      if (createdItems.length === 1) {
        setLabelScanMessage(
          `Bestand ${createdItems[0].label_code || createdItems[0].product_name} wurde angelegt.`,
        );
      } else {
        setLabelScanMessage(
          `${createdItems.length} Bestandseinträge wurden angelegt.`,
        );
      }

      await reloadLabelSlots();

      resetInventoryForm();

      return true;
    } catch (error) {
      console.error(error);
      setErrorMessage("Bestand konnte nicht gespeichert werden.");
      return false;
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

  function startEditInventoryItem(item) {
    setEditingInventoryItemId(item.id);
    setInventoryForm(createInventoryEditStateFromItem(item));

    document
      .querySelector(".inventory-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelInventoryEdit() {
    setEditingInventoryItemId(null);
    resetInventoryForm();
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

  async function updateInventoryLabelPrintStatus(item, printStatus) {
    if (!item?.label_code) {
      return;
    }

    try {
      setErrorMessage("");

      await updateLabelPrintStatus(item.label_code, printStatus);

      setInventoryItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                label_print_status: printStatus,
              }
            : currentItem,
        ),
      );

      await reloadLabelSlots();

      if (printStatus === "reprint_needed") {
        setLabelScanMessage(
          `Etikett ${item.label_code} wurde als unlesbar markiert. Bestand bleibt unverändert.`,
        );
      }

      if (printStatus === "printed") {
        setLabelScanMessage(
          `Druckstatus für Etikett ${item.label_code} wurde als in Ordnung bestätigt.`,
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Druckstatus konnte nicht aktualisiert werden.");
    }
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

      await reloadLabelSlots();

      if (removalDialogItem.label_code) {
        setLabelScanMessage(
          `Etikett ${removalDialogItem.label_code} wurde freigegeben und kann wiederverwendet werden.`,
        );
      }

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
    inventorySortMode,
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

  function toggleProductsInInventoryView() {
    setShowProductsInInventoryView((currentShowProductsInInventoryView) =>
      saveShowProductsInInventoryView(!currentShowProductsInInventoryView),
    );
  }

  function renderActiveSection() {
    if (activeSection === "labels") {
      return (
        <LabelSheetSection
          inventoryItems={inventoryItems}
          labelSlots={labelSlots}
          onLabelSlotsChange={setLabelSlots}
          onReloadLabelSlots={reloadLabelSlots}
        />
      );
    }

    if (activeSection === "products") {
      return (
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
      );
    }

    if (activeSection === "history") {
      return (
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
      );
    }

    if (activeSection === "storage") {
      return (
        <StorageSection
          storageTree={storageTree}
          loadingStorage={loadingStorage}
          onReloadStorage={reloadStorageTree}
        />
      );
    }

    return (
      <>
        <div className="inventory-subnav">
          <button
            type="button"
            className="secondary-button"
            onClick={toggleProductsInInventoryView}
          >
            {showProductsInInventoryView
              ? "Produkte ausblenden"
              : "Produkte anzeigen"}
          </button>

          <span>
            {showProductsInInventoryView
              ? "Produktstammdaten und Bestandserfassung werden gemeinsam angezeigt."
              : "Produktstammdaten sind ausgeblendet. Bestandserfassung bleibt aktiv."}
          </span>
        </div>

        {showProductsInInventoryView && (
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
        )}

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
          inventorySortMode={inventorySortMode}
          inventoryStorageFilterOptions={inventoryStorageFilterOptions}
          hasActiveInventoryFilters={hasActiveInventoryFilters}
          loadingInventory={loadingInventory}
          labelScanInput={labelScanInput}
          highlightedInventoryItemId={highlightedInventoryItemId}
          onCreateInventoryItem={handleSaveInventoryItem}
          onInventoryProductChange={handleInventoryProductChange}
          onUpdateInventoryForm={updateInventoryForm}
          onInventorySearchTermChange={setInventorySearchTerm}
          onInventoryStatusFilterChange={setInventoryStatusFilter}
          onInventoryStorageFilterChange={setInventoryStorageFilter}
          onInventorySortModeChange={setInventorySortMode}
          onResetInventoryFilters={resetInventoryFilters}
          onOpenRemovalDialog={openRemovalDialog}
          onOpenInventoryEditDialog={startEditInventoryItem}
          onUpdateLabelPrintStatus={updateInventoryLabelPrintStatus}
          onLabelScanInputChange={setLabelScanInput}
          onLabelScanSubmit={handleLabelScanSubmit}
          labelScanMessage={labelScanMessage}
          onResetLabelScan={resetLabelScan}
          editingInventoryItemId={editingInventoryItemId}
          onCancelInventoryEdit={cancelInventoryEdit}
        />
      </>
    );
  }

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

      <nav className="app-section-nav" aria-label="Hauptbereiche">
        <button
          type="button"
          className={activeSection === "inventory" ? "active" : ""}
          onClick={() => setActiveSection("inventory")}
        >
          Bestand
        </button>

        <button
          type="button"
          className={activeSection === "products" ? "active" : ""}
          onClick={() => setActiveSection("products")}
        >
          Produkte
        </button>

        <button
          type="button"
          className={activeSection === "labels" ? "active" : ""}
          onClick={() => setActiveSection("labels")}
        >
          Etiketten
        </button>

        <button
          type="button"
          className={activeSection === "history" ? "active" : ""}
          onClick={() => setActiveSection("history")}
        >
          Historie
        </button>

        <button
          type="button"
          className={activeSection === "storage" ? "active" : ""}
          onClick={() => setActiveSection("storage")}
        >
          Lagerorte
        </button>
      </nav>

      {renderActiveSection()}

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
