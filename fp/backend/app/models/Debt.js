class Debt {
	constructor({ id, creditor, amount, amount_paid, due_date, description, created_at }) {
		this.id = id;
		// creditor stored as "entityType:entityId" or raw string
		this.creditor = creditor;
		this.amount = amount;
		this.amount_paid = amount_paid || 0;
		this.due_date = due_date;
		this.description = description;
		this.created_at = created_at;
		// current remaining amount
		this.amount_remaining = Number(this.amount) - Number(this.amount_paid || 0);
		// parse creditor into entity_type/entity_id for the frontend convenience
		if (typeof creditor === 'string' && creditor.includes(':')) {
			const [entity_type, entity_id] = creditor.split(':');
			this.entity_type = entity_type;
			this.entity_id = entity_id;
		} else {
			this.entity_type = null;
			this.entity_id = creditor || null;
		}
	}

	static fromRow(row) {
		if (!row) return null;
		return new Debt({
			id: row.id,
			creditor: row.creditor,
			amount: row.amount,
			amount_paid: row.amount_paid || 0,
			due_date: row.due_date,
			description: row.description,
			created_at: row.created_at,
		});
	}
}

module.exports = Debt;
