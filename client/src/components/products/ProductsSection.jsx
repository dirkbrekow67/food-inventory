// client/src/components/products/ProductsSection.jsx

import { ProductForm } from "./ProductForm";
import { ProductGrid } from "./ProductGrid";

export function ProductsSection({
  productForm,
  editingProductId,
  savingProduct,
  loadingProducts,
  products,
  historyItems,
  onSaveProduct,
  onUpdateProductForm,
  onResetProductForm,
  onEditProduct,
  onShowProductHistory,
  onDeactivateProduct,
}) {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Produkte</h2>
          <p>Produkt-Stammdaten mit Bewertung für spätere Einkäufe.</p>
        </div>
      </div>

      <ProductForm
        productForm={productForm}
        editingProductId={editingProductId}
        savingProduct={savingProduct}
        onSaveProduct={onSaveProduct}
        onUpdateProductForm={onUpdateProductForm}
        onResetProductForm={onResetProductForm}
      />

      {loadingProducts && <p className="muted">Produkte werden geladen...</p>}

      {!loadingProducts && products.length === 0 && (
        <p className="muted">Noch keine Produkte vorhanden.</p>
      )}

      <ProductGrid
        products={products}
        historyItems={historyItems}
        onEditProduct={onEditProduct}
        onShowProductHistory={onShowProductHistory}
        onDeactivateProduct={onDeactivateProduct}
      />
    </section>
  );
}
