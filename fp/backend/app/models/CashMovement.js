class CashMovement {
	constructor({ id, type, concept, amount, event_id, user_id, created_at }) {
		this.id = id;
		this.type = type; // ingreso o egreso
		this.concept = concept;
		this.amount = amount;
		this.event_id = event_id;
		this.user_id = user_id;
		this.created_at = created_at;
	}
}
module.exports = CashMovement;
