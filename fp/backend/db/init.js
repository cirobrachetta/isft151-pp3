const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'app.db');
const seedPath = path.join(__dirname, 'schemas', 'initialdb.sql');
const trgPath  = path.join(__dirname, 'triggers', 'triggers.sql');

(async () => {
  const exists = fs.existsSync(dbPath);

  if (exists) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = q => new Promise(r => rl.question(q, r));
    const ans = (await ask("La base ya existe. ¿Sobrescribir? [s/n]: ")).trim().toLowerCase();
    rl.close();
    if (ans !== 's') { console.log('Cancelado.'); process.exit(0); }
    fs.unlinkSync(dbPath);
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  if (!fs.existsSync(seedPath)) { console.error('Falta schemas/initialdb.sql'); process.exit(1); }
  db.exec(fs.readFileSync(seedPath, 'utf8'));

  if (fs.existsSync(trgPath)) db.exec(fs.readFileSync(trgPath, 'utf8'));

  console.log('DB inicializada');
})();
