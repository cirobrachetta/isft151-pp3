const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('../db/connection').getDB();
require('./utils/initSuperAdmin').initSuperadmin();

const userRoutes = require('./rest/UserRestController');
const cashMovementRoutes = require("./rest/CashMovementRestController");
const DebtRestController = require("./rest/DebtRestController");
const PaymentRestController = require("./rest/PaymentRestController");
const orgRoutes = require('./rest/OrganizationRestController');
const roleRoutes = require('./rest/RoleRestController');
const productRoutes = require('./rest/ProductRestController');
const eventRoutes = require('./rest/EventRestController');

const app = express();
const PORT = process.env.PORT || 4000;
const path = require('path');
const fs = require('fs');

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/organizations', orgRoutes);
app.use('/roles', roleRoutes);
app.use('/products', productRoutes);
app.use('/events', eventRoutes);

app.use("/api/tesoreria/movimientos", cashMovementRoutes);
app.use("/api/tesoreria/debts", DebtRestController);
app.use("/api/tesoreria/payments", PaymentRestController);

app.get('/health', (_req, res) => res.send('OK'));
app.get('/', (_req, res) => res.send('Backend Tres 3 Dos - API running'));

// Serve frontend static files (if built) and provide SPA fallback for non-API routes
try {
  const clientDir = path.join(__dirname, '../frontend/dist'); // Vite default
  if (fs.existsSync(clientDir)) {
    app.use(express.static(clientDir));
    app.get('*', (req, res) => {
      // avoid intercepting API calls and backend routes
      if (req.path.startsWith('/api') || req.path.startsWith('/users') || req.path.startsWith('/organizations') || req.path.startsWith('/roles') || req.path.startsWith('/products') || req.path.startsWith('/health')) {
        return res.status(404).end();
      }
      res.sendFile(path.join(clientDir, 'index.html'));
    });
    console.log('Serving frontend static files from', clientDir);
  }
} catch (e) {
  console.warn('Could not setup frontend static serving:', e && e.message);
}

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});