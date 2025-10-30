import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrganizationSelectView() {
  const location = useLocation();
  const navigate = useNavigate();
  const organizations = location.state?.organizations || JSON.parse(localStorage.getItem("organizations") || "[]");
  const role = localStorage.getItem("role");

  const handleSelect = (org) => {
    localStorage.setItem("organizationId", org.id);
    localStorage.setItem("organization", org.name);
    navigate("/dashboard");
  };

  if (!organizations.length) {
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <h2>No se encontraron organizaciones asociadas</h2>
        <button onClick={() => navigate("/login")}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>Seleccionar organización</h1>
      <p>
        {role === "administrador_general"
          ? "Como superadmin, podés operar en cualquier organización:"
          : "Elegí una organización con la que querés trabajar:"}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        {organizations.map((org) => (
          <button
            key={org.id}
            onClick={() => handleSelect(org)}
            style={{
              padding: "1rem 2rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#f8f8f8",
              cursor: "pointer",
              fontSize: "1rem",
              minWidth: "200px",
            }}
          >
            {org.name}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "3rem" }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            background: "#ccc",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}