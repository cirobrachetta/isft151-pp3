import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EventController } from "../controllers/EventController.js";
import BackButton from "../components/BackButton";

export default function EventDetailView() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [products, setProducts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    const { event, products, reservations } = await EventController.loadDetail(id);
    setEvent(event);
    setProducts(products);
    setReservations(reservations);
  };

  useEffect(() => { load(); }, [id]);

  const assign = async (productId, qty) => {
    if (!qty || qty <= 0) return alert("Cantidad inválida");
    await EventController.assignProduct(id, productId, qty);
    load();
  };

  const updateAssigned = async (productId, qty) => {
    if (!qty || qty <= 0) return alert("Cantidad inválida");
    await EventController.updateAssignedProduct(id, productId, qty);
    load();
  };

  const removeAssigned = async (productId) => {
    if (!window.confirm("¿Eliminar esta asignación?")) return;
    await EventController.removeAssignedProduct(id, productId);
    load();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="inventoryContainer" style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center", color: "#1a365d" }}>Detalle del evento</h1>

      {event && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h2>{event.name}</h2>
          <p><b>Fecha:</b> {event.date}</p>
          <p><b>Precio ticket:</b> ${event.ticket_price}</p>
        </div>
      )}

      {/* Productos */}
      <h2>Asignar productos</h2>
      <input
        type="text"
        placeholder="Buscar producto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "10px",
          padding: "6px",
          width: "300px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />

      <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #ddd" }}>
        <table className="inventoryTable" style={{ width: "100%" }}>
          <thead style={{ position: "sticky", top: 0, background: "#f3f4f6" }}>
            <tr>
              <th>Producto</th>
              <th>Stock disponible</th>
              <th>Cantidad a reservar</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.stock}</td>
                <td>
                  <input
                    id={`qty-${p.id}`}
                    type="number"
                    min="1"
                    max={p.stock}
                    placeholder="0"
                    style={{ width: "70px" }}
                  />
                </td>
                <td>
                  <button
                    style={{
                      backgroundColor: "#2563eb",
                      color: "#fff",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      const qty = parseInt(document.getElementById(`qty-${p.id}`).value);
                      assign(p.id, qty);
                    }}
                  >
                    Asignar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Asignados */}
      <h2 style={{ marginTop: "2rem" }}>Productos asignados</h2>
      <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #ddd" }}>
        <table className="inventoryTable" style={{ width: "100%" }}>
          <thead style={{ position: "sticky", top: 0, background: "#f3f4f6" }}>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={r.editQty ?? r.qty}
                    onChange={e => {
                      const newVal = e.target.value;
                      setReservations(prev =>
                        prev.map(x =>
                          x.id === r.id ? { ...x, editQty: newVal } : x
                        )
                      );
                    }}
                    style={{ width: "70px" }}
                  />
                </td>
                <td>
                  <button
                    onClick={() =>
                      updateAssigned(r.product_id, parseInt(r.editQty ?? r.qty))
                    }
                    style={{
                      backgroundColor: "#2563eb",
                      color: "white",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      marginRight: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => removeAssigned(r.product_id)}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón reutilizable */}
      <BackButton label="← Volver a eventos" to="/events" />
    </div>
  );
}