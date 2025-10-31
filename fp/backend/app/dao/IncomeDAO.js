const { runQuery, getQuery, allQuery } = require('../utils/DBUtil');
const { getDB } = require('../../db/connection');
const Income = require('../models/Income');

const IncomeDAO = {
  insert(movement) {
    const result = runQuery(`
      INSERT INTO cash_movements (amount, type, description, created_at)
      VALUES (:amount, :type, :description, CURRENT_TIMESTAMP);
    `, movement);

    const id = result && result.lastInsertRowid ? result.lastInsertRowid : null;
    if (!id) return result;

    const row = getQuery(`
      SELECT id, type, amount, description, created_at
      FROM cash_movements
      WHERE id = :id;
    `, { id });
    return row ? Income.fromRow(row) : null;
  },

  insertAndApplyToBudget(movement, orgId = null) {
    const db = getDB();
    const tx = db.transaction((m, providedOrgId) => {
      const insertStmt = db.prepare(`INSERT INTO cash_movements (amount, type, description, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP);`);
      const info = insertStmt.run(m.amount, m.type, m.description || null);
      const id = info && info.lastInsertRowid ? info.lastInsertRowid : null;
      const paymentRow = db.prepare(`SELECT id, type, amount, description, created_at FROM cash_movements WHERE id = ?`).get(id);

      let org = null;
      if (providedOrgId) {
        org = db.prepare(`SELECT id, name, contact, COALESCE(budget,0) as budget FROM organizations WHERE id = ?`).get(providedOrgId);
      }
      if (!org) {
        org = db.prepare(`SELECT id, name, contact, COALESCE(budget,0) as budget FROM organizations ORDER BY id LIMIT 1`).get();
      }

      if (org) {
        let applyDelta = true;
        if (m.payment_id) {
          try {
            const pay = db.prepare(`SELECT COALESCE(applied_to_budget,0) as applied FROM payments WHERE id = ?`).get(m.payment_id);
            if (pay && pay.applied) {
              applyDelta = false;
            }
          } catch (e) { }
        }

        const delta = (m.type === 'ingreso') ? Number(m.amount) : (m.type === 'egreso' ? -Number(m.amount) : 0);
        if (delta !== 0 && applyDelta) {
          try {
            const cols = db.prepare("PRAGMA table_info('organizations')").all();
            const hasBudget = cols.some(c => c.name === 'budget');
            if (!hasBudget) {
              db.exec("ALTER TABLE organizations ADD COLUMN budget NUMERIC NOT NULL DEFAULT 0;");
            }
          } catch (e) { }

          db.prepare(`UPDATE organizations SET budget = COALESCE(budget,0) + ? WHERE id = ?`).run(delta, org.id);
          if (m.payment_id) {
            try {
              db.prepare(`UPDATE payments SET applied_to_budget = 1 WHERE id = ?`).run(m.payment_id);
            } catch (err) { }
          }
          org = db.prepare(`SELECT id, name, contact, COALESCE(budget,0) as budget FROM organizations WHERE id = ?`).get(org.id);
        }
      }

      return { movement: Income.fromRow(paymentRow), organization: org };
    });

    return tx(movement, orgId);
  },

  findAll() {
    const rows = allQuery(`
      SELECT id, type, amount, description, created_at
      FROM cash_movements
      ORDER BY created_at DESC;
    `);

    if (!rows || !Array.isArray(rows)) return [];
    return rows.map(Income.fromRow);
  },

  findById(id) {
    const row = getQuery(`
      SELECT id, amount, type, description, created_at
      FROM cash_movements
      WHERE id = :id;
    `, { id });
    return row ? Income.fromRow(row) : null;
  },

  deleteById(id) {
    const db = getDB();
    const tx = db.transaction((mid) => {
      db.prepare(`DELETE FROM cash_movements WHERE id = ?`).run(mid);
      try {
        const net = db.prepare(`SELECT SUM(CASE WHEN type = 'ingreso' THEN amount WHEN type = 'egreso' THEN -amount ELSE 0 END) as net FROM cash_movements`).get();
        const total = net && net.net ? net.net : 0;
        const cols = db.prepare("PRAGMA table_info('organizations')").all();
        const hasBudget = cols.some(c => c.name === 'budget');
        if (!hasBudget) {
          db.exec("ALTER TABLE organizations ADD COLUMN budget NUMERIC NOT NULL DEFAULT 0;");
        }
        const org = db.prepare(`SELECT id FROM organizations ORDER BY id LIMIT 1`).get();
        if (org && org.id) {
          db.prepare(`UPDATE organizations SET budget = ? WHERE id = ?`).run(total, org.id);
        }
      } catch (e) {
        console.warn('recompute budget failed after delete:', e && e.message);
      }
    });
    return tx(id);
  },

  recomputeBudget() {
    const db = getDB();
    try {
      const net = db.prepare(`SELECT SUM(CASE WHEN type = 'ingreso' THEN amount WHEN type = 'egreso' THEN -amount ELSE 0 END) as net FROM cash_movements`).get();
      const total = net && net.net ? net.net : 0;
      const cols = db.prepare("PRAGMA table_info('organizations')").all();
      const hasBudget = cols.some(c => c.name === 'budget');
      if (!hasBudget) {
        db.exec("ALTER TABLE organizations ADD COLUMN budget NUMERIC NOT NULL DEFAULT 0;");
      }
      const org = db.prepare(`SELECT id FROM organizations ORDER BY id LIMIT 1`).get();
      if (org && org.id) {
        db.prepare(`UPDATE organizations SET budget = ? WHERE id = ?`).run(total, org.id);
        return db.prepare(`SELECT id, name, contact, COALESCE(budget,0) as budget FROM organizations WHERE id = ?`).get(org.id);
      }
      return null;
    } catch (e) {
      console.warn('Failed to recompute budget:', e && e.message);
      return null;
    }
  },
};

module.exports = IncomeDAO;
