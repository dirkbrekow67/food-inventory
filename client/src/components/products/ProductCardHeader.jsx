// client/src/components/products/ProductCardHeader.jsx

export function ProductCardHeader({ product }) {
  return (
    <div className="product-card-header">
      <div>
        <h3>{product.name}</h3>
        <p className="muted">
          {[product.brand, product.category].filter(Boolean).join(" · ")}
        </p>
      </div>

      {product.favorite === 1 && <span className="favorite">★</span>}
    </div>
  );
}
