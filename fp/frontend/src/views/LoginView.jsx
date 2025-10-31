import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserController } from "../controllers/UserController.js";
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
      const data = await UserController.login(username, password);

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.token) {
        const orgs = data.organizations || [];
        const role = (data.role || "").toLowerCase();

        localStorage.setItem("organizations", JSON.stringify(orgs));

        if (role === "administrador_general") {
          localStorage.setItem("role", data.role);
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", username);
          onLogin(data.token);
          navigate("/select-org");
          return;
        }

        if (orgs.length === 0) {
          setError("No hay organizaciones disponibles para este usuario.");
          return;
        }

        if (orgs.length === 1) {
          const org = orgs[0];
          localStorage.setItem("organization", org.name);
          localStorage.setItem("organizationId", org.id);
          onLogin(data.token);
          navigate("/dashboard");
        } else {
          navigate("/select-org");
        }
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