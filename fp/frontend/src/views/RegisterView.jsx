import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserController } from "../controllers/UserController";
import "../../styles/LoginView.scss"; // reutilizamos el mismo estilo

export default function RegisterView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!username.trim() || !password.trim()) {
      setMessage("Por favor complete todos los campos.");
      return;
    }

    try {
      const result = await UserController.register(username, password);
      setMessage(`Usuario "${result.user.username}" registrado exitosamente ✅`);

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("Error al registrar usuario: " + err.message);
    }
  };

  return (
    <div className="loginContainer">
      <div className="LoginView">
        <h2>Crear cuenta</h2>
        <p>Complete los datos para registrarse</p>

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
          <button type="submit">Registrarse</button>

          <p className="registerText">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
          {message && <p className="errorText">{message}</p>}
        </form>
      </div>
    </div>
  );
}