const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'app.db');
const db = new Database(dbPath);

// PRAGMA
db.pragma('journal_mode = WAL'); //debería devolver 'wal'
db.pragma('synchronous = NORMAL'); 
db.pragma('busy_timeout = 5000');
db.pragma('foreign_keys = ON');

console.log(db.pragma('journal_mode', { simple:false }));

module.exports = db;
