import React from "react";
import { useNavigate } from "react-router-dom";
import { UserController } from "../controllers/UserController";

export default function DashboardView() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleLogout = async () => {
    await UserController.logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <h1>Bienvenido{username ? `, ${username}` : ""}</h1>
      <p>Este es tu panel principal.</p>

      <div style={styles.buttonGroup}>
        <button onClick={() => navigate("/cash")} style={styles.button}>
          Movimientos de Tesorería
        </button>
        <button onClick={() => navigate("/debts")} style={styles.button}>
          Deudas
        </button>
        <button onClick={() => navigate("/payments")} style={styles.button}>
          Pagos
        </button>
      </div>

      <button onClick={handleLogout} style={styles.button}>
        Cerrar sesión
      </button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "5rem",
  },
  button: {
    marginTop: "1rem",
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    cursor: "pointer",
  },
};