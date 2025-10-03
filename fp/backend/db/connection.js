const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

let db = null;
function getDB() {
  if (!db) {
    // db/app.db al mismo nivel que app/
    const file = path.resolve(__dirname, 'app.db');
    db = new Database(file, { fileMustExist: true }); // la DB ya existe
    // Si querés bootstrap opcional, quitá fileMustExist y descomentá:
    // const schema = path.resolve(__dirname, '..', 'app', 'resources', 'schema.sql');
    // if (fs.existsSync(schema)) db.exec(fs.readFileSync(schema, 'utf8'));
    console.log('DB path:', file);
  }
  return db;
}
module.exports = { getDB };