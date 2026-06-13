// client/src/App.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

import { emptyInventoryForm, emptyProductForm } from "./constants/formDefaults";

import {
  ACTIVE_SECTION_STORAGE_KEY,
  HISTORY_FILTER_STORAGE_KEY,
  INVENTORY_FILTER_STORAGE_KEY,
  INVENTORY_FORM_DRAFT_STORAGE_KEY,
  INVENTORY_PRODUCTS_VISIBILITY_STORAGE_KEY,
  PRODUCT_FORM_DRAFT_STORAGE_KEY,
} from "./constants/localStorageKeys";

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
  loadShoppingListItems,
  createShoppingListItem,
  updateShoppingListItemById,
  completeShoppingListItemById,
  reopenShoppingListItemById,
  deleteShoppingListItemById,
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

import { ShoppingListSection } from "./components/shopping/ShoppingListSection";

import { MaintenanceSection } from "./components/maintenance/MaintenanceSection";

import { RemovalDialog } from "./components/dialogs/RemovalDialog";

import { HistoryDeleteDialog } from "./components/dialogs/HistoryDeleteDialog";
import { HistoryEditDialog } from "./components/dialogs/HistoryEditDialog";

import {
  extractLabelCodeFromScanText,
  findInventoryItemByLabelCode,
} from "./utils/labelScanUtils";

import DevApiInfo from "./components/common/DevApiInfo";

const initialHistoryEditState = createInitialHistoryEditState();
const initialRemovalState = createInitialRemovalState();

const initialInventoryFilterState = createInitialInventoryFilterState();
const initialHistoryFilterState = createInitialHistoryFilterState();

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

function loadInventoryFilterState() {
  try {
    const storedValue = window.localStorage.getItem(
      INVENTORY_FILTER_STORAGE_KEY,
    );

    if (!storedValue) {
      return initialInventoryFilterState;
    }

    return {
      ...initialInventoryFilterState,
      ...JSON.parse(storedValue),
    };
  } catch (error) {
    console.error(error);
    return initialInventoryFilterState;
  }
}

function saveInventoryFilterState(nextFilterState) {
  try {
    window.localStorage.setItem(
      INVENTORY_FILTER_STORAGE_KEY,
      JSON.stringify(nextFilterState),
    );
  } catch (error) {
    console.error(error);
  }

  return nextFilterState;
}

function loadHistoryFilterState() {
  try {
    const storedValue = window.localStorage.getItem(HISTORY_FILTER_STORAGE_KEY);

    if (!storedValue) {
      return initialHistoryFilterState;
    }

    return {
      ...initialHistoryFilterState,
      ...JSON.parse(storedValue),
    };
  } catch (error) {
    console.error(error);
    return initialHistoryFilterState;
  }
}

function saveHistoryFilterState(nextFilterState) {
  try {
    window.localStorage.setItem(
      HISTORY_FILTER_STORAGE_KEY,
      JSON.stringify(nextFilterState),
    );
  } catch (error) {
    console.error(error);
  }

  return nextFilterState;
}

function loadActiveSection() {
  try {
    const storedValue = window.localStorage.getItem(ACTIVE_SECTION_STORAGE_KEY);

    if (!storedValue) {
      return "inventory";
    }

    return storedValue;
  } catch (error) {
    console.error(error);
    return "inventory";
  }
}

