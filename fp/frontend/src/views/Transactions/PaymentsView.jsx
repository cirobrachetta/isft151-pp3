import React, { useEffect, useState } from "react";
import { TransactionController } from "../../controllers/TransactionController";

export default function PaymentsView() {
  const [debtId, setDebtId] = useState("");
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ debt_id: "", amount: "" });

  async function handleLoad() {
    const data = await TransactionController.listPaymentsByDebt(debtId);
    setPayments(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await TransactionController.createPayment(form);
    setForm({ debt_id: "", amount: "" });
    handleLoad();
  }

  async function handleDelete(id) {
    await TransactionController.deletePayment(id);
    handleLoad();
  }

  return (
    <div style={styles.container}>
      <h2>Payments</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Debt ID"
          value={form.debt_id}
          onChange={(e) => setForm({ ...form, debt_id: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <button type="submit">Add</button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          placeholder="Search Debt ID"
          value={debtId}
          onChange={(e) => setDebtId(e.target.value)}
        />
        <button onClick={handleLoad}>Load Payments</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Debt ID</th>
            <th>Amount</th>
            <th>Paid At</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.debt_id}</td>
              <td>{p.amount}</td>
              <td>{new Date(p.paid_at).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDelete(p.id)}>❌</button>
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
