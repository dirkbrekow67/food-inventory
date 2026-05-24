// server/src/index.js


const express = require('express');
const cors = require('cors');
const path = require('path');

const { runMigrations } = require('./migrations');
const storageRoutes = require('./routes/storageRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const historyRoutes = require('./routes/historyRoutes');
const productPhotoRoutes = require('./routes/productPhotoRoutes');

runMigrations();

const app = express();
const PORT = process.env.PORT || 3101;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'))
);



app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'food-inventory-server',
  });
});

app.use('/api/storage', storageRoutes);
app.use('/api/products/photos', productPhotoRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/history', historyRoutes);



app.listen(PORT, () => {
  console.log(`Food inventory server läuft auf http://localhost:${PORT}`);
});