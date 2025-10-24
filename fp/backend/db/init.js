const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'app.db');
const seedPath = path.join(__dirname, 'schemas', 'initialdb2.sql');
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

  // --- generar hash seguro para superadmin ---
  const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
  const askPass = q => new Promise(r => rl2.question(q, r));
  const plainPassword = (await askPass("Contraseña para el superadmin: ")).trim();
  rl2.close();

  if (!plainPassword) {
    console.error("Error: contraseña vacía.");
    process.exit(1);
  }

  const hash = bcrypt.hashSync(plainPassword, 10);
  console.log("Hash generado:", hash);

  // --- inicializar base de datos ---
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  if (!fs.existsSync(seedPath)) { 
    console.error('Falta schemas/initialdb.sql'); 
    process.exit(1); 
  }

  // cargar SQL y reemplazar el placeholder
  let sql = fs.readFileSync(seedPath, 'utf8');
  sql = sql.replace(/hash_superseguro/g, hash);

  db.exec(sql);

  if (fs.existsSync(trgPath)) db.exec(fs.readFileSync(trgPath, 'utf8'));

  console.log('✅ DB inicializada correctamente');
})();