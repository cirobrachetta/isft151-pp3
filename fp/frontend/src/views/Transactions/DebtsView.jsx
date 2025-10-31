import React, { useEffect, useState } from "react";
import { TransactionController } from "../../controllers/TransactionController";
import BudgetWidget from '../../components/BudgetWidget';
import BackButton from "../../components/BackButton";
export default function DebtsView() {
  const [debts, setDebts] = useState([]);
  const [activeTab, setActiveTab] = useState('open'); // 'open' or 'paid'
  
  const [form, setForm] = useState({
    entity_type: "customer",
    entity_id: "",
    amount: "",
    description: "",
    due_date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await TransactionController.listDebts();
    setDebts(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await TransactionController.createDebt(form);
    setForm({ entity_type: "customer", entity_id: "", amount: "", description: "", due_date: "" });
    loadData();
  }

  async function handleDelete(id) {
    await TransactionController.deleteDebt(id);
    loadData();
  }

  return (
    <div style={styles.container}>
      <BudgetWidget />
      <h2>Debts</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <select
          value={form.entity_type}
          onChange={(e) => setForm({ ...form, entity_type: e.target.value })}
        >
          <option value="customer">Customer</option>
          <option value="supplier">Supplier</option>
        </select>
        <input
          type="text"
          placeholder="Entity ID"
          value={form.entity_id}
          onChange={(e) => setForm({ ...form, entity_id: e.target.value })}
          required
        />
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
        <input
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>

      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => setActiveTab('open')} style={activeTab === 'open' ? styles.activeTab : styles.tab}>Open Debts</button>
        <button onClick={() => setActiveTab('paid')} style={activeTab === 'paid' ? styles.activeTab : styles.tab}>Paid Debts</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Entity</th>
            <th>Amount</th>
            <th>Remaining</th>
            <th>Description</th>
            <th>Due</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {debts
            .filter(d => (activeTab === 'open' ? Number(d.amount_remaining) > 0 : Number(d.amount_remaining) <= 0))
            .map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.entity_type} #{d.entity_id}</td>
              <td>{d.amount}</td>
              <td>{d.amount_remaining != null ? d.amount_remaining : ''}</td>
              <td>{d.description}</td>
              <td>{new Date(d.due_date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDelete(d.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <BackButton label="← Volver a Finansas" to="/dashboard" />
    </div>
  );
}

const styles = {
  container: { padding: "1rem" },
  form: { display: "flex", gap: "0.5rem", marginBottom: "1rem" },
  table: { width: "100%", borderCollapse: "collapse" },
  tab: { marginRight: '0.5rem', padding: '0.4rem 0.8rem' },
  activeTab: { marginRight: '0.5rem', padding: '0.4rem 0.8rem', fontWeight: 'bold', background: '#eee' },
};
