import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserController } from "../controllers/UserController";
import "../../styles/LoginView.scss";

export default function LoginView({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // para logo
  /* useEffect(() => {
    fetch("/api/public/site/getImage")
      .then((response) => {
        if (!response.ok) throw new Error("Error fetching logo");
        return response.blob();
      })
      .then((blob) => {
        setLogoUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        //setLogoUrl("/imgs/default-logo.png");
      });
  }, []); */

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
        setError("Inicio de sesión exitoso ✅");

        setTimeout(() => navigate("/dashboard"), 1000);
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
        <p>Inicie sesión para continuar</p>

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

          <p className="registerText">
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
          {error && <p className="errorText">{error}</p>}
        </form>
      </div>
    </div>
  );
}