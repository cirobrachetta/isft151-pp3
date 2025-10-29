class CashMovement {
	constructor({ id, type, concept, amount, event_id, user_id, created_at }) {
		this.id = id;
		this.type = type; // ingreso o egreso
		this.concept = concept;
		// Mantener compatibilidad con el frontend que espera "description"
		this.description = concept;
		this.amount = amount;
		this.event_id = event_id;
		this.user_id = user_id;
		this.created_at = created_at;
	}

	// Crea una instancia de CashMovement desde una fila de la base de datos
	static fromRow(row) {
		if (!row) return null;
		return new CashMovement({
			id: row.id,
			type: row.type,
			concept: row.description || row.concept || null,
			amount: row.amount,
			event_id: row.event_id || null,
			user_id: row.user_id || null,
			created_at: row.created_at,
		});
	}
}
module.exports = CashMovement;
