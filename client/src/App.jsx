import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:3101/api";

function getBuyAgainLabel(status) {
  switch (status) {
    case "wieder_kaufen":
      return "Wieder kaufen";
    case "nicht_wieder_kaufen":
      return "Nicht wieder kaufen";
    case "testen":
      return "Erst testen";
    default:
      return "Neutral";
  }
}

function getPackageStateLabel(state) {
  switch (state) {
    case "angebrochen":
      return "Angebrochen";
    case "portioniert":
      return "Portioniert";
    default:
      return "Ungeöffnet";
  }
}

function formatQuantity(item) {
  const parts = [];

  if (item.remaining_quantity && item.remaining_unit) {
    parts.push(
      `${item.quantity_estimated ? "ca. " : ""}${item.remaining_quantity} ${item.remaining_unit}`,
    );
  }

  if (
    item.remaining_fraction_numerator &&
    item.remaining_fraction_denominator
  ) {
    parts.push(
      `${item.remaining_fraction_numerator}/${item.remaining_fraction_denominator}`,
    );
  }

  if (parts.length > 0) {
    return parts.join(" · ");
  }

  if (item.original_quantity && item.original_unit) {
    return `${item.original_quantity} ${item.original_unit}`;
  }

  return "Menge nicht angegeben";
}

function App() {
  const [storageTree, setStorageTree] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    brand: "",
    category: "",
    country: "",
    store: "",
    buyAgainStatus: "neutral",
    rating: "",
    notes: "",
    favorite: false,
  });

  const [inventoryForm, setInventoryForm] = useState({
    productId: "",
    storageUnitId: "",
    storageCompartmentId: "",
    originalQuantity: "",
    originalUnit: "g",
    remainingQuantity: "",
    remainingUnit: "g",
    remainingFraction: "",
    quantityEstimated: false,
    packageState: "ungeoeffnet",
    bestBeforeDate: "",
    frozenDate: "",
    openedDate: "",
    isFrozenChilledFood: false,
    internalExtensionMonths: "6",
    notes: "",
  });

  const [savingInventoryItem, setSavingInventoryItem] = useState(false);

  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setErrorMessage("");

        const [storageResponse, productsResponse, inventoryResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/storage/tree`),
            fetch(`${API_BASE_URL}/products`),
            fetch(`${API_BASE_URL}/inventory`),
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

        const storageData = await storageResponse.json();
        const productData = await productsResponse.json();
        const inventoryData = await inventoryResponse.json();

        setStorageTree(storageData);
        setProducts(productData);
        setInventoryItems(inventoryData);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Daten konnten nicht geladen werden. Läuft der Server?",
        );
      } finally {
        setLoadingStorage(false);
        setLoadingProducts(false);
        setLoadingInventory(false);
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
    setProductForm({
      name: "",
      brand: "",
      category: "",
      country: "",
      store: "",
      buyAgainStatus: "neutral",
      rating: "",
      notes: "",
      favorite: false,
    });

    setEditingProductId(null);
  }

  function updateInventoryForm(field, value) {
    setInventoryForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function resetInventoryForm() {
    setInventoryForm({
      productId: "",
      storageUnitId: "",
      storageCompartmentId: "",
      originalQuantity: "",
      originalUnit: "g",
      remainingQuantity: "",
      remainingUnit: "g",
      remainingFraction: "",
      quantityEstimated: false,
      packageState: "ungeoeffnet",
      bestBeforeDate: "",
      frozenDate: "",
      openedDate: "",
      isFrozenChilledFood: false,
      internalExtensionMonths: "6",
      notes: "",
    });
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
          if (!a.best_before_date && b.best_before_date) return 1;
          if (a.best_before_date && !b.best_before_date) return -1;

          return String(a.best_before_date || "").localeCompare(
            String(b.best_before_date || ""),
          );
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

  async function removeInventoryItem(itemId) {
    const confirmed = window.confirm(
      "Diesen Bestandseintrag entfernen? Er wird nicht endgültig gelöscht.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");

      const response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Bestand konnte nicht entfernt werden.");
      }

      setInventoryItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId),
      );
    } catch (error) {
      console.error(error);
      setErrorMessage("Bestand konnte nicht entfernt werden.");
    }
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

              {product.notes && (
                <p className="product-notes">{product.notes}</p>
              )}
              <div className="product-actions">
                <button type="button" onClick={() => startEditProduct(product)}>
                  Bearbeiten
                </button>

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
                  updateInventoryForm("productId", event.target.value)
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

        {loadingInventory && <p className="muted">Bestand wird geladen...</p>}

        {!loadingInventory && inventoryItems.length === 0 && (
          <p className="muted">Noch kein Bestand vorhanden.</p>
        )}

        <div className="inventory-list">
          {inventoryItems.map((item) => (
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

                <span
                  className={`package-state package-state-${item.package_state}`}
                >
                  {getPackageStateLabel(item.package_state)}
                </span>
              </div>

              <div className="inventory-meta">
                <span>{item.storage_unit_name}</span>
                {item.storage_compartment_name && (
                  <span>{item.storage_compartment_name}</span>
                )}
                <span>{formatQuantity(item)}</span>
                {item.best_before_date && (
                  <span>MHD: {item.best_before_date}</span>
                )}
                {item.internal_use_until_date && (
                  <span>Intern bis: {item.internal_use_until_date}</span>
                )}
              </div>

              {item.notes && <p className="product-notes">{item.notes}</p>}

              <div className="product-actions">
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => removeInventoryItem(item.id)}
                >
                  Entfernen
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
    </main>
  );
}

export default App;
