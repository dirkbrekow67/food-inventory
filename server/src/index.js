const express = require('express');
const cors = require('cors');

const { runMigrations } = require('./migrations');
const storageRoutes = require('./routes/storageRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

runMigrations();

const app = express();
const PORT = process.env.PORT || 3101;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'food-inventory-server',
  });
});

app.use('/api/storage', storageRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);

app.listen(PORT, () => {
  console.log(`Food inventory server läuft auf http://localhost:${PORT}`);
});