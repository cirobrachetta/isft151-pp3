class IncomeDTO {
  constructor({ id, type, concept, amount, event_id, user_id, created_at }) {
    this.id = id;
    this.type = type;
    this.concept = concept;
    this.amount = amount;
    this.event_id = event_id;
    this.user_id = user_id;
    this.created_at = created_at;
  }
  static fromModel(model) {
    return new IncomeDTO(model);
  }
}
module.exports = IncomeDTO;
