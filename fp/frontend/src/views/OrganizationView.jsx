import React, { useEffect, useState } from "react";
import { OrganizationController } from "../controllers/OrganizationController";
import "../../styles/OrganizationView.scss";

export default function OrganizationsView() {
  const [organizations, setOrganizations] = useState([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState(null);

  const loadOrganizations = async () => {
    try {
      const data = await OrganizationController.listOrganizations();
      setOrganizations(data);
    } catch (e) {
      setError("Error al cargar organizaciones: " + e.message);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Debe ingresar un nombre de organización.");
      return;
    }

    try {
      await OrganizationController.createOrganization(name, contact);
      setName("");
      setContact("");
      await loadOrganizations();
    } catch (e) {
      setError("Error al crear organización: " + e.message);
    }
  };

  return (
    <div className="organizationsContainer">
      <h2>Gestión de Organizaciones</h2>

      <form className="orgForm" onSubmit={handleSubmit}>
        <input
          placeholder="Nombre de organización"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Contacto (opcional)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <button type="submit">Crear</button>
      </form>

      {error && <p className="errorText">{error}</p>}

      <h3>Organizaciones registradas</h3>
      <ul className="orgList">
        {organizations.map((o) => (
          <li key={o.id}>
            <strong>{o.name}</strong>
            {o.contact ? <span> — {o.contact}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}