import React, { useEffect, useState } from "react";
import { TransactionController } from "../../controllers/TransactionController";
import { OrganizationController } from '../../controllers/OrganizationController';
import BudgetWidget from '../../components/BudgetWidget';
import BackButton from "../../components/BackButton";

export default function IncomesView() {
  const [movements, setMovements] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  // only ingresos allowed here
  const [form, setForm] = useState({ type: "ingreso", amount: "", description: "" });

  useEffect(() => {
    loadData();
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    try {
      const list = await OrganizationController.listOrganizations();
      setOrganizations(list || []);
      if (list && list.length > 0) setSelectedOrg(list[0].id);
    } catch (e) {
      console.error('Failed to load organizations', e);
      setOrganizations([]);
    }
  }

  async function loadData() {
    const data = await TransactionController.listIncomes();
    setMovements(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount), organization_id: selectedOrg };
    try {
      const res = await TransactionController.createIncome(payload);
      setForm({ type: "ingreso", amount: "", description: "" });
      await loadData();
      if (res && res.organization) {
        document.dispatchEvent(new CustomEvent('budget-updated', { detail: res.organization, bubbles: true }));
      }
    } catch (err) {
      console.error('Error creando income:', err);
    }
  }

  async function handleDelete(id) {
    await TransactionController.deleteIncome(id);
    loadData();
  }

  return (
    <div style={styles.container}>
      <BudgetWidget orgId={selectedOrg} />
      <h2>Incomes</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {organizations && organizations.length > 0 ? (
          <select value={selectedOrg || ''} onChange={e => setSelectedOrg(Number(e.target.value))}>
            {(organizations || []).map(o => (
              <option key={o.id} value={o.id}>{o.name} #{o.id}</option>
            ))}
          </select>
        ) : (
          <div style={{color:'#a00'}}>No organizations. Create one first.</div>
        )}
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="ingreso">Income</option>
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
        <button type="submit" disabled={!selectedOrg}>Add</button>
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
          { (movements || []).map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.type}</td>
              <td>{m.amount}</td>
              <td>{m.description}</td>
              <td>{new Date(m.created_at).toLocaleString()}</td>
              <td><button onClick={() => handleDelete(m.id)}>❌</button></td>
            </tr>
          )) }
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
};
