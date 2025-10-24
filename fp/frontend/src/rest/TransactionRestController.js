const API_CASH = "/cash";
const API_PAYMENTS = "/payments";
const API_DEBTS = "/debts";

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const TransactionRestController = {
  // 💵 CASH MOVEMENTS
  listCashMovements() {
    return fetch(API_CASH).then(handleResponse);
  },
  createCashMovement(data) {
    return fetch(API_CASH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },
  deleteCashMovement(id) {
    return fetch(`${API_CASH}/${id}`, { method: "DELETE" }).then(handleResponse);
  },

  // 💳 PAYMENTS
  listPaymentsByDebt(debtId) {
    return fetch(`${API_PAYMENTS}/debt/${debtId}`).then(handleResponse);
  },
  createPayment(data) {
    return fetch(API_PAYMENTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },
  deletePayment(id) {
    return fetch(`${API_PAYMENTS}/${id}`, { method: "DELETE" }).then(handleResponse);
  },

  // 📜 DEBTS
  listDebts() {
    return fetch(API_DEBTS).then(handleResponse);
  },
  createDebt(data) {
    return fetch(API_DEBTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },
  deleteDebt(id) {
    return fetch(`${API_DEBTS}/${id}`, { method: "DELETE" }).then(handleResponse);
  },
};
