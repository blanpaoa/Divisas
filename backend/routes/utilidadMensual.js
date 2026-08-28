const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const { anio } = req.query;
  let query = 'SELECT * FROM utilidad_mensual WHERE 1=1';
  const params = [];
  if (anio) {
    query += ' AND anio = ?';
    params.push(anio);
  }
  query += ' ORDER BY anio DESC, mes ASC';
  res.json(db.prepare(query).all(...params));
});

router.put('/:anio/:mes', requireAuth, requireRole('admin', 'operador'), (req, res) => {
  const { anio, mes } = req.params;
  const { utilidad_us = 0, utilidad_ars = 0, notas = null } = req.body || {};

  const existing = db
    .prepare('SELECT id FROM utilidad_mensual WHERE anio = ? AND mes = ?')
    .get(anio, mes);

  if (existing) {
    db.prepare(
      'UPDATE utilidad_mensual SET utilidad_us = ?, utilidad_ars = ?, notas = ? WHERE anio = ? AND mes = ?'
    ).run(utilidad_us, utilidad_ars, notas, anio, mes);
  } else {
    db.prepare(
      'INSERT INTO utilidad_mensual (anio, mes, utilidad_us, utilidad_ars, notas) VALUES (?, ?, ?, ?, ?)'
    ).run(anio, mes, utilidad_us, utilidad_ars, notas);
  }

  res.json({ ok: true });
});

module.exports = router;
