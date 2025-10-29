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
    <div className="dashboardContainer">
    <div className="topBar">
      <div className="userRoleBox">
        <span>Rol:</span>
        <strong>{role || "Sin rol"}</strong>
      </div>
    </div>

    {/* Contenido central */}
    <div className="dashboardMain">
      <h1>Sistema {organization || "Tres 3 Dos"}</h1>
      <h2>
        Bienvenido{username ? `, ${username}` : ""}{" "}
        {organization ? `(${organization})` : ""}
      </h2>

      <p>Seleccione un módulo para continuar:</p>

      <div className="dashboardGrid">
        {sections.map((s) => (
          <button
            key={s.path}
            className="dashboardButton"
            onClick={() => navigate(s.path)}
          >
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
        Cerrar sesión
      </button>
    </div>
  </div>

  );
}