// productDataUtils.js
export function createProductPayload(productForm) {
  return {
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
}

export function createProductFormFromProduct(product) {
  return {
    name: product.name || "",
    brand: product.brand || "",
    category: product.category || "",
    country: product.country || "",
    store: product.store || "",
    buyAgainStatus: product.buy_again_status || "neutral",
    rating: product.rating ? String(product.rating) : "",
    notes: product.notes || "",
    favorite: product.favorite === 1,
  };
}

export function updateProductListAfterSave(currentProducts, savedProduct) {
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
}

export function updateProductListAfterDeactivate(currentProducts, productId) {
  return currentProducts.filter((product) => product.id !== productId);
}