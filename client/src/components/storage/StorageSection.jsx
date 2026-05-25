// client/src/components/storage/StorageSection.jsx

import { useState } from "react";
import {
  createStorageLocation,
  createStorageUnit,
  generateStorageCompartments,
} from "../../api/inventoryApi";

const storageUnitTypes = [
  "Gefrierschrank",
  "Kühlschrank",
  "Regal",
  "Schrank",
  "Box",
  "Sonstiges",
];

const compartmentTypes = [
  "Schublade",
  "Fach",
  "Regalboden",
  "Türfach",
  "Gemüsefach",
  "Box",
  "Sonstiges",
];

function getStorageUnits(storageTree) {
  return storageTree.flatMap((location) =>
    location.units.map((unit) => ({
      ...unit,
      locationName: location.name,
    })),
  );
}

export function StorageSection({
  storageTree,
  loadingStorage,
  onReloadStorage,
}) {
  const [newLocationName, setNewLocationName] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [newUnitForm, setNewUnitForm] = useState({
    locationId: "",
    identifier: "",
    type: "Gefrierschrank",
  });
  const [savingUnit, setSavingUnit] = useState(false);
  const [unitError, setUnitError] = useState("");

  const [newCompartmentForm, setNewCompartmentForm] = useState({
    unitId: "",
    type: "Schublade",
    prefix: "Schublade",
    count: "1",
    startAt: "1",
  });
  const [savingCompartments, setSavingCompartments] = useState(false);
  const [compartmentError, setCompartmentError] = useState("");

  const storageUnits = getStorageUnits(storageTree);

  async function handleCreateLocation(event) {
    event.preventDefault();

    const trimmedName = newLocationName.trim();

    if (!trimmedName) {
      setLocationError("Bitte einen Standortnamen eingeben.");
      return;
    }

    try {
      setSavingLocation(true);
      setLocationError("");

      await createStorageLocation(trimmedName);

      setNewLocationName("");

      if (typeof onReloadStorage === "function") {
        await onReloadStorage();
      }
    } catch (error) {
      console.error(error);
      setLocationError(
        error.message || "Standort konnte nicht gespeichert werden.",
      );
    } finally {
      setSavingLocation(false);
    }
  }

  function updateNewUnitForm(field, value) {
    setNewUnitForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleCreateUnit(event) {
    event.preventDefault();

    const selectedLocation = storageTree.find(
      (location) => String(location.id) === String(newUnitForm.locationId),
    );

    const trimmedIdentifier = newUnitForm.identifier.trim();

    if (!newUnitForm.locationId || !selectedLocation || !newUnitForm.type) {
      setUnitError("Bitte Standort und Gerätetyp auswählen.");
      return;
    }

    const generatedUnitName = trimmedIdentifier
      ? `${newUnitForm.type} ${trimmedIdentifier} ${selectedLocation.name}`
      : `${newUnitForm.type} ${selectedLocation.name}`;

    try {
      setSavingUnit(true);
      setUnitError("");

      await createStorageUnit({
        locationId: newUnitForm.locationId,
        name: generatedUnitName,
        type: newUnitForm.type,
      });

      setNewUnitForm({
        locationId: newUnitForm.locationId,
        identifier: "",
        type: newUnitForm.type,
      });

      if (typeof onReloadStorage === "function") {
        await onReloadStorage();
      }
    } catch (error) {
      console.error(error);
      setUnitError(
        error.message || "Lagergerät konnte nicht gespeichert werden.",
      );
    } finally {
      setSavingUnit(false);
    }
  }

  function updateNewCompartmentForm(field, value) {
    setNewCompartmentForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleGenerateCompartments(event) {
    event.preventDefault();

    if (
      !newCompartmentForm.unitId ||
      !newCompartmentForm.type ||
      !newCompartmentForm.prefix ||
      !newCompartmentForm.count
    ) {
      setCompartmentError(
        "Bitte Lagergerät, Fachtyp, Bezeichnung und Anzahl ausfüllen.",
      );
      return;
    }

    try {
      setSavingCompartments(true);
      setCompartmentError("");

      await generateStorageCompartments(newCompartmentForm.unitId, {
        type: newCompartmentForm.type,
        prefix: newCompartmentForm.prefix,
        count: Number(newCompartmentForm.count),
        startAt: Number(newCompartmentForm.startAt || 1),
      });

      setNewCompartmentForm((currentForm) => ({
        ...currentForm,
        count: "1",
        startAt: "1",
      }));

      if (typeof onReloadStorage === "function") {
        await onReloadStorage();
      }
    } catch (error) {
      console.error(error);
      setCompartmentError(
        error.message || "Fächer konnten nicht gespeichert werden.",
      );
    } finally {
      setSavingCompartments(false);
    }
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Lagerstruktur</h2>
          <p>Standorte, Geräte und Fächer aus der SQLite-Datenbank.</p>
        </div>
      </div>

      <div className="storage-management-grid">
        <form className="storage-location-form" onSubmit={handleCreateLocation}>
          <div className="form-field">
            <label htmlFor="new-storage-location">Neuen Standort anlegen</label>

            <input
              id="new-storage-location"
              type="text"
              value={newLocationName}
              onChange={(event) => setNewLocationName(event.target.value)}
              placeholder="z. B. Küche, Wohnzimmer, Vorratskammer"
            />
          </div>

          <button type="submit" disabled={savingLocation}>
            {savingLocation ? "Speichern..." : "Standort speichern"}
          </button>

          {locationError ? <p className="form-error">{locationError}</p> : null}
        </form>

        <form className="storage-unit-form" onSubmit={handleCreateUnit}>
          <div className="form-field">
            <label htmlFor="new-storage-unit-location">
              Standort auswählen
            </label>

            <select
              id="new-storage-unit-location"
              value={newUnitForm.locationId}
              onChange={(event) =>
                updateNewUnitForm("locationId", event.target.value)
              }
              disabled={storageTree.length === 0}
            >
              <option value="">Bitte auswählen</option>
              {storageTree.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="new-storage-unit-identifier">
              Kennung / Zusatz optional
            </label>

            <input
              id="new-storage-unit-identifier"
              type="text"
              value={newUnitForm.identifier}
              onChange={(event) =>
                updateNewUnitForm("identifier", event.target.value)
              }
              placeholder="z. B. 1, 2, Bosch, links"
              disabled={storageTree.length === 0}
            />
          </div>

          <div className="form-field">
            <label htmlFor="new-storage-unit-type">Gerätetyp</label>

            <select
              id="new-storage-unit-type"
              value={newUnitForm.type}
              onChange={(event) =>
                updateNewUnitForm("type", event.target.value)
              }
              disabled={storageTree.length === 0}
            >
              {storageUnitTypes.map((unitType) => (
                <option key={unitType} value={unitType}>
                  {unitType}
                </option>
              ))}
            </select>
          </div>

          {newUnitForm.locationId ? (
            <p className="muted">
              Name wird automatisch gebildet:{" "}
              <strong>
                {(() => {
                  const selectedLocation = storageTree.find(
                    (location) =>
                      String(location.id) === String(newUnitForm.locationId),
                  );

                  if (!selectedLocation) {
                    return "";
                  }

                  const trimmedIdentifier = newUnitForm.identifier.trim();

                  return trimmedIdentifier
                    ? `${newUnitForm.type} ${trimmedIdentifier} ${selectedLocation.name}`
                    : `${newUnitForm.type} ${selectedLocation.name}`;
                })()}
              </strong>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={savingUnit || storageTree.length === 0}
          >
            {savingUnit ? "Speichern..." : "Lagergerät speichern"}
          </button>

          {storageTree.length === 0 ? (
            <p className="muted">
              Zuerst muss mindestens ein Standort angelegt werden.
            </p>
          ) : null}

          {unitError ? <p className="form-error">{unitError}</p> : null}
        </form>

        <form
          className="storage-compartment-form"
          onSubmit={handleGenerateCompartments}
        >
          <div className="form-field">
            <label htmlFor="new-storage-compartment-unit">
              Lagergerät auswählen
            </label>

            <select
              id="new-storage-compartment-unit"
              value={newCompartmentForm.unitId}
              onChange={(event) =>
                updateNewCompartmentForm("unitId", event.target.value)
              }
              disabled={storageUnits.length === 0}
            >
              <option value="">Bitte auswählen</option>
              {storageUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.locationName} → {unit.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="new-storage-compartment-type">Fachtyp</label>

            <select
              id="new-storage-compartment-type"
              value={newCompartmentForm.type}
              onChange={(event) => {
                updateNewCompartmentForm("type", event.target.value);
                updateNewCompartmentForm("prefix", event.target.value);
              }}
              disabled={storageUnits.length === 0}
            >
              {compartmentTypes.map((compartmentType) => (
                <option key={compartmentType} value={compartmentType}>
                  {compartmentType}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="new-storage-compartment-prefix">Bezeichnung</label>

            <input
              id="new-storage-compartment-prefix"
              type="text"
              value={newCompartmentForm.prefix}
              onChange={(event) =>
                updateNewCompartmentForm("prefix", event.target.value)
              }
              placeholder="z. B. Schublade, Fach, Regalboden"
              disabled={storageUnits.length === 0}
            />
          </div>

          <div className="form-field">
            <label htmlFor="new-storage-compartment-count">Anzahl</label>

            <input
              id="new-storage-compartment-count"
              type="number"
              min="1"
              max="50"
              value={newCompartmentForm.count}
              onChange={(event) =>
                updateNewCompartmentForm("count", event.target.value)
              }
              disabled={storageUnits.length === 0}
            />
          </div>

          <div className="form-field">
            <label htmlFor="new-storage-compartment-start-at">
              Startnummer
            </label>

            <input
              id="new-storage-compartment-start-at"
              type="number"
              min="1"
              value={newCompartmentForm.startAt}
              onChange={(event) =>
                updateNewCompartmentForm("startAt", event.target.value)
              }
              disabled={storageUnits.length === 0}
            />
          </div>

          {newCompartmentForm.unitId ? (
            <p className="muted">
              Es werden z. B. erzeugt:{" "}
              <strong>
                {newCompartmentForm.prefix || newCompartmentForm.type}{" "}
                {newCompartmentForm.startAt || 1}
              </strong>
              {Number(newCompartmentForm.count) > 1 ? (
                <>
                  {" "}
                  bis{" "}
                  <strong>
                    {newCompartmentForm.prefix || newCompartmentForm.type}{" "}
                    {Number(newCompartmentForm.startAt || 1) +
                      Number(newCompartmentForm.count || 1) -
                      1}
                  </strong>
                </>
              ) : null}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={savingCompartments || storageUnits.length === 0}
          >
            {savingCompartments ? "Speichern..." : "Fächer erzeugen"}
          </button>

          {storageUnits.length === 0 ? (
            <p className="muted">
              Zuerst muss mindestens ein Lagergerät angelegt werden.
            </p>
          ) : null}

          {compartmentError ? (
            <p className="form-error">{compartmentError}</p>
          ) : null}
        </form>
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

            {location.units.length === 0 ? (
              <p className="muted">Noch keine Lagergeräte angelegt.</p>
            ) : null}

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

                  {unit.compartments.length === 0 ? (
                    <p className="muted">Noch keine Fächer angelegt.</p>
                  ) : null}

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
