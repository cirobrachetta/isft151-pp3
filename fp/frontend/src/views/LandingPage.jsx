import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div>
      <h1>Bienvenido</h1>
      <Link to="/login">Iniciar sesión</Link>
      <br />
      <Link to="/register">Registrarse</Link>
    </div>
  );
}