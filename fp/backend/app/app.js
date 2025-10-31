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

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});