class Payment {
	constructor({ id, debt_id, amount, paid_at, user_id, applied_to_budget }) {
		this.id = id;
		this.debt_id = debt_id;
		this.amount = amount;
		this.paid_at = paid_at;
		this.user_id = user_id;
		this.applied_to_budget = applied_to_budget || 0;
	}

	// Map a DB row into a Payment instance
	static fromRow(row) {
		if (!row) return null;
		return new Payment({
			id: row.id,
			debt_id: row.debt_id,
			amount: row.amount,
			paid_at: row.payment_date || row.paid_at || null,
			user_id: row.user_id || null,
			applied_to_budget: row.applied_to_budget || 0,
		});
	}
}
module.exports = Payment;
