import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/DashboardView.scss";

export default function DashboardView() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const organization = localStorage.getItem("organization");

  const sectionsByRole = {
    administrador_general: [
      { label: "Organizaciones", path: "/organizations" },
      { label: "Usuarios", path: "/users" },
      { label: "Inventario (global)", path: "/inventory" },
      { label: "Tesorería (global)", path: "/finance" },
      { label: "Eventos (global)", path: "/events" },
    ],
    administrador: [
      { label: "Inventario", path: "/inventory" },
      { label: "Eventos y Entradas", path: "/events" },
      { label: "Usuarios", path: "/users" },
    ],
    tesorero: [
      { label: "Inventario", path: "/inventory" },
      { label: "Tesorería", path: "/finance" },
    ],
    organizador_eventos: [
      { label: "Inventario", path: "/inventory" },
      { label: "Eventos y Entradas", path: "/events" },
    ],
    miembro: [
      { label: "Inventario", path: "/inventory" },
      { label: "Eventos y Entradas", path: "/events" },
    ],
  };

  const sections = sectionsByRole[role] || [];

  return (
<<<<<<< HEAD
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
=======
    <div className="dashboardContainer">
      <h1>Sistema Tres 3 Dos</h1>
      <h2>
        Bienvenido{username ? `, ${username}` : ""}{" "}
        {organization ? `(${organization})` : ""}
      </h2>
      <p>Seleccione un módulo para continuar:</p>

      <div className="dashboardGrid">
        {sections.map((s) => (
          <button key={s.path} className="dashboardButton" onClick={() => navigate(s.path)}>
            {s.label}
          </button>
        ))}
      </div>

      <button
        className="dashboardLogout"
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
      >
>>>>>>> origin/main
        Cerrar sesión
      </button>
    </div>
  );
}