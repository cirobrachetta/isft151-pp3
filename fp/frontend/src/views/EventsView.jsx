import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventController } from "../controllers/EventController.js";
import "../../styles/InventoryView.scss"; 
import BackButton from "../components/BackButton";

export default function EventsView() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    name: "",
    date: "",
    ticketPrice: 0,
  });
  const [editing, setEditing] = useState(null);
  const [showInactive, setShowInactive] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    const data = await EventController.list();
    setEvents(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await EventController.update(editing, form);
      setEditing(null);
    } else {
      await EventController.create(form);
    }
    setForm({ name: "", date: "", ticketPrice: 0 });
    load();
  };

  const handleDeactivate = async (id, active) => {
    if (!window.confirm(active ? "¿Desactivar este evento?" : "¿Reactivar este evento?")) return;
    await EventController.deactivate(id, active);
    load();
  };

  const visibleEvents = showInactive ? events : events.filter((e) => e.active);

  return (
    <div className="inventoryContainer">
      <h1>Gestión de Eventos</h1>
      <p className="subtitle">
        Creación, administración y control de eventos con venta de entradas.
      </p>

      <div className="formCard">
        <h2>{editing ? "Editar evento" : "Agregar nuevo evento"}</h2>
        <form className="inventoryForm" onSubmit={handleSubmit}>
          <div className="formRow">
            <label>Nombre del evento:</label>
            <input
              placeholder="Ej: Festival Cultural"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="formRow">
            <label>Fecha:</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="formRow">
            <label>Precio del ticket ($):</label>
            <input
              type="number"
              min="0"
              value={form.ticketPrice}
              onChange={(e) =>
                setForm({ ...form, ticketPrice: parseFloat(e.target.value) })
              }
            />
          </div>

          <button type="submit">
            {editing ? "Guardar cambios" : "Agregar evento"}
          </button>

          {editing && (
            <button
              type="button"
              className="cancelBtn"
              onClick={() => {
                setEditing(null);
                setForm({ name: "", date: "", ticketPrice: 0 });
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="inventoryHeader">
        <h2 className="tableTitle">Lista de eventos</h2>
        <button
          className="toggleInactiveBtn"
          onClick={() => setShowInactive(!showInactive)}
        >
          {showInactive ? "Ocultar inactivos" : "Mostrar inactivos"}
        </button>
      </div>

      <table className="inventoryTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Evento</th>
            <th>Fecha</th>
            <th>Precio Ticket</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visibleEvents.length === 0 ? (
            <tr>
              <td colSpan="5" className="noData">
                No hay eventos registrados
              </td>
            </tr>
          ) : (
            visibleEvents.map((e) => (
              <tr key={e.id} className={!e.active ? "inactive" : ""}>
                <td>{e.id}</td>
                <td>{e.name}</td>
                <td>{e.date}</td>
                <td>${e.ticket_price ?? e.ticketPrice}</td>
                <td>
                  {e.active ? (
                    <>
                      <button
                        onClick={() => {
                          setEditing(e.id);
                          setForm({
                            name: e.name,
                            date: e.date,
                            ticketPrice: e.ticket_price ?? e.ticketPrice,
                          });
                        }}
                      >
                        Editar
                      </button>
                      <button onClick={() => handleDeactivate(e.id, true)}>
                        Desactivar
                      </button>
                      <button
                        onClick={() => navigate(`/events/${e.id}/detail`)}
                      >
                        Ver detalle
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleDeactivate(e.id, false)}>
                      Reactivar
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <BackButton label="← Volver al dashboard" to="/dashboard" />
    </div>
  );
}