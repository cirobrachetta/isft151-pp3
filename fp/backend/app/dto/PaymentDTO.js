// app/dto/PaymentDTO.js
class PaymentDTO {
  constructor({ id, debt_id, amount, paid_at, user_id }) {
    this.id = id;
    this.debt_id = debt_id;
    this.amount = amount;
    this.paid_at = paid_at;
    this.user_id = user_id;
  }
}

module.exports = PaymentDTO;
