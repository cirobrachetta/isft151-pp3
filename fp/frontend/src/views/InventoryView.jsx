import React, { useEffect, useState } from "react";
import { ProductController } from "../controllers/ProductController.js";
import { TransactionController } from "../controllers/TransactionController";
import "../../styles/InventoryView.scss";
import BackButton from "../components/BackButton";

export default function InventoryView() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    cost: 0,
    price: 0,
    stock: 0,
    minStock: 0,
  });
  const [editing, setEditing] = useState(null);
  const [originalStock, setOriginalStock] = useState(0);
  const [showInactive, setShowInactive] = useState(true);

  // 💰 Deuda pendiente acumulativa
  const [pendingDebt, setPendingDebt] = useState({
    visible: false,
    items: [], // { productId, name, qty, unitCost, subtotal }
    description: "",
  });

  const load = async () => {
    const data = await ProductController.list();
    setProducts(data);
  };

  useEffect(() => {
    load();
  }, []);

  // --- CRUD productos ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const delta = editing ? form.stock - originalStock : form.stock;

    let productData;
    if (editing) {
      productData = await ProductController.update(editing, form);
      setEditing(null);
    } else {
      productData = await ProductController.create(form);
    }

    // Solo agregar a deuda si el stock sube
    if (delta > 0) {
      const subtotal = (form.cost || 0) * delta;
      setPendingDebt(prev => ({
        visible: true,
        items: [
          ...prev.items.filter(i => i.productId !== (editing || productData.id)),
          {
            productId: editing || productData.id,
            name: form.name,
            qty: delta,
            unitCost: form.cost || 0,
            subtotal,
          },
        ],
      }));
    }

    setForm({ name: "", cost: 0, price: 0, stock: 0, minStock: 0 });
    load();
  };

  const handleDeactivate = async (id, active) => {
    if (!window.confirm(active ? "¿Desactivar este producto?" : "¿Reactivar este producto?")) return;
    await ProductController.deactivate(id, active);
    load();
  };

  const visibleProducts = showInactive
    ? products
    : products.filter((p) => p.active);

  // --- Reposición manual ---
  const addProductToDebt = (p, qty) => {
    if (!qty || qty <= 0) return alert("Cantidad inválida");
    const subtotal = (p.cost || 0) * qty;

    setPendingDebt(prev => ({
      visible: true,
      items: [
        ...prev.items.filter(i => i.productId !== p.id),
        { productId: p.id, name: p.name, qty, unitCost: p.cost || 0, subtotal },
      ],
    }));
  };

  const createDebt = async () => {
    if (pendingDebt.items.length === 0) return alert("No hay productos en la deuda.");
    const total = pendingDebt.items.reduce((sum, i) => sum + i.subtotal, 0);
    const desc =
      pendingDebt.description?.trim() ||
      `Compra de ${pendingDebt.items.length} productos para reposición de stock.`;

    try {
      await TransactionController.createDebt({
        creditor: "Encargado de inventario",
        amount: total,
        description: desc,
        due_date: new Date().toISOString().slice(0, 10),
      });
      alert("Deuda creada correctamente en Tesorería.");
      setPendingDebt({ visible: false, items: [], description: "" });
    } catch (err) {
      console.error(err);
      alert("Error al crear la deuda.");
    }
  };

  return (
    <div className="inventoryContainer">
      <h1>Gestión de Inventario</h1>
      <p className="subtitle">
        Registro de productos, control de stock y reposiciones.
      </p>

      {/* Formulario alta/edición */}
      <div className="formCard">
        <h2>{editing ? "Editar producto" : "Agregar nuevo producto"}</h2>
        <form className="inventoryForm" onSubmit={handleSubmit}>
          <div className="formRow">
            <label>Nombre del producto:</label>
            <input
              placeholder="Ej: Papas Fritas"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="formRow">
            <label>Costo unitario ($):</label>
            <input
              type="number"
              min="0"
              value={form.cost}
              onChange={(e) =>
                setForm({ ...form, cost: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="formRow">
            <label>Precio de venta ($):</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="formRow">
            <label>Stock actual:</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="formRow">
            <label>Stock mínimo:</label>
            <input
              type="number"
              min="0"
              value={form.minStock}
              onChange={(e) =>
                setForm({ ...form, minStock: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <button type="submit">
            {editing ? "Guardar cambios" : "Agregar producto"}
          </button>

          {editing && (
            <button
              type="button"
              className="cancelBtn"
              onClick={() => {
                setEditing(null);
                setForm({ name: "", cost: 0, price: 0, stock: 0, minStock: 0 });
              }}
            >
              Cancelar
            </button>
          )}
        </form>
      </div>

      {/* Lista de productos */}
      <div className="inventoryHeader">
        <h2 className="tableTitle">Lista de productos</h2>
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
            <th>Nombre</th>
            <th>Costo</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Mínimo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visibleProducts.length === 0 ? (
            <tr>
              <td colSpan="7" className="noData">No hay productos registrados</td>
            </tr>
          ) : (
            visibleProducts.map((p) => (
              <tr
                key={p.id}
                className={`${p.stock <= p.min_stock ? "lowStock" : ""} ${!p.active ? "inactive" : ""}`}
              >
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>${p.cost}</td>
                <td>${p.price}</td>
                <td>{p.stock}</td>
                <td>{p.min_stock}</td>
                <td>
                  {p.active ? (
                    <>
                      <button
                        onClick={() => {
                          setEditing(p.id);
                          setOriginalStock(p.stock);
                          setForm({
                            name: p.name,
                            cost: p.cost,
                            price: p.price,
                            stock: p.stock,
                            minStock: p.min_stock,
                          });
                        }}
                      >
                        Editar
                      </button>
                      <button onClick={() => handleDeactivate(p.id, true)}>Desactivar</button>
                    </>
                  ) : (
                    <button onClick={() => handleDeactivate(p.id, false)}>Reactivar</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Tabla deuda acumulada */}
      {pendingDebt.visible && (
        <div style={{ marginTop: "2rem", border: "1px solid #ddd", padding: "1rem" }}>
          <h3>Nueva deuda pendiente</h3>
          <table style={{ width: "100%", marginBottom: "1rem" }}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pendingDebt.items.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.name}</td>
                  <td>{i.qty}</td>
                  <td>${i.unitCost}</td>
                  <td>${i.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <label>Descripción de la deuda:</label>
          <textarea
            value={pendingDebt.description}
            onChange={(e) =>
              setPendingDebt({ ...pendingDebt, description: e.target.value })
            }
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
            onClick={createDebt}
          >
            Solicitar deuda
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
            onClick={() =>
              setPendingDebt({ visible: false, items: [], description: "" })
            }
          >
            Cancelar
          </button>
        </div>
      )}

      <BackButton label="← Volver al dashboard" to="/dashboard" />
    </div>
  );
}