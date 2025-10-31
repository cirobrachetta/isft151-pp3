import { TransactionRestController } from "../rest/TransactionRestController.js";

export const TransactionController = {
  // 💵 Cash Movements
  // 💵 Incomes (formerly cash movements)
  async listIncomes() {
    return TransactionRestController.listIncomes();
  },
  async createIncome(data) {
    return TransactionRestController.createIncome(data);
  },
  async deleteIncome(id) {
    return TransactionRestController.deleteIncome(id);
  },

  // NOTE: legacy alias methods removed — use listIncomes/createIncome/deleteIncome

  // 💳 Payments
  async listPaymentsByDebt(debtId) {
    return TransactionRestController.listPaymentsByDebt(debtId);
  },
  async listPayments() {
    return TransactionRestController.listPayments();
  },
  async createPayment(data) {
    return TransactionRestController.createPayment(data);
  },
  async deletePayment(id) {
    return TransactionRestController.deletePayment(id);
  },

  // 📜 Debts
  async listDebts() {
    return TransactionRestController.listDebts();
  },
  async createDebt(data) {
    return TransactionRestController.createDebt(data);
  },
  async deleteDebt(id) {
    return TransactionRestController.deleteDebt(id);
  },
};
