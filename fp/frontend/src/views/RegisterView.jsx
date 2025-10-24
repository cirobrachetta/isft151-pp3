import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserController } from "../controllers/UserController";
import "../../styles/LoginView.scss";

export default function RegisterView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await UserController.listOrganizations();
        setOrganizations(data);
      } catch (e) {
        console.error("No se pudieron cargar organizaciones:", e.message);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!username.trim() || !password.trim() || !organizationId) {
      setMessage("Complete todos los campos y seleccione una organización.");
      return;
    }

    try {
      const result = await UserController.register(username, password, organizationId);
      setMessage(`Usuario "${result.user.username}" registrado ✅`);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("Error al registrar usuario: " + err.message);
    }
  };

  return (
    <div className="loginContainer">
      <div className="LoginView">
        <h2>Crear cuenta</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          <select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
            <option value="">Seleccione una organización</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <button type="submit">Registrarse</button>
          {message && <p className="errorText">{message}</p>}
          <p className="registerText">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}