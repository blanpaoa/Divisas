const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const activasOnly = req.query.todas !== 'true';
  const query = activasOnly
    ? 'SELECT * FROM monedas WHERE activa = 1 ORDER BY nombre'
    : 'SELECT * FROM monedas ORDER BY nombre';
  res.json(db.prepare(query).all());
});

router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { codigo, nombre } = req.body || {};
  if (!codigo || !nombre) {
    return res.status(400).json({ error: 'codigo y nombre son requeridos.' });
  }
  const result = db
    .prepare('INSERT INTO monedas (codigo, nombre) VALUES (?, ?)')
    .run(codigo.toUpperCase(), nombre);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const { nombre, activa } = req.body || {};
  db.prepare('UPDATE monedas SET nombre = COALESCE(?, nombre), activa = COALESCE(?, activa) WHERE id = ?').run(
    nombre ?? null,
    activa === undefined ? null : Number(activa),
    req.params.id
  );
  res.json({ ok: true });
});

module.exports = router;
