// server/src/routes/productPhotoRoutes.js

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const PRODUCT_UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'products');

function ensureProductUploadDirExists() {
  fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });
}

function parseImageDataUrl(imageDataUrl) {
  const match = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i.exec(
    imageDataUrl || ''
  );

  if (!match) {
    throw new Error('Ungültiges Bildformat.');
  }

  const rawExtension = match[1].toLowerCase();
  const extension = rawExtension === 'jpeg' ? 'jpg' : rawExtension;
  const buffer = Buffer.from(match[2], 'base64');

  return {
    extension,
    buffer,
  };
}

function createSafePhotoFilename({ productId, side, extension }) {
  const safeProductId = String(productId || 'new').replace(/[^a-z0-9_-]/gi, '');
  const safeSide = side === 'back' ? 'back' : 'front';
  const timestamp = Date.now();

  return `product-${safeProductId}-${safeSide}-${timestamp}.${extension}`;
}

router.post('/', (req, res) => {
  try {
    const { productId = 'new', side = 'front', imageDataUrl } = req.body;

    if (!imageDataUrl) {
      return res.status(400).json({ error: 'Bilddaten fehlen.' });
    }

    ensureProductUploadDirExists();

    const { extension, buffer } = parseImageDataUrl(imageDataUrl);

    const filename = createSafePhotoFilename({
      productId,
      side,
      extension,
    });

    const absoluteFilePath = path.join(PRODUCT_UPLOAD_DIR, filename);

    fs.writeFileSync(absoluteFilePath, buffer);

    res.status(201).json({
      imagePath: `/uploads/products/${filename}`,
    });
  } catch (error) {
    console.error('Error saving product photo:', error);
    res.status(500).json({ error: 'Produktfoto konnte nicht gespeichert werden.' });
  }
});

module.exports = router;