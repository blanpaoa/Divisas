require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./index');

// Catalogo de monedas detectado en las planillas originales
const MONEDAS = [
  ['ARS', 'Pesos argentinos'],
  ['USD', 'Dolar (cara grande)'],
  ['USD_PEQ', 'Dolar (cara chica)'],
  ['EUR', 'Euro'],
  ['REAL', 'Real brasilero'],
  ['UYU', 'Peso uruguayo'],
  ['MXN', 'Peso mexicano'],
  ['PYG', 'Guarani'],
  ['CLP', 'Peso chileno'],
  ['GBP', 'Libra esterlina'],
  ['PEN', 'Sol peruano'],
  ['CAD', 'Dolar canadiense'],
  ['AUD', 'Dolar australiano'],
  ['COP', 'Peso colombiano'],
  ['VES', 'Bolivar venezolano'],
];

function seedMonedas() {
  const insert = db.prepare('INSERT OR IGNORE INTO monedas (codigo, nombre) VALUES (?, ?)');
  const insertMany = db.transaction((rows) => {
    for (const [codigo, nombre] of rows) insert.run(codigo, nombre);
  });
  insertMany(MONEDAS);
  console.log(`Monedas cargadas: ${MONEDAS.length}`);
}

function seedAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = db.prepare('SELECT id FROM usuarios WHERE username = ?').get(username);
  if (existing) {
    console.log(`El usuario admin "${username}" ya existe, no se vuelve a crear.`);
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    'INSERT INTO usuarios (username, password_hash, nombre_completo, rol) VALUES (?, ?, ?, ?)'
  ).run(username, hash, 'Administrador', 'admin');

  console.log(`Usuario admin creado -> usuario: "${username}" / clave: "${password}"`);
  console.log('IMPORTANTE: cambia esta clave despues del primer login.');
}

seedMonedas();
seedAdmin();
console.log('Seed completo.');
