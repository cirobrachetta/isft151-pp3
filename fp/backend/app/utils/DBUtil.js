const { getDB } = require('../../db/connection');


// runQuery: para operaciones que modifican la DB (INSERT, UPDATE, DELETE)
function runQuery(query, params = {}) {
  const db = getDB();
  const stmt = db.prepare(query);
  return stmt.run(params);
}

// getQuery: para operaciones que retornan una sola fila (SELECT con WHERE que devuelve un único resultado)
function getQuery(query, params = {}) {
  const db = getDB();
  const stmt = db.prepare(query);
  return stmt.get(params);
}

// allQuery: para operaciones que retornan múltiples filas (SELECT sin WHERE o con WHERE que devuelve varios resultados)
function allQuery(query, params = {}) {
  const db = getDB();
  const stmt = db.prepare(query);
  return stmt.all(params);
}

module.exports = { runQuery, getQuery, allQuery };