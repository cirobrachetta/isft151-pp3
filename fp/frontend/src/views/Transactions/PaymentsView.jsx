import React, { useEffect, useState } from "react";
import { TransactionController } from "../../controllers/TransactionController";
import '../../components/AddPaymentModal'; // register web component
import BudgetWidget from '../../components/BudgetWidget';
import { OrganizationController } from '../../controllers/OrganizationController';
import BackButton from "../../components/BackButton";

export default function PaymentsView() {
  const [debtId, setDebtId] = useState("");
  const [payments, setPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [debtMap, setDebtMap] = useState({});
  const [form, setForm] = useState({ debt_id: "", amount: "" });

  async function handleLoad() {
    // Si no hay filtro, mostramos todos
    if (!debtId) {
      setPayments(allPayments);
      return;
    }
    // Filtrar localmente por debt id
    const filtered = (allPayments || []).filter((p) => String(p.debt_id) === String(debtId));
    setPayments(filtered);
  }

  async function loadData() {
    const data = await TransactionController.listPayments();
    const arr = data || [];
    setAllPayments(arr);
    setPayments(arr);
    // Load debts to map remaining amounts
    try {
      const debts = await TransactionController.listDebts();
      const map = (debts || []).reduce((acc, d) => { acc[d.id] = d; return acc; }, {});
      setDebtMap(map);
    } catch (e) {
      setDebtMap({});
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await TransactionController.createPayment(form);
    // if backend returned organization, emit budget-updated for real-time UI (mirror CashMovementsView behavior)
    if (res && res.organization) {
      document.dispatchEvent(new CustomEvent('budget-updated', { detail: res.organization, bubbles: true }));
    } else {
      // Fallback: if API didn't return org, fetch first org (PaymentDAO uses first org when none provided) and emit
      try {
        const list = await OrganizationController.listOrganizations();
        const first = Array.isArray(list) && list.length ? list[0] : null;
        if (first) document.dispatchEvent(new CustomEvent('budget-updated', { detail: first, bubbles: true }));
      } catch (e) { /* ignore */ }
    }
    setForm({ debt_id: "", amount: "" });
    // Recargar lista completa
    await loadData();
    setDebtId("");
  }

  async function handleDelete(id) {
    await TransactionController.deletePayment(id);
    await loadData();
  }

  useEffect(() => {
    loadData();
    // listen for payments created via the web component
    const modal = document.getElementById('addPaymentModal');
    function onAdded(e) {
      // refresh payments and debts map
      loadData();
    }
    if (modal) modal.addEventListener('payment-added', onAdded);
    // also listen at document level as fallback
    document.addEventListener('payment-added', onAdded);
    return () => {
      if (modal) modal.removeEventListener('payment-added', onAdded);
      document.removeEventListener('payment-added', onAdded);
    };
  }, []);

  return (
    <div style={styles.container}>
      <BudgetWidget />
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
          <button onClick={() => {
            const modal = document.getElementById('addPaymentModal');
            if (modal) modal.setAttribute('open', '');
          }}>Añadir pago</button>

          <add-payment-modal id="addPaymentModal"></add-payment-modal>
        <input
          type="text"
          placeholder="Filter by Debt ID"
          value={debtId}
          onChange={(e) => setDebtId(e.target.value)}
        />
        <button onClick={handleLoad}>Filter</button>
        <button onClick={() => { setDebtId(""); setPayments(allPayments); }}>Clear</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Debt ID</th>
            <th>Amount</th>
            <th>Paid At</th>
            <th>Debt Remaining</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(payments || []).map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.debt_id}</td>
              <td>{p.amount}</td>
              <td>{p.paid_at ? new Date(p.paid_at).toLocaleString() : ''}</td>
              <td>{debtMap[p.debt_id] ? debtMap[p.debt_id].amount_remaining : ''}</td>
              <td>
                <button onClick={() => handleDelete(p.id)}>❌</button>
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
};
