import React, { useEffect, useState } from "react";
import { ProductController } from "../controllers/ProductController.js";
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
  const [showInactive, setShowInactive] = useState(true);

  const load = async () => {
    const data = await ProductController.list();
    setProducts(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await ProductController.update(editing, form);
      setEditing(null);
    } else {
      await ProductController.create(form);
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

  return (
    <div className="inventoryContainer">
      <h1>Gestión de Inventario</h1>
      <p className="subtitle">
        Registro de productos, control de stock y consumos durante eventos.
      </p>

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
              onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) })}
            />
          </div>

          <div className="formRow">
            <label>Precio de venta ($):</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
            />
          </div>

          <div className="formRow">
            <label>Stock actual:</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
            />
          </div>

          <div className="formRow">
            <label>Stock mínimo:</label>
            <input
              type="number"
              min="0"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: parseInt(e.target.value) })}
            />
          </div>

          <button type="submit">{editing ? "Guardar cambios" : "Agregar producto"}</button>

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
              <td colSpan="7" className="noData">
                No hay productos registrados
              </td>
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
      <BackButton label="← Volver al dashboard" to="/dashboard" />
    </div>
  );
}