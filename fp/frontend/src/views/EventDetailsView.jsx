import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EventController } from "../controllers/EventController.js";
import BackButton from "../components/BackButton";
import { TransactionController } from "../controllers/TransactionController";
import { ProductController } from "../controllers/ProductController"; // nuevo

export default function EventDetailView() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [products, setProducts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState({ visible: false, item: null, newQty: 0 });

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

    // STOCK INSUFICIENTE → CREAR DEUDA + REABASTECER + CONSUMIR
    if (qty > product.stock) {
      const faltante = qty - product.stock;
      const confirmPurchase = window.confirm(
        `Stock insuficiente (${product.stock} disponibles). ¿Desea solicitar compra automática de ${faltante} unidades?`
      );
      if (!confirmPurchase) return;

      try {
        const estimatedAmount =
          product.unit_cost && product.unit_cost > 0
            ? product.unit_cost * faltante
            : faltante * 1;

        await TransactionController.createDebt({
          entity_type: "supplier",
          entity_id: productId,
          amount: estimatedAmount,
          description: `Compra automática de ${faltante} "${product.name}" por stock insuficiente`,
          due_date: new Date().toISOString().slice(0, 10),
        });

        // actualizar stock sumando las unidades faltantes
        const nuevoStock = product.stock + faltante;
        await ProductController.updateStock(productId, nuevoStock);

        // luego consumir las unidades (reserva)
        await EventController.assignProduct(id, productId, qty);
        alert("Stock actualizado y deuda creada correctamente en Tesorería.");
      } catch (err) {
        console.error("Error al crear deuda o actualizar stock:", err);
        alert("Error al procesar la compra automática.");
      }
      return load();
    }

    // STOCK SUFICIENTE
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

    // STOCK INSUFICIENTE → CREAR DEUDA + SUMAR STOCK + CONSUMIR
    if (newStock < 0) {
      const faltante = Math.abs(newStock);
      const confirmPurchase = window.confirm(
        `Stock insuficiente (${product.stock} disponibles). ¿Desea solicitar compra automática de ${faltante} unidades?`
      );
      if (!confirmPurchase) return;

      try {
        const organizationId = localStorage.getItem("organization");
        const estimatedAmount =
          product.unit_cost && product.unit_cost > 0
            ? product.unit_cost * faltante
            : faltante * 1;

        // 1️⃣ Crear deuda
        await TransactionController.createDebt({
          entity_type: "supplier",
          entity_id: productId,
          amount: estimatedAmount,
          description: `Compra automática de ${faltante} "${product.name}" por stock insuficiente`,
          due_date: new Date().toISOString().slice(0, 10),
          organization_id: organizationId,
        });

        // 2️⃣ Reponer inventario sumando faltante
        const nuevoStock = product.stock + faltante;
        await ProductController.updateStock(productId, nuevoStock);

        // 3️⃣ Consumir unidades (actualizar asignación)
        await EventController.updateAssignedProduct(id, productId, qty);
        alert("Stock actualizado y deuda creada correctamente en Tesorería.");
      } catch (err) {
        console.error("Error creando deuda o actualizando stock:", err);
        alert("Error al procesar la compra automática.");
      }
      return load();
    }

    // STOCK SUFICIENTE
    await EventController.updateAssignedProduct(id, productId, qty);
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p))
    );
    load();
  };

  // --- MODAL ---
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

      {/* Asignar productos */}
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

      {/* Productos asignados */}
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