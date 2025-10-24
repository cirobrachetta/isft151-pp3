const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

let db = null;
function getDB() {
  if (!db) {
    const file = path.resolve(__dirname, 'app.db');
    db = new Database(file, { fileMustExist: true });
    console.log('DB path:', file);
  }
  return db;
}
module.exports = { getDB };