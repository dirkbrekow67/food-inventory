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

function App() {
  const [storageTree, setStorageTree] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
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

  const [savingProduct, setSavingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setErrorMessage("");

        const [storageResponse, productsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/storage/tree`),
          fetch(`${API_BASE_URL}/products`),
        ]);

        if (!storageResponse.ok) {
          throw new Error("Lagerstruktur konnte nicht geladen werden.");
        }

        if (!productsResponse.ok) {
          throw new Error("Produkte konnten nicht geladen werden.");
        }

        const storageData = await storageResponse.json();
        const productData = await productsResponse.json();

        setStorageTree(storageData);
        setProducts(productData);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Daten konnten nicht geladen werden. Läuft der Server?",
        );
      } finally {
        setLoadingStorage(false);
        setLoadingProducts(false);
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
