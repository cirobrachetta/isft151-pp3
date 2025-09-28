const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'app.db'));
db.pragma('foreign_keys = ON');

const cmd = process.argv[2];
const dir = process.argv[3] || path.join(__dirname, 'queries');
const file = process.argv[4];

if (cmd === 'list') {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  files.forEach(f => console.log(f));
  process.exit(0);
}

if (cmd === 'exec') {
  if (!file) { console.error('Falta archivo .sql'); process.exit(1); }
  const full = path.isAbsolute(file) ? file : path.join(dir, file);
  const sql = fs.readFileSync(full, 'utf8');
  db.exec(sql);
  console.log(`OK: ${full}`);
  process.exit(0);
}

console.error('Uso: node sql/run-sql.js list [dir] | exec [dir] <archivo.sql>');
process.exit(1);