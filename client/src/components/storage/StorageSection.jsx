// client/src/components/storage/StorageSection.jsx

export function StorageSection({ storageTree, loadingStorage }) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Lagerstruktur</h2>
          <p>Standorte, Geräte und Fächer aus der SQLite-Datenbank.</p>
        </div>
      </div>

      {loadingStorage && <p className="muted">Lagerstruktur wird geladen...</p>}

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
  );
}
