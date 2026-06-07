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

export function ShoppingListSection({
  shoppingListItems,
  loadingShoppingList,
  showCompletedShoppingItems,
  savingShoppingListItem,
  onShowCompletedShoppingItemsChange,
  onCreateShoppingListItem,
  onCompleteShoppingListItem,
  onReopenShoppingListItem,
  onDeleteShoppingListItem,
}) {
  const [customName, setCustomName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("normal");

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
    });

    if (!wasSaved) {
      return;
    }

    setCustomName("");
    setQuantity("");
    setUnit("");
    setCategory("");
    setPriority("normal");
  }

  function renderShoppingListItem(item) {
    const title = getShoppingListItemTitle(item);
    const quantityText = formatShoppingListQuantity(item);

    return (
      <li
        key={item.id}
        className={`shopping-list-item ${
          item.status === "completed" ? "shopping-list-item-completed" : ""
        }`}
      >
        <div>
          <h3>{title}</h3>

          <p className="muted">
            {quantityText && <span>{quantityText}</span>}
            {quantityText && item.category && <span> · </span>}
            {item.category && <span>{item.category}</span>}
            {(quantityText || item.category) && item.priority && (
              <span> · </span>
            )}
            {item.priority && <span>Priorität: {item.priority}</span>}
          </p>

          {item.note && <p>{item.note}</p>}
        </div>

        <div className="shopping-list-item-actions">
          {item.status === "open" ? (
            <button
              type="button"
              className="secondary-button"
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
            className="secondary-button danger-button"
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
