const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('../db/connection').getDB();
require('./utils/initSuperAdmin').initSuperadmin();

// --- simple runtime migration: ensure debts table has amount_paid column ---
const { getDB } = require('../db/connection');
const db = getDB();
try {
  const cols = db.prepare("PRAGMA table_info('debts')").all();
  const hasAmountPaid = cols.some(c => c.name === 'amount_paid');
  if (!hasAmountPaid) {
    console.log('Adding amount_paid column to debts table');
    db.exec("ALTER TABLE debts ADD COLUMN amount_paid NUMERIC NOT NULL DEFAULT 0;");
  }
} catch (err) {
  console.warn('Could not run debts migration:', err.message);
}

// --- runtime migration: ensure organizations table has budget column ---
try {
  const colsOrg = db.prepare("PRAGMA table_info('organizations')").all();
  const hasBudget = colsOrg.some(c => c.name === 'budget');
  if (!hasBudget) {
    console.log('Adding budget column to organizations table');
    db.exec("ALTER TABLE organizations ADD COLUMN budget NUMERIC NOT NULL DEFAULT 0;");
  }
} catch (err) {
  console.warn('Could not run organizations migration:', err.message);
}

// ensure payments.applied_to_budget exists
try {
  const colsPay = db.prepare("PRAGMA table_info('payments')").all();
  const hasApplied = colsPay.some(c => c.name === 'applied_to_budget');
  if (!hasApplied) {
    console.log('Adding applied_to_budget column to payments table');
    db.exec("ALTER TABLE payments ADD COLUMN applied_to_budget INTEGER NOT NULL DEFAULT 0;");
  }
} catch (err) {
  console.warn('Could not run payments migration:', err.message);
}

// Recompute budgets from cash_movements log at startup
try {
  const CashMovementDAO = require('./dao/CashMovementDAO');
  const res = CashMovementDAO.recomputeBudget();
  if (res) console.log('Recomputed organization budget at startup:', res);
} catch (e) {
  console.warn('Could not recompute organization budget at startup:', e && e.message);
}

const userRoutes = require('./rest/UserRestController');
const cashMovementRoutes = require("./rest/CashMovementRestController");
const DebtRestController = require("./rest/DebtRestController");
const PaymentRestController = require("./rest/PaymentRestController");
const orgRoutes = require('./rest/OrganizationRestController');
const roleRoutes = require('./rest/RoleRestController');
const productRoutes = require('./rest/ProductRestController');

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