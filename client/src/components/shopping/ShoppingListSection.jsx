// client/src/components/shopping/ShoppingListSection.jsx

import { useRef, useState } from "react";

import {
  quantityUnitOptions,
  shoppingListCategorySuggestionOptions,
  shoppingListPriorityOptions,
} from "../../constants/selectOptions";

import {
  EMPTY_SHOPPING_LIST_FORM,
  compareText,
  createEditStateFromItem,
  createShoppingListCreatePayload,
  createShoppingListExportText,
  createShoppingListUpdatePayload,
  filterShoppingListItemsByForeignPurchase,
  formatShoppingListQuantity,
  getShoppingListItemTitle,
  groupShoppingListItemsByCategory,
  sortShoppingListItems,
} from "../../utils/shoppingListUtils";

export function ShoppingListSection({
  shoppingListItems,
  loadingShoppingList,
  showCompletedShoppingItems,
  savingShoppingListItem,
  shoppingListMessage,
  onShowCompletedShoppingItemsChange,
  onCreateShoppingListItem,
  onUpdateShoppingListItem,
  onCompleteShoppingListItem,
  onReopenShoppingListItem,
  onDeleteShoppingListItem,
}) {
  const [shoppingListForm, setShoppingListForm] = useState(
    EMPTY_SHOPPING_LIST_FORM,
  );

  const [foreignPurchaseFilter, setForeignPurchaseFilter] = useState("all");
  const [shoppingListCopyMessage, setShoppingListCopyMessage] = useState("");
  const shoppingListCopyMessageTimeoutRef = useRef(null);
  const [showShoppingListExportText, setShowShoppingListExportText] =
    useState(false);

  const [editingShoppingListItemId, setEditingShoppingListItemId] =
    useState(null);
  const [editState, setEditState] = useState(createEditStateFromItem({}));

  const filteredShoppingListItems = filterShoppingListItemsByForeignPurchase(
    shoppingListItems,
    foreignPurchaseFilter,
  );

  const openItems = sortShoppingListItems(
    filteredShoppingListItems.filter((item) => item.status === "open"),
  );

  const completedItems = sortShoppingListItems(
    filteredShoppingListItems.filter((item) => item.status === "completed"),
  );

  const openItemsByCategory = groupShoppingListItemsByCategory(openItems);
  const openCategoryNames = Object.keys(openItemsByCategory).sort(compareText);

  const shoppingListExportText = createShoppingListExportText(
    openItems,
    foreignPurchaseFilter,
  );

  const visibleShoppingListMessage =
    shoppingListCopyMessage || shoppingListMessage;

  const allOpenItemsCount = shoppingListItems.filter(
    (item) => item.status === "open",
  ).length;

  const allForeignOpenItemsCount = shoppingListItems.filter(
    (item) => item.status === "open" && item.is_foreign_purchase === 1,
  ).length;

  const allDomesticOpenItemsCount = shoppingListItems.filter(
    (item) => item.status === "open" && item.is_foreign_purchase !== 1,
  ).length;

  function updateShoppingListFormField(field, value) {
    setShoppingListForm((currentShoppingListForm) => ({
      ...currentShoppingListForm,
      [field]: value,
    }));
  }

  function handleShoppingListFormFieldChange(field) {
    return (event) => {
      updateShoppingListFormField(field, event.target.value);
    };
  }

  function handleShoppingListFormCheckboxChange(field) {
    return (event) => {
      updateShoppingListFormField(field, event.target.checked);
    };
  }

  function resetShoppingListForm() {
    setShoppingListForm(EMPTY_SHOPPING_LIST_FORM);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const wasSaved = await onCreateShoppingListItem(
      createShoppingListCreatePayload(shoppingListForm),
    );

    if (!wasSaved) {
      return;
    }

    resetShoppingListForm();
  }

  function startEditShoppingListItem(item) {
    setEditingShoppingListItemId(item.id);
    setEditState(createEditStateFromItem(item));
  }

  function cancelEditShoppingListItem() {
    setEditingShoppingListItemId(null);
    setEditState(createEditStateFromItem({}));
  }

  function updateEditState(field, value) {
    setEditState((currentEditState) => ({
      ...currentEditState,
      [field]: value,
    }));
  }

  async function saveEditShoppingListItem(item) {
    const wasSaved = await onUpdateShoppingListItem(
      item.id,
      createShoppingListUpdatePayload(item, editState),
    );

    if (!wasSaved) {
      return;
    }

    cancelEditShoppingListItem();
  }

  function showShoppingListCopyMessage(message) {
    if (shoppingListCopyMessageTimeoutRef.current) {
      window.clearTimeout(shoppingListCopyMessageTimeoutRef.current);
    }

    setShoppingListCopyMessage(message);

    shoppingListCopyMessageTimeoutRef.current = window.setTimeout(() => {
      setShoppingListCopyMessage("");
      shoppingListCopyMessageTimeoutRef.current = null;
    }, 2500);
  }

  async function copyShoppingListToClipboard() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shoppingListExportText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shoppingListExportText;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        textArea.style.left = "-9999px";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const wasCopied = document.execCommand("copy");

        document.body.removeChild(textArea);

        if (!wasCopied) {
          throw new Error("Fallback-Kopiervorgang fehlgeschlagen.");
        }
      }

      showShoppingListCopyMessage("Einkaufsliste wurde kopiert.");
    } catch (error) {
      console.error(error);
      showShoppingListCopyMessage(
        "Einkaufsliste konnte nicht automatisch kopiert werden.",
      );
    }
  }

  function renderShoppingListEditForm(item) {
    const title = getShoppingListItemTitle(item);

    return (
      <li key={item.id} className="shopping-list-item shopping-list-item-edit">
        <div className="shopping-list-edit-form">
          <h3>{title} bearbeiten</h3>

          {!item.product_id && (
            <label>
              Artikelname
              <input
                type="text"
                value={editState.customName}
                onChange={(event) =>
                  updateEditState("customName", event.target.value)
                }
              />
            </label>
          )}

          {item.product_id && (
            <p className="muted">
              Produktbezogene Einträge behalten den Produktnamen. Menge,
              Einheit, Kategorie, Priorität und Notiz können geändert werden.
            </p>
          )}

          <div className="shopping-list-form-grid">
            <label>
              Menge
              <input
                type="number"
                min="0"
                step="0.01"
                value={editState.quantity}
                onChange={(event) =>
                  updateEditState("quantity", event.target.value)
                }
              />
            </label>

            <label>
              Einheit
              <input
                type="text"
                list="shopping-list-unit-suggestions"
                value={editState.unit}
                onChange={(event) =>
                  updateEditState("unit", event.target.value)
                }
              />
            </label>
          </div>

          <div className="shopping-list-form-grid">
            <label>
              Kategorie
              <input
                type="text"
                list="shopping-list-category-suggestions"
                value={editState.category}
                onChange={(event) =>
                  updateEditState("category", event.target.value)
                }
              />
            </label>

            <label>
              Priorität
              <select
                value={editState.priority}
                onChange={(event) =>
                  updateEditState("priority", event.target.value)
                }
              >
                {shoppingListPriorityOptions.map((priorityOption) => (
                  <option
                    key={priorityOption.value}
                    value={priorityOption.value}
                  >
                    {priorityOption.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Notiz
            <textarea
              rows="3"
              value={editState.note}
              onChange={(event) => updateEditState("note", event.target.value)}
              placeholder="z. B. nur wenn im Angebot"
            />
          </label>

          <label className="shopping-list-checkbox-label">
            <input
              type="checkbox"
              checked={editState.isForeignPurchase}
              onChange={(event) =>
                updateEditState("isForeignPurchase", event.target.checked)
              }
            />
            Auslandseinkauf
          </label>

          <div className="shopping-list-item-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => saveEditShoppingListItem(item)}
              disabled={savingShoppingListItem}
            >
              Speichern
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={cancelEditShoppingListItem}
              disabled={savingShoppingListItem}
            >
              Abbrechen
            </button>
          </div>
        </div>
      </li>
    );
  }

  function renderShoppingListItem(item) {
    if (editingShoppingListItemId === item.id) {
      return renderShoppingListEditForm(item);
    }

    const title = getShoppingListItemTitle(item);
    const quantityText = formatShoppingListQuantity(item);

    return (
      <li
        key={item.id}
        className={`shopping-list-item ${
          item.status === "completed" ? "shopping-list-item-completed" : ""
        }`}
      >
        <div className="shopping-list-item-main">
          <h3>{title}</h3>

          <div className="shopping-list-item-meta">
            {quantityText && <span>{quantityText}</span>}
            {item.category && <span>{item.category}</span>}
            {item.is_foreign_purchase === 1 && (
              <span className="shopping-list-foreign-purchase">Ausland</span>
            )}
            {item.priority && (
              <span
                className={
                  item.priority === "hoch"
                    ? "shopping-list-item-priority-high"
                    : item.priority === "niedrig"
                      ? "shopping-list-item-priority-low"
                      : ""
                }
              >
                Priorität: {item.priority}
              </span>
            )}
          </div>

          {item.note && <p className="shopping-list-note">{item.note}</p>}
        </div>

        <div className="shopping-list-item-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => startEditShoppingListItem(item)}
            disabled={savingShoppingListItem}
          >
            Bearbeiten
          </button>

          {item.status === "open" ? (
            <button
              type="button"
              className="secondary-button shopping-list-primary-action"
              onClick={() => onCompleteShoppingListItem(item.id)}
              disabled={savingShoppingListItem}
            >
              Erledigt
            </button>
          ) : (
            <button
              type="button"
              className="secondary-button"
              onClick={() => onReopenShoppingListItem(item.id)}
              disabled={savingShoppingListItem}
            >
              Wieder öffnen
            </button>
          )}

          <button
            type="button"
            className="secondary-button shopping-list-secondary-danger"
            onClick={() => onDeleteShoppingListItem(item.id)}
            disabled={savingShoppingListItem}
          >
            Löschen
          </button>
        </div>
      </li>
    );
  }

  return (
    <section className="card shopping-list-section">
      <datalist id="shopping-list-category-suggestions">
        {shoppingListCategorySuggestionOptions.map((categorySuggestion) => (
          <option
            key={categorySuggestion.value}
            value={categorySuggestion.value}
          />
        ))}
      </datalist>
      <datalist id="shopping-list-unit-suggestions">
        {quantityUnitOptions.map((unitOption) => (
          <option key={unitOption.value} value={unitOption.value} />
        ))}
      </datalist>
      <div className="section-header">
        <div>
          <h2>Einkaufsliste</h2>
          <p>
            Erste Grundansicht für offene und erledigte Einkaufslisteneinträge.
          </p>
        </div>
      </div>

      <form className="shopping-list-form" onSubmit={handleSubmit}>
        <div className="form-title-row">
          <h3>Freien Artikel hinzufügen</h3>
        </div>

        <label>
          Artikelname
          <input
            type="text"
            value={shoppingListForm.customName}
            onChange={handleShoppingListFormFieldChange("customName")}
            placeholder="z. B. Milch"
          />
        </label>

        <div className="shopping-list-form-grid">
          <label>
            Menge
            <input
              type="number"
              min="0"
              step="0.01"
              value={shoppingListForm.quantity}
              onChange={handleShoppingListFormFieldChange("quantity")}
              placeholder="z. B. 2"
            />
          </label>

          <label>
            Einheit
            <input
              type="text"
              list="shopping-list-unit-suggestions"
              value={shoppingListForm.unit}
              onChange={handleShoppingListFormFieldChange("unit")}
              placeholder="z. B. Packung"
            />
          </label>
        </div>

        <div className="shopping-list-form-grid">
          <label>
            Kategorie
            <input
              type="text"
              list="shopping-list-category-suggestions"
              value={shoppingListForm.category}
              onChange={handleShoppingListFormFieldChange("category")}
              placeholder="z. B. Kühlware"
            />
          </label>

          <label>
            Priorität
            <select
              value={shoppingListForm.priority}
              onChange={handleShoppingListFormFieldChange("priority")}
            >
              {shoppingListPriorityOptions.map((priorityOption) => (
                <option key={priorityOption.value} value={priorityOption.value}>
                  {priorityOption.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Notiz
          <textarea
            rows="3"
            value={shoppingListForm.note}
            onChange={handleShoppingListFormFieldChange("note")}
            placeholder="z. B. nur wenn im Angebot"
          />
        </label>

        <label className="shopping-list-checkbox-label">
          <input
            type="checkbox"
            checked={shoppingListForm.isForeignPurchase}
            onChange={handleShoppingListFormCheckboxChange("isForeignPurchase")}
          />
          Auslandseinkauf
        </label>

        <div className="form-actions">
          <button
            type="submit"
            disabled={
              savingShoppingListItem || !shoppingListForm.customName.trim()
            }
          >
            {savingShoppingListItem ? "Speichern..." : "Zur Einkaufsliste"}
          </button>
        </div>
      </form>

      <div className="shopping-list-toolbar">
        <div>
          <h3>Offene Einträge</h3>
          <p className="muted">
            {openItems.length} offen · {completedItems.length} erledigt
          </p>
        </div>

        <div className="shopping-list-toolbar-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={copyShoppingListToClipboard}
            disabled={loadingShoppingList}
          >
            Liste kopieren
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setShowShoppingListExportText(!showShoppingListExportText)
            }
            disabled={loadingShoppingList}
          >
            {showShoppingListExportText ? "Text ausblenden" : "Text anzeigen"}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              onShowCompletedShoppingItemsChange(!showCompletedShoppingItems)
            }
          >
            {showCompletedShoppingItems
              ? "Erledigte ausblenden"
              : "Erledigte anzeigen"}
          </button>
        </div>
      </div>

      {visibleShoppingListMessage && (
        <p className="shopping-list-message">{visibleShoppingListMessage}</p>
      )}

      {showShoppingListExportText && (
        <div className="shopping-list-export-preview">
          <label>
            Exporttext
            <textarea
              readOnly
              rows="8"
              value={shoppingListExportText}
              onFocus={(event) => event.target.select()}
            />
          </label>

          <p className="muted">
            Der Text entspricht dem aktuell gewählten Filter und kann bei Bedarf
            manuell markiert und kopiert werden.
          </p>
        </div>
      )}

      <div className="shopping-list-filter-bar">
        <button
          type="button"
          className={foreignPurchaseFilter === "all" ? "active" : ""}
          onClick={() => setForeignPurchaseFilter("all")}
        >
          Alle
          <span>{allOpenItemsCount}</span>
        </button>

        <button
          type="button"
          className={foreignPurchaseFilter === "foreign" ? "active" : ""}
          onClick={() => setForeignPurchaseFilter("foreign")}
        >
          Ausland
          <span>{allForeignOpenItemsCount}</span>
        </button>

        <button
          type="button"
          className={foreignPurchaseFilter === "domestic" ? "active" : ""}
          onClick={() => setForeignPurchaseFilter("domestic")}
        >
          Normal
          <span>{allDomesticOpenItemsCount}</span>
        </button>
      </div>

      {loadingShoppingList && (
        <p className="muted">Einkaufsliste wird geladen...</p>
      )}

      {!loadingShoppingList && shoppingListItems.length === 0 && (
        <p className="muted">Noch keine Einkaufslisteneinträge vorhanden.</p>
      )}

      {!loadingShoppingList &&
        shoppingListItems.length > 0 &&
        openItems.length === 0 && (
          <p className="muted">
            Für den ausgewählten Filter sind keine offenen Einträge vorhanden.
          </p>
        )}

      {!loadingShoppingList &&
        openCategoryNames.map((categoryName) => (
          <div key={categoryName} className="shopping-list-category-group">
            <div className="shopping-list-category-header">
              <h3>{categoryName}</h3>
              <span>{openItemsByCategory[categoryName].length} Einträge</span>
            </div>

            <ul className="shopping-list-items">
              {openItemsByCategory[categoryName].map(renderShoppingListItem)}
            </ul>
          </div>
        ))}

      {!loadingShoppingList &&
        showCompletedShoppingItems &&
        completedItems.length > 0 && (
          <>
            <h3 className="shopping-list-completed-title">
              Erledigte Einträge
            </h3>

            <ul className="shopping-list-items">
              {completedItems.map(renderShoppingListItem)}
            </ul>
          </>
        )}
    </section>
  );
}
