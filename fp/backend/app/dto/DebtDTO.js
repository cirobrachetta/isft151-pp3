// app/dto/DebtDTO.js
class DebtDTO {
  constructor({ id, supplier_id, description, amount_total, amount_paid, status, created_at }) {
    this.id = id;
    this.supplier_id = supplier_id;
    this.description = description;
    this.amount_total = amount_total;
    this.amount_paid = amount_paid;
    this.status = status;
    this.created_at = created_at;
  }
}

module.exports = DebtDTO;
