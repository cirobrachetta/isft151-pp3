import { fetchWithAuth } from "../utils/httpClient.js";

export const TransactionRestController = {
  listIncomes() {
    return fetchWithAuth("/api/tesoreria/incomes");
  },
  createIncome(data) {
    return fetchWithAuth("/api/tesoreria/incomes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  deleteIncome(id) {
    return fetchWithAuth(`/api/tesoreria/incomes/${id}`, { method: "DELETE" });
  },

  // PAYMENTS
  listPayments() {
    return fetchWithAuth("/api/tesoreria/payments");
  },
  listPaymentsByDebt(debtId) {
    return fetchWithAuth(`/api/tesoreria/payments/debt/${debtId}`);
  },
  createPayment(data) {
    return fetchWithAuth("/api/tesoreria/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  deletePayment(id) {
    return fetchWithAuth(`/api/tesoreria/payments/${id}`, { method: "DELETE" });
  },

  // DEBTS
  listDebts() {
    return fetchWithAuth("/api/tesoreria/debts");
  },
  createDebt(data) {
    return fetchWithAuth("/api/tesoreria/debts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  deleteDebt(id) {
    return fetchWithAuth(`/api/tesoreria/debts/${id}`, { method: "DELETE" });
  },
};