import React, { useEffect, useState } from "react";
import { TransactionController } from "../../controllers/TransactionController";

export default function CashMovementsView() {
  const [movements, setMovements] = useState([]);
  // El backend espera 'ingreso' o 'egreso' en la columna "type"
  const [form, setForm] = useState({ type: "ingreso", amount: "", description: "" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await TransactionController.listCashMovements();
    setMovements(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Asegurarse de enviar el tipo esperado por la DB y que el amount sea numérico
    const payload = { ...form, amount: Number(form.amount) };
    try {
      await TransactionController.createCashMovement(payload);
      setForm({ type: "ingreso", amount: "", description: "" });
      await loadData();
    } catch (err) {
      console.error('Error creando movimiento:', err);
    }
  }

  async function handleDelete(id) {
    await TransactionController.deleteCashMovement(id);
    loadData();
  }

  return (
    <div style={styles.container}>
      <h2>Cash Movements</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="ingreso">Income</option>
          <option value="egreso">Expense</option>
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.type}</td>
              <td>{m.amount}</td>
              <td>{m.description}</td>
              <td>{new Date(m.created_at).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDelete(m.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding: "1rem" },
  form: { display: "flex", gap: "0.5rem", marginBottom: "1rem" },
  table: { width: "100%", borderCollapse: "collapse" },
};
