// client/src/components/shopping/ShoppingListSection.jsx

import { useState } from "react";

function getShoppingListItemTitle(item) {
  return item.product_name || item.custom_name || "Unbenannter Artikel";
}

function formatShoppingListQuantity(item) {
  const quantity = item.quantity ?? "";
  const unit = item.unit || "";

  if (!quantity && !unit) {
    return "";
  }

  return `${quantity} ${unit}`.trim();
}

function createEditStateFromItem(item) {
  return {
    customName: item.custom_name || "",
    quantity: item.quantity ?? "",
    unit: item.unit || "",
    category: item.category || "",
    priority: item.priority || "normal",
    note: item.note || "",
  };
}

export function ShoppingListSection({
  shoppingListItems,
  loadingShoppingList,
  showCompletedShoppingItems,
  savingShoppingListItem,
  onShowCompletedShoppingItemsChange,
  onCreateShoppingListItem,
  onUpdateShoppingListItem,
  onCompleteShoppingListItem,
  onReopenShoppingListItem,
  onDeleteShoppingListItem,
}) {
  const [customName, setCustomName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("normal");
  const [note, setNote] = useState("");

  const [editingShoppingListItemId, setEditingShoppingListItemId] =
    useState(null);
  const [editState, setEditState] = useState(createEditStateFromItem({}));

  const openItems = shoppingListItems.filter((item) => item.status === "open");
  const completedItems = shoppingListItems.filter(
    (item) => item.status === "completed",
  );

  async function handleSubmit(event) {
    event.preventDefault();

    const wasSaved = await onCreateShoppingListItem({
      customName,
      quantity,
      unit,
      category,
      priority,
      note,
    });

    if (!wasSaved) {
      return;
    }

    setCustomName("");
    setQuantity("");
    setUnit("");
    setCategory("");
    setPriority("normal");
    setNote("");
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
    const wasSaved = await onUpdateShoppingListItem(item.id, {
      productId: item.product_id,
      customName: editState.customName,
      quantity: editState.quantity,
      unit: editState.unit,
      category: editState.category,
      priority: editState.priority,
      note: editState.note,
      isForeignPurchase: item.is_foreign_purchase === 1,
      status: item.status,
    });

    if (!wasSaved) {
      return;
    }

    cancelEditShoppingListItem();
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
                <option value="niedrig">niedrig</option>
                <option value="normal">normal</option>
                <option value="hoch">hoch</option>
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
            >
              Erledigt
            </button>
          ) : (
            <button
              type="button"
              className="secondary-button"
              onClick={() => onReopenShoppingListItem(item.id)}
            >
              Wieder öffnen
            </button>
          )}

          <button
            type="button"
            className="secondary-button shopping-list-secondary-danger"
            onClick={() => onDeleteShoppingListItem(item.id)}
          >
            Löschen
          </button>
        </div>
      </li>
    );
  }

  return (
    <section className="card shopping-list-section">
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
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
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
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="z. B. 2"
            />
          </label>

          <label>
            Einheit
            <input
              type="text"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder="z. B. Packungen"
            />
          </label>
        </div>

        <div className="shopping-list-form-grid">
          <label>
            Kategorie
            <input
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="z. B. Kühlung"
            />
          </label>

          <label>
            Priorität
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="niedrig">niedrig</option>
              <option value="normal">normal</option>
              <option value="hoch">hoch</option>
            </select>
          </label>
        </div>

        <label>
          Notiz
          <textarea
            rows="3"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="z. B. nur wenn im Angebot"
          />
        </label>

        <div className="form-actions">
          <button
            type="submit"
            disabled={savingShoppingListItem || !customName.trim()}
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

      {loadingShoppingList && (
        <p className="muted">Einkaufsliste wird geladen...</p>
      )}

      {!loadingShoppingList && shoppingListItems.length === 0 && (
        <p className="muted">Noch keine Einkaufslisteneinträge vorhanden.</p>
      )}

      {!loadingShoppingList && openItems.length > 0 && (
        <ul className="shopping-list-items">
          {openItems.map(renderShoppingListItem)}
        </ul>
      )}

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
