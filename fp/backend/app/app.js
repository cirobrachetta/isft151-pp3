const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('../db/connection').getDB();
require('./utils/initSuperAdmin').initSuperadmin();

const userRoutes = require('./rest/UserRestController');
const orgRoutes = require('./rest/OrganizationRestController');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/organizations', orgRoutes);

app.get('/health', (_req, res) => res.send('OK'));
app.get('/', (_req, res) => res.send('Backend Tres 3 Dos - API running'));

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});