function saveActiveSection(nextActiveSection) {
  try {
    window.localStorage.setItem(ACTIVE_SECTION_STORAGE_KEY, nextActiveSection);
  } catch (error) {
    console.error(error);
  }

  return nextActiveSection;
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

function loadInventoryFormDraft() {
  try {
    const storedValue = window.localStorage.getItem(
      INVENTORY_FORM_DRAFT_STORAGE_KEY,
    );

    if (!storedValue) {
      return { ...emptyInventoryForm };
    }

    return {
      ...emptyInventoryForm,
      ...JSON.parse(storedValue),
    };
  } catch (error) {
    console.error(error);
    return { ...emptyInventoryForm };
  }
}

function saveInventoryFormDraft(nextInventoryForm) {
  try {
    window.localStorage.setItem(
      INVENTORY_FORM_DRAFT_STORAGE_KEY,
      JSON.stringify(nextInventoryForm),
    );
  } catch (error) {
    console.error(error);
  }

  return nextInventoryForm;
}

function clearInventoryFormDraft() {
  try {
    window.localStorage.removeItem(INVENTORY_FORM_DRAFT_STORAGE_KEY);
  } catch (error) {
    console.error(error);
  }
}

function hasMeaningfulProductDraft(productFormDraft) {
  return [
    productFormDraft.name,
    productFormDraft.brand,
    productFormDraft.category,
    productFormDraft.country,
    productFormDraft.store,
    productFormDraft.rating,
    productFormDraft.notes,
    productFormDraft.imageFront,
    productFormDraft.imageBack,
  ].some((value) => String(value || "").trim());
}

function hasMeaningfulInventoryDraft(inventoryFormDraft) {
  return [
    inventoryFormDraft.productId,
    inventoryFormDraft.storageUnitId,
    inventoryFormDraft.storageCompartmentId,
    inventoryFormDraft.originalQuantity,
    inventoryFormDraft.remainingQuantity,
    inventoryFormDraft.remainingFraction,
    inventoryFormDraft.bestBeforeDate,
    inventoryFormDraft.frozenDate,
    inventoryFormDraft.openedDate,
    inventoryFormDraft.notes,
  ].some((value) => String(value || "").trim());
}

function App() {
  const [storageTree, setStorageTree] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [activeSection, setActiveSection] = useState(() => loadActiveSection());
  const [showProductsInInventoryView, setShowProductsInInventoryView] =
    useState(() => loadShowProductsInInventoryView());
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [shoppingListItems, setShoppingListItems] = useState([]);
  const [loadingShoppingList, setLoadingShoppingList] = useState(true);
  const [savingShoppingListItem, setSavingShoppingListItem] = useState(false);
  const [showCompletedShoppingItems, setShowCompletedShoppingItems] =
    useState(false);

  const [historyFilterState, setHistoryFilterState] = useState(() =>
    loadHistoryFilterState(),
  );

  const {
    historySearchTerm,
    historyReasonFilter,
    historyBuyAgainFilter,
    historyProductFilter,
  } = historyFilterState;

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
  const [hasProductFormDraft, setHasProductFormDraft] = useState(() =>
    hasMeaningfulProductDraft(loadProductFormDraft()),
  );

  const [inventoryForm, setInventoryForm] = useState(() =>
    loadInventoryFormDraft(),
  );

  const [hasInventoryFormDraft, setHasInventoryFormDraft] = useState(() =>
    hasMeaningfulInventoryDraft(loadInventoryFormDraft()),
  );

  const [savingInventoryItem, setSavingInventoryItem] = useState(false);

  const [inventoryFilterState, setInventoryFilterState] = useState(() =>
    loadInventoryFilterState(),
  );

  const {
    inventorySearchTerm,
    inventoryStatusFilter,
    inventoryStorageFilter,
    inventorySortMode,
  } = inventoryFilterState;

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
          shoppingListData,
        ] = await Promise.all([
          loadStorageTree(),
          loadProducts(),
          loadInventoryItems(),
          loadHistoryItems(),
          loadLabelSlots(),
          loadShoppingListItems(true),
        ]);

        setStorageTree(storageData);
        setProducts(productData);
        setInventoryItems(inventoryData);
        setHistoryItems(historyData);
        setLabelSlots(labelSlotData);
        setShoppingListItems(shoppingListData);
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
        setLoadingShoppingList(false);
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
        setHasProductFormDraft(hasMeaningfulProductDraft(nextProductForm));
      }

      return nextProductForm;
    });
  }

  function resetProductForm() {
    clearProductFormDraft();
    setHasProductFormDraft(false);
    setProductForm({ ...emptyProductForm });
    setEditingProductId(null);
  }

  function discardProductFormDraft() {
    clearProductFormDraft();
    setHasProductFormDraft(false);
    setProductForm({ ...emptyProductForm });
    setEditingProductId(null);
  }

  function updateInventoryForm(field, value) {
    setInventoryForm((currentForm) => {
      const nextInventoryForm = {
        ...currentForm,
        [field]: value,
      };

      if (!editingInventoryItemId) {
        saveInventoryFormDraft(nextInventoryForm);
        setHasInventoryFormDraft(
          hasMeaningfulInventoryDraft(nextInventoryForm),
        );
      }

      return nextInventoryForm;
    });
  }

  function resetInventoryForm() {
    clearInventoryFormDraft();
    setHasInventoryFormDraft(false);
    setInventoryForm({ ...emptyInventoryForm });
  }

  function discardInventoryFormDraft() {
    clearInventoryFormDraft();
    setHasInventoryFormDraft(false);
    setInventoryForm({ ...emptyInventoryForm });
    setEditingInventoryItemId(null);
  }

  function updateInventoryFilter(field, value) {
    setInventoryFilterState((currentFilterState) => {
      const nextFilterState = {
        ...currentFilterState,
        [field]: value,
      };

      return saveInventoryFilterState(nextFilterState);
    });
  }

  function resetInventoryFilters() {
    setInventoryFilterState(
      saveInventoryFilterState(initialInventoryFilterState),
    );
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

  function updateHistoryFilter(field, value) {
    setHistoryFilterState((currentFilterState) => {
      const nextFilterState = {
        ...currentFilterState,
        [field]: value,
      };

      return saveHistoryFilterState(nextFilterState);
    });
  }

  function resetHistoryFilters() {
    setHistoryFilterState(saveHistoryFilterState(initialHistoryFilterState));
  }

  function handleInventoryProductChange(productId) {
    const latestItem = getLatestInventoryItemForProduct(
      inventoryItems,
      productId,
    );

    setInventoryForm((currentForm) => {
      const nextInventoryForm = {
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
      };

      if (!editingInventoryItemId) {
        saveInventoryFormDraft(nextInventoryForm);
        setHasInventoryFormDraft(
          hasMeaningfulInventoryDraft(nextInventoryForm),
        );
      }

      return nextInventoryForm;
    });
  }

  function showProductHistory(product) {
    const nextHistoryFilterState = {
      ...initialHistoryFilterState,
      historyProductFilter: String(product.id),
    };

    setHistoryFilterState(saveHistoryFilterState(nextHistoryFilterState));

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
    setHasProductFormDraft(false);
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
    clearInventoryFormDraft();
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

  function changeActiveSection(nextActiveSection) {
    setActiveSection(saveActiveSection(nextActiveSection));
  }

  function toggleProductsInInventoryView() {
    setShowProductsInInventoryView((currentShowProductsInInventoryView) =>
      saveShowProductsInInventoryView(!currentShowProductsInInventoryView),
    );
  }

  async function handleCreateShoppingListItem(payload) {
    if (!payload.customName.trim()) {
      setErrorMessage("Bitte einen Artikelnamen eingeben.");
      return false;
    }

    try {
      setSavingShoppingListItem(true);
      setErrorMessage("");

      const createdItem = await createShoppingListItem(payload);

      setShoppingListItems((currentItems) => [createdItem, ...currentItems]);

      return true;
    } catch (error) {
      console.error(error);
      setErrorMessage("Einkaufslisteneintrag konnte nicht gespeichert werden.");
      return false;
    } finally {
      setSavingShoppingListItem(false);
    }
  }

  async function handleAddProductToShoppingList(product) {
    try {
      setSavingShoppingListItem(true);
      setErrorMessage("");

      const createdItem = await createShoppingListItem({
        productId: product.id,
        customName: "",
        quantity: "",
        unit: "",
        category: product.category || "",
        priority:
          product.buy_again_status === "wieder_kaufen" ? "hoch" : "normal",
      });

      setShoppingListItems((currentItems) => [createdItem, ...currentItems]);
      setActiveSection(saveActiveSection("shopping"));

      return true;
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Produkt konnte nicht zur Einkaufsliste hinzugefügt werden.",
      );
      return false;
    } finally {
      setSavingShoppingListItem(false);
    }
  }

  async function handleUpdateShoppingListItem(itemId, payload) {
    if (!payload.productId && !payload.customName.trim()) {
      setErrorMessage("Bitte einen Artikelnamen eingeben.");
      return false;
    }

    try {
      setSavingShoppingListItem(true);
      setErrorMessage("");

      const updatedItem = await updateShoppingListItemById(itemId, payload);

      setShoppingListItems((currentItems) =>
        currentItems.map((item) => (item.id === itemId ? updatedItem : item)),
      );

      return true;
    } catch (error) {
      console.error(error);
      setErrorMessage("Einkaufslisteneintrag konnte nicht gespeichert werden.");
      return false;
    } finally {
      setSavingShoppingListItem(false);
    }
  }

  async function handleCompleteShoppingListItem(itemId) {
    try {
      setErrorMessage("");

      const updatedItem = await completeShoppingListItemById(itemId);

      setShoppingListItems((currentItems) =>
        currentItems.map((item) => (item.id === itemId ? updatedItem : item)),
      );
    } catch (error) {
      console.error(error);
      setErrorMessage("Einkaufslisteneintrag konnte nicht erledigt werden.");
    }
  }

  async function handleReopenShoppingListItem(itemId) {
    try {
      setErrorMessage("");

      const updatedItem = await reopenShoppingListItemById(itemId);

      setShoppingListItems((currentItems) =>
        currentItems.map((item) => (item.id === itemId ? updatedItem : item)),
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Einkaufslisteneintrag konnte nicht wieder geöffnet werden.",
      );
    }
  }

  async function handleDeleteShoppingListItem(itemId) {
    const confirmed = window.confirm(
      "Diesen Einkaufslisteneintrag wirklich löschen?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");

      await deleteShoppingListItemById(itemId);

      setShoppingListItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId),
      );
    } catch (error) {
      console.error(error);
      setErrorMessage("Einkaufslisteneintrag konnte nicht gelöscht werden.");
    }
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
          hasProductFormDraft={hasProductFormDraft}
          onDiscardProductFormDraft={discardProductFormDraft}
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
          onAddProductToShoppingList={handleAddProductToShoppingList}
          savingShoppingListItem={savingShoppingListItem}
        />
      );
    }

    if (activeSection === "shopping") {
      return (
        <ShoppingListSection
          shoppingListItems={shoppingListItems}
          loadingShoppingList={loadingShoppingList}
          showCompletedShoppingItems={showCompletedShoppingItems}
          savingShoppingListItem={savingShoppingListItem}
          onShowCompletedShoppingItemsChange={setShowCompletedShoppingItems}
          onCreateShoppingListItem={handleCreateShoppingListItem}
          onUpdateShoppingListItem={handleUpdateShoppingListItem}
          onCompleteShoppingListItem={handleCompleteShoppingListItem}
          onReopenShoppingListItem={handleReopenShoppingListItem}
          onDeleteShoppingListItem={handleDeleteShoppingListItem}
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
          onHistorySearchTermChange={(value) =>
            updateHistoryFilter("historySearchTerm", value)
          }
          onHistoryReasonFilterChange={(value) =>
            updateHistoryFilter("historyReasonFilter", value)
          }
          onHistoryBuyAgainFilterChange={(value) =>
            updateHistoryFilter("historyBuyAgainFilter", value)
          }
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

    if (activeSection === "maintenance") {
      return <MaintenanceSection />;
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
            hasProductFormDraft={hasProductFormDraft}
            onDiscardProductFormDraft={discardProductFormDraft}
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
            onAddProductToShoppingList={handleAddProductToShoppingList}
            savingShoppingListItem={savingShoppingListItem}
          />
        )}

        <InventorySection
          inventoryForm={inventoryForm}
          products={products}
          storageTree={storageTree}
          hasInventoryFormDraft={hasInventoryFormDraft}
          onDiscardInventoryFormDraft={discardInventoryFormDraft}
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
          onInventorySearchTermChange={(value) =>
            updateInventoryFilter("inventorySearchTerm", value)
          }
          onInventoryStatusFilterChange={(value) =>
            updateInventoryFilter("inventoryStatusFilter", value)
          }
          onInventoryStorageFilterChange={(value) =>
            updateInventoryFilter("inventoryStorageFilter", value)
          }
          onInventorySortModeChange={(value) =>
            updateInventoryFilter("inventorySortMode", value)
          }
          inventoryStorageFilterOptions={inventoryStorageFilterOptions}
          hasActiveInventoryFilters={hasActiveInventoryFilters}
          loadingInventory={loadingInventory}
          labelScanInput={labelScanInput}
          highlightedInventoryItemId={highlightedInventoryItemId}
          onCreateInventoryItem={handleSaveInventoryItem}
          onInventoryProductChange={handleInventoryProductChange}
          onUpdateInventoryForm={updateInventoryForm}
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
          <DevApiInfo />
        </div>
      </header>

      {errorMessage && <p className="error">{errorMessage}</p>}

      <nav className="app-section-nav" aria-label="Hauptbereiche">
        <button
          type="button"
          className={activeSection === "inventory" ? "active" : ""}
          onClick={() => changeActiveSection("inventory")}
        >
          Bestand
        </button>

        <button
          type="button"
          className={activeSection === "products" ? "active" : ""}
          onClick={() => changeActiveSection("products")}
        >
          Produkte
        </button>

        <button
          type="button"
          className={activeSection === "labels" ? "active" : ""}
          onClick={() => changeActiveSection("labels")}
        >
          Etiketten
        </button>

        <button
          type="button"
          className={activeSection === "shopping" ? "active" : ""}
          onClick={() => changeActiveSection("shopping")}
        >
          Einkaufsliste
        </button>

        <button
          type="button"
          className={activeSection === "history" ? "active" : ""}
          onClick={() => changeActiveSection("history")}
        >
          Historie
        </button>

        <button
          type="button"
          className={activeSection === "storage" ? "active" : ""}
          onClick={() => changeActiveSection("storage")}
        >
          Lagerorte
        </button>
        <button
          type="button"
          className={activeSection === "maintenance" ? "active" : ""}
          onClick={() => changeActiveSection("maintenance")}
        >
          Wartung
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
