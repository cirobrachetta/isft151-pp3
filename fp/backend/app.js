// Punto de entrada principal del backend
// Configura Express y monta las rutas de usuarios

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Importa el controlador de usuarios
const userController = require("./userController");

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors()); // permite peticiones desde el frontend (React)
app.use(bodyParser.json()); // parsea JSON en request body

// Rutas
app.use("/users", userController);

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("Backend Tres 3 Dos - API running");
});

// Inicia servidor
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
