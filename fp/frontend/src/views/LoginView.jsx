import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/LoginView.scss";

export default function LoginView({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Por favor ingrese usuario y contraseña.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      // Guardar info base en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      localStorage.setItem("role", data.role || "");

      // Si hay organizaciones (superadmin o usuario con varias)
      if (data.organizations?.length > 0) {
        localStorage.setItem("organizations", JSON.stringify(data.organizations));

        // Si solo tiene una, entra directo
        if (data.organizations.length === 1 && data.role !== "administrador_general") {
          const org = data.organizations[0];
          localStorage.setItem("organization", org.name);
          localStorage.setItem("organizationId", org.id);
          onLogin(data.token);
          navigate("/dashboard");
        } else {
          // Si es superadmin o tiene varias, mostrar selector
          navigate("/select-org");
        }
      } else {
        setError("No hay organizaciones disponibles para este usuario.");
      }
    } catch (err) {
      setError("Error al iniciar sesión: " + err.message);
    }
  };

  return (
    <div className="loginContainer">
      <div className="LoginView">
        <h2>Bienvenido</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Ingresar</button>

          {error && <p className="errorText">{error}</p>}

          <p className="registerText">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </form>
      </div>
    </div>
  );
}