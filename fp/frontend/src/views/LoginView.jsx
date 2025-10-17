import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserController } from "../controllers/UserController";
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
      const result = await UserController.login(username, password);
      if (result.token) {
        localStorage.setItem("username", username);
        onLogin(result.token);
        navigate("/dashboard");
      } else {
        setError("Credenciales inválidas.");
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
          <input placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
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
