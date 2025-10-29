import { TransactionRestController } from "../rest/TransactionRestController.js";

export const TransactionController = {
  // 💵 Cash Movements
  async listCashMovements() {
    return TransactionRestController.listCashMovements();
  },
  async createCashMovement(data) {
    return TransactionRestController.createCashMovement(data);
  },
  async deleteCashMovement(id) {
    return TransactionRestController.deleteCashMovement(id);
  },

  // 💳 Payments
  async listPaymentsByDebt(debtId) {
    return TransactionRestController.listPaymentsByDebt(debtId);
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
