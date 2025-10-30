const BASE_URL = "http://localhost:4000"; // Puerto del backend

const API_CASH = `${BASE_URL}/api/tesoreria/movimientos`;
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
