import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EventController } from "../controllers/EventController.js";
import BackButton from "../components/BackButton";
import { TransactionController } from "../controllers/TransactionController";
import { ProductController } from "../controllers/ProductController";

export default function EventDetailView() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [products, setProducts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState({ visible: false, item: null, newQty: 0 });

  // 💰 Nueva estructura para deuda pendiente
  const [pendingDebt, setPendingDebt] = useState({
    visible: false,
    items: [], // { productId, name, faltante, unitCost, subtotal }
    description: "",
  });

  const load = async () => {
    const { event, products, reservations } = await EventController.loadDetail(id);
    setEvent(event);
    setProducts(products);
    setReservations(reservations);
  };

  useEffect(() => { load(); }, [id]);

  // --- ASIGNAR PRODUCTO ---
  const assign = async (productId, qty) => {
    if (!qty || qty <= 0) return alert("Cantidad inválida");
    const product = products.find(p => p.id === productId);
    if (!product) return alert("Producto no encontrado");

    if (qty > product.stock) {
      const faltante = qty - product.stock;
      const subtotal = (product.cost || 0) * faltante;

      const confirmAdd = window.confirm(
        `Stock insuficiente (${product.stock} disponibles). ¿Desea agregar ${faltante} unidades de "${product.name}" a una deuda pendiente?`
      );
      if (!confirmAdd) return;

      setPendingDebt(prev => ({
        visible: true,
        items: [...prev.items, {
          productId: product.id,
          name: product.name,
          faltante,
          unitCost: product.cost || 0,
          subtotal
        }],
      }));

      return;
    }

    // Stock suficiente → reservar normalmente
    await EventController.assignProduct(id, productId, qty);
    load();
  };

  // --- EDITAR ASIGNACIÓN ---
  const updateAssigned = async (productId, qty) => {
    if (!qty || qty <= 0) return alert("Cantidad inválida");

    const assigned = reservations.find(r => r.product_id === productId);
    const product = products.find(p => p.id === productId);
    if (!assigned || !product) return alert("Error interno: producto no encontrado.");

    const diff = qty - assigned.qty;
    const newStock = product.stock - diff;

    if (newStock < 0) {
      const faltante = Math.abs(newStock);
      const subtotal = (product.cost || 0) * faltante;

      const confirmAdd = window.confirm(
        `Stock insuficiente (${product.stock} disponibles). ¿Desea agregar ${faltante} unidades de "${product.name}" a una deuda pendiente?`
      );
      if (!confirmAdd) return;

      setPendingDebt(prev => ({
        visible: true,
        items: [...prev.items, {
          productId: product.id,
          name: product.name,
          faltante,
          unitCost: product.cost || 0,
          subtotal
        }],
      }));

      return;
    }

    await EventController.updateAssignedProduct(id, productId, qty);
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p))
    );
    load();
  };

  // --- MODAL EDICIÓN ---
  const openEditModal = (r) => {
    const product = products.find(p => p.id === r.product_id);
    setEditModal({
      visible: true,
      item: { ...r, stock: product?.stock || 0 },
      newQty: r.qty,
    });
  };

  const handleSaveEdit = async () => {
    const { item, newQty } = editModal;
    await updateAssigned(item.product_id, parseInt(newQty));
    setEditModal({ visible: false, item: null, newQty: 0 });
  };

  // --- ELIMINAR ASIGNACIÓN ---
  const removeAssigned = async (productId) => {
    if (!window.confirm("¿Eliminar esta asignación?")) return;
    await EventController.removeAssignedProduct(id, productId);
    load();
  };

  // --- CREAR DEUDA FINAL ---
  const createDebtFromPending = async () => {
    if (pendingDebt.items.length === 0) return alert("No hay productos en la deuda.");
    const total = pendingDebt.items.reduce((sum, item) => sum + item.subtotal, 0);

    try {
      await TransactionController.createDebt({
        creditor: "Encargado de eventos",
        amount: total,
        description:
          pendingDebt.description ||
          `Compra automática de ${pendingDebt.items.length} productos por reposición de stock.`,
        due_date: new Date().toISOString().slice(0, 10),
      });

      for (const item of pendingDebt.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) continue;

        // reponer stock
        const nuevoStock = product.stock + item.faltante;
        await ProductController.updateStock(item.productId, nuevoStock);

        const totalSolicitado = product.stock + item.faltante;
        await EventController.assignProduct(id, item.productId, totalSolicitado);
      }

      alert("Stock actualizado, productos asignados y deuda creada correctamente.");
      setPendingDebt({ visible: false, items: [], description: "" });
      load();
    } catch (err) {
      console.error(err);
      alert("Error al registrar la deuda.");
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- RENDER ---
  return (
    <div className="inventoryContainer" style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center", color: "#1a365d" }}>Detalle del evento</h1>

      {event && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <h2>{event.name}</h2>
          <p><b>Fecha:</b> {event.date}</p>
          <p><b>Precio ticket:</b> ${event.ticket_price}</p>
          <button
            onClick={async () => {
              const token = localStorage.getItem("token");
              const res = await fetch(`http://localhost:4000/events/${event.id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!res.ok) {
                alert("Error generando el PDF");
                return;
              }

              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `evento_${event.id}.pdf`;
              a.click();
              a.remove();
            }}
            style={{
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            📄 Imprimir PDF
          </button>
        </div>
      )}
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
        <table style={{ width: "100%" }}>
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

      {/* Productos asignados */}
      <h2 style={{ marginTop: "2rem" }}>Productos asignados</h2>
      <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #ddd" }}>
        <table style={{ width: "100%" }}>
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
                <td>{r.qty}</td>
                <td>
                  <button
                    onClick={() => openEditModal(r)}
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
                    Editar
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

      {/* Tabla de deuda pendiente */}
      {pendingDebt.visible && (
        <div style={{ marginTop: "2rem", border: "1px solid #ddd", padding: "1rem" }}>
          <h3>Nueva deuda pendiente</h3>
          <table style={{ width: "100%", marginBottom: "1rem" }}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Faltante</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pendingDebt.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.faltante}</td>
                  <td>${item.unitCost}</td>
                  <td>${item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <label>Descripción de la deuda:</label>
          <textarea
            value={pendingDebt.description}
            onChange={(e) => setPendingDebt({ ...pendingDebt, description: e.target.value })}
            style={{ width: "100%", height: "80px", marginBottom: "10px" }}
          />

          <button
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "8px 12px",
              border: "none",
              borderRadius: "4px",
            }}
            onClick={createDebtFromPending}
          >
            solicitar deuda
          </button>
          <button
            style={{
              backgroundColor: "#9ca3af",
              color: "white",
              padding: "8px 12px",
              border: "none",
              borderRadius: "4px",
              marginLeft: "8px",
            }}
            onClick={() => setPendingDebt({ visible: false, items: [], description: "" })}
          >
            Cancelar
          </button>
        </div>
      )}

      <BackButton label="← Volver a eventos" to="/events" />

      {/* Modal */}
      {editModal.visible && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            background: "white", padding: "2rem", borderRadius: "8px",
            width: "400px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}>
            <h3>Editar asignación</h3>
            <p><b>Producto:</b> {editModal.item.name}</p>
            <p><b>Stock disponible:</b> {editModal.item.stock}</p>
            <p><b>Cantidad actual:</b> {editModal.item.qty}</p>
            <div style={{ marginTop: "1rem" }}>
              <label>Nueva cantidad:</label>
              <input
                type="number"
                value={editModal.newQty}
                min="1"
                max={editModal.item.stock + editModal.item.qty}
                onChange={e => setEditModal({ ...editModal, newQty: e.target.value })}
                style={{ width: "100%", padding: "6px", marginTop: "4px" }}
              />
            </div>
            <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "4px",
                  marginRight: "8px",
                  cursor: "pointer",
                }}
              >
                Guardar
              </button>
              <button
                onClick={() => setEditModal({ visible: false, item: null, newQty: 0 })}
                style={{
                  backgroundColor: "#9ca3af",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}