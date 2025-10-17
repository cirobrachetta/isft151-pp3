import React from "react";
import { Link } from "react-router-dom";
import "../../styles/LandingPage.scss";

export default function LandingPage() {
  return (
    <div className="landingContainer">
      <h1>Bienvenido a Tres 3 Dos</h1>
      <p>Sistema de gestión integral para eventos culturales.</p>
      <Link to="/login">Iniciar sesión</Link>
      <Link to="/register">Registrarse</Link>
    </div>
  );
}