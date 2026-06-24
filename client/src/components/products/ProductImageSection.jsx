// client/src/components/products/ProductImageSection.jsx

import { ProductImageField } from "./ProductImageField";

export function ProductImageSection({
  productForm,
  frontUploadInputRef,
  frontCameraInputRef,
  backUploadInputRef,
  backCameraInputRef,
  isProcessingProductImage,
  processingProductImageSide,
  onOpenFileInput,
  onImageChange,
  onRemoveImage,
}) {
  const productImageFieldConfigs = [
    {
      fieldName: "imageFront",
      side: "front",
      uploadInputRef: frontUploadInputRef,
      cameraInputRef: frontCameraInputRef,
      label: "Produktfoto Vorderseite",
      processingText: "Vorderseite wird verarbeitet...",
      imagePath: productForm.imageFront,
      altText: "Produkt Vorderseite",
      removeText: "Vorderseite entfernen",
    },
    {
      fieldName: "imageBack",
      side: "back",
      uploadInputRef: backUploadInputRef,
      cameraInputRef: backCameraInputRef,
      label: "Produktfoto Rückseite",
      processingText: "Rückseite wird verarbeitet...",
      imagePath: productForm.imageBack,
      altText: "Produkt Rückseite",
      removeText: "Rückseite entfernen",
    },
  ];

  return (
    <div className="product-image-grid">
      {productImageFieldConfigs.map((imageFieldConfig) => (
        <ProductImageField
          key={imageFieldConfig.fieldName}
          {...imageFieldConfig}
          isProcessingProductImage={isProcessingProductImage}
          processingProductImageSide={processingProductImageSide}
          onOpenFileInput={onOpenFileInput}
          onImageChange={onImageChange}
          onRemoveImage={onRemoveImage}
        />
      ))}
    </div>
  );
}
