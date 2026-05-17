import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:3101/api";

function App() {
  const [storageTree, setStorageTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadStorageTree() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(`${API_BASE_URL}/storage/tree`);

        if (!response.ok) {
          throw new Error("Lagerstruktur konnte nicht geladen werden.");
        }

        const data = await response.json();
        setStorageTree(data);
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Lagerstruktur konnte nicht geladen werden. Läuft der Server?",
        );
      } finally {
        setLoading(false);
      }
    }

    loadStorageTree();
  }, []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Food Inventory</p>
          <h1>Lebensmittel-Inventar</h1>
          <p className="subtitle">
            Verwaltung für Gefrierschrank, Kühlschrank und Vorratskammer.
          </p>
        </div>
      </header>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>Lagerstruktur</h2>
            <p>Standorte, Geräte und Fächer aus der SQLite-Datenbank.</p>
          </div>
        </div>

        {loading && <p className="muted">Lagerstruktur wird geladen...</p>}

        {errorMessage && <p className="error">{errorMessage}</p>}

        {!loading && !errorMessage && storageTree.length === 0 && (
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
