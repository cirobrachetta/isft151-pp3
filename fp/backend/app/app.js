const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('../db/connection').getDB();

const userRoutes = require('./rest/UserRestController');
const cashMovementRoutes = require("./rest/CashMovementRestController");
const DebtRestController = require("./rest/DebtRestController");
const PaymentRestController = require("./rest/PaymentRestController");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/users', userRoutes);

app.use("/api/tesoreria/movimientos", cashMovementRoutes);
app.use("/api/debts", DebtRestController);
app.use("/api/payments", PaymentRestController);

app.get('/health', (_req, res) => res.send('OK'));
app.get('/', (_req, res) => res.send('Backend Tres 3 Dos - API running'));

app.listen(PORT || 4000, () => {
    console.log(`TEST, SERVER RUNNING ON on http://localhost:${PORT || 4000}`);
});