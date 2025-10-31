const BASE_URL = "http://localhost:4000"; // Puerto del backend

const API_INCOMES = `${BASE_URL}/api/tesoreria/incomes`;
const API_PAYMENTS = `${BASE_URL}/api/tesoreria/payments`;
const API_DEBTS = `${BASE_URL}/api/tesoreria/debts`;

async function handleResponse(res) {
  if (!res || typeof res.json !== "function") {
    throw new Error("Respuesta inválida del servidor");
  }

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    console.warn("No se pudo parsear JSON:", err);
  }

  if (!res.ok) {
    throw new Error((data && data.error) || res.statusText || "Error desconocido");
  }

  return data;
}

export const TransactionRestController = {
  // 💵 INCOMES (formerly cash movements)
  listIncomes() {
    return fetch(API_INCOMES).then(handleResponse);
  },
  createIncome(data) {
    return fetch(API_INCOMES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },
  deleteIncome(id) {
    return fetch(`${API_INCOMES}/${id}`, { method: "DELETE" }).then(handleResponse);
  },

  // (aliases removed) Use listIncomes/createIncome/deleteIncome instead of cash-movements APIs

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

  listPayments() {
    return fetch(API_PAYMENTS).then(handleResponse);
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
