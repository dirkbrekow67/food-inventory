// client/src/components/products/ProductMeta.jsx

export function ProductMeta({ product }) {
  return (
    <div className="product-meta">
      {product.country && <span>{product.country}</span>}
      {product.store && <span>{product.store}</span>}
      {product.rating && <span>{product.rating}/5</span>}
    </div>
  );
}
