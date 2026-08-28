const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'casa_cambio.db');

// Aseguramos que exista la carpeta de datos
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Ejecutamos el esquema (CREATE TABLE IF NOT EXISTS, es seguro correrlo siempre)
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
