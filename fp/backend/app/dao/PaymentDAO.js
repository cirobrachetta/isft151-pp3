const { runQuery, getQuery, allQuery } = require('../utils/DBUtil');
const { getDB } = require('../../db/connection');
const Payment = require('../models/Payment');
const Debt = require('../models/Debt');

const PaymentDAO = {
  insert(payment) {
    // Insert and return created row. Omit payment_date parameter to let DB default to CURRENT_TIMESTAMP
    const result = runQuery(`
      INSERT INTO payments (debt_id, amount, method, notes)
      VALUES (:debt_id, :amount, :method, :notes);
    `, payment);

    const id = result && result.lastInsertRowid ? result.lastInsertRowid : null;
    if (!id) return result;

    try {
      const row = getQuery(`
        SELECT id, debt_id, amount, payment_date, method, notes, COALESCE(applied_to_budget,0) as applied_to_budget
        FROM payments
        WHERE id = :id;
      `, { id });
      return row ? Payment.fromRow(row) : null;
    } catch (e) {
      const row = getQuery(`
        SELECT id, debt_id, amount, payment_date, method, notes
        FROM payments
        WHERE id = :id;
      `, { id });
      return row ? Payment.fromRow(row) : null;
    }
  },

  findByDebtId(debt_id) {
    try {
      const rows = allQuery(`
        SELECT id, debt_id, amount, payment_date, method, notes, COALESCE(applied_to_budget,0) as applied_to_budget
        FROM payments
        WHERE debt_id = :debt_id
        ORDER BY payment_date DESC;
      `, { debt_id });
      if (!rows || !Array.isArray(rows)) return [];
      return rows.map(Payment.fromRow);
    } catch (e) {
      const rows = allQuery(`
        SELECT id, debt_id, amount, payment_date, method, notes
        FROM payments
        WHERE debt_id = :debt_id
        ORDER BY payment_date DESC;
      `, { debt_id });
      if (!rows || !Array.isArray(rows)) return [];
      return rows.map(Payment.fromRow);
    }
  },

  findAll() {
    try {
      const rows = allQuery(`
        SELECT id, debt_id, amount, payment_date, method, notes, COALESCE(applied_to_budget,0) as applied_to_budget
        FROM payments
        ORDER BY payment_date DESC;
      `);
      if (!rows || !Array.isArray(rows)) return [];
      return rows.map(Payment.fromRow);
    } catch (e) {
      const rows = allQuery(`
        SELECT id, debt_id, amount, payment_date, method, notes
        FROM payments
        ORDER BY payment_date DESC;
      `);
      if (!rows || !Array.isArray(rows)) return [];
      return rows.map(Payment.fromRow);
    }
  },

  findById(id) {
    try {
      const row = getQuery(`
        SELECT id, debt_id, amount, payment_date, method, notes, COALESCE(applied_to_budget,0) as applied_to_budget
        FROM payments
        WHERE id = :id;
      `, { id });
      return row ? Payment.fromRow(row) : null;
    } catch (e) {
      const row = getQuery(`
        SELECT id, debt_id, amount, payment_date, method, notes
        FROM payments
        WHERE id = :id;
      `, { id });
      return row ? Payment.fromRow(row) : null;
    }
  },

  deleteById(id) {
    return runQuery(`
      DELETE FROM payments
      WHERE id = :id;
    `, { id });
  },

  // Insert payment and atomically apply amount to debt.amount_paid inside a transaction
  insertAndApplyToDebt(payment, orgId = null, applyToBudget = false) {
    const db = getDB();
    const tx = db.transaction((p, providedOrgId, applyBudget) => {
      // fetch current debt
      const debtRow = db.prepare(`SELECT id, creditor, amount, amount_paid, due_date, description, created_at FROM debts WHERE id = ?`).get(p.debt_id);
      if (!debtRow) {
        const e = new Error(`Debt with id ${p.debt_id} not found`);
        e.code = 'DEBT_NOT_FOUND';
        throw e;
      }
      const amountPaid = Number(debtRow.amount_paid || 0);
      const total = Number(debtRow.amount || 0);
      const remaining = total - amountPaid;
      if (Number(p.amount) > remaining) {
        const e = new Error(`Payment amount exceeds remaining debt (${remaining})`);
        e.code = 'OVERPAYMENT';
        throw e;
      }

      const insertStmt = db.prepare(`INSERT INTO payments (debt_id, amount, method, notes) VALUES (?, ?, ?, ?);`);
      const info = insertStmt.run(p.debt_id, p.amount, p.method || null, p.notes || null);
      const id = info && info.lastInsertRowid ? info.lastInsertRowid : null;
  const paymentRow = db.prepare(`SELECT id, debt_id, amount, payment_date, method, notes, COALESCE(applied_to_budget,0) as applied_to_budget FROM payments WHERE id = ?`).get(id);

      // update debt amount_paid
      db.prepare(`UPDATE debts SET amount_paid = COALESCE(amount_paid, 0) + ? WHERE id = ?`).run(p.amount, p.debt_id);

      const updatedDebtRow = db.prepare(`SELECT id, creditor, amount, amount_paid, due_date, description, created_at FROM debts WHERE id = ?`).get(p.debt_id);

      let org = null;
      if (applyBudget) {
        // determine organization id
        let targetOrgId = providedOrgId || null;
        if (!targetOrgId) {
          const maybe = db.prepare(`SELECT id FROM organizations ORDER BY id LIMIT 1`).get();
          targetOrgId = maybe && maybe.id ? maybe.id : null;
        }
        if (targetOrgId) {
          // ensure payments.applied_to_budget column exists (migration should handle it)
          const paymentApplied = paymentRow.applied_to_budget ? 1 : 0;
          if (!paymentApplied) {
            // apply negative delta to organization budget (payments reduce budget)
            const delta = -Number(p.amount);
            try {
              db.prepare(`UPDATE organizations SET budget = COALESCE(budget,0) + ? WHERE id = ?`).run(delta, targetOrgId);
            } catch (e) {
              // try to add column and retry
              try { db.exec("ALTER TABLE organizations ADD COLUMN budget NUMERIC NOT NULL DEFAULT 0;"); db.prepare(`UPDATE organizations SET budget = COALESCE(budget,0) + ? WHERE id = ?`).run(delta, targetOrgId); } catch(err) { /* ignore */ }
            }
            // mark payment as applied
            db.prepare(`UPDATE payments SET applied_to_budget = 1 WHERE id = ?`).run(id);
            org = db.prepare(`SELECT id, name, contact, COALESCE(budget,0) as budget FROM organizations WHERE id = ?`).get(targetOrgId);
          } else {
            // already applied, just read org
            org = db.prepare(`SELECT id, name, contact, COALESCE(budget,0) as budget FROM organizations WHERE id = ?`).get(targetOrgId);
          }
        }
      }

      return { payment: Payment.fromRow(paymentRow), debt: Debt.fromRow(updatedDebtRow), organization: org };
    });

    return tx(payment, orgId, applyToBudget);
  },
};

module.exports = PaymentDAO;
