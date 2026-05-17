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
