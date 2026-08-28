const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const { desde, hasta } = req.query;
  let query = 'SELECT * FROM resumen_diario WHERE 1=1';
  const params = [];
  if (desde) {
    query += ' AND fecha >= ?';
    params.push(desde);
  }
  if (hasta) {
    query += ' AND fecha <= ?';
    params.push(hasta);
  }
  query += ' ORDER BY fecha DESC';
  res.json(db.prepare(query).all(...params));
});

router.get('/:fecha', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM resumen_diario WHERE fecha = ?').get(req.params.fecha);
  res.json(row || null);
});

// Crea o actualiza el resumen del dia (upsert por fecha)
router.put('/:fecha', requireAuth, requireRole('admin', 'operador'), (req, res) => {
  const fecha = req.params.fecha;
  const b = req.body || {};
  const existing = db.prepare('SELECT id FROM resumen_diario WHERE fecha = ?').get(fecha);

  const campos = {
    saldo_dia_anterior_ars: b.saldo_dia_anterior_ars ?? 0,
    utilidad_diaria_ars: b.utilidad_diaria_ars ?? 0,
    descuentos_ars: b.descuentos_ars ?? 0,
    utilidad_adicional_ars: b.utilidad_adicional_ars ?? 0,
    faltante_sobrante_ars: b.faltante_sobrante_ars ?? 0,
    tasa_us_cierre: b.tasa_us_cierre ?? 0,
    total_ars: b.total_ars ?? 0,
    notas: b.notas ?? null,
  };

  if (existing) {
    db.prepare(
      `UPDATE resumen_diario SET saldo_dia_anterior_ars=?, utilidad_diaria_ars=?, descuentos_ars=?,
       utilidad_adicional_ars=?, faltante_sobrante_ars=?, tasa_us_cierre=?, total_ars=?, notas=?
       WHERE fecha = ?`
    ).run(
      campos.saldo_dia_anterior_ars,
      campos.utilidad_diaria_ars,
      campos.descuentos_ars,
      campos.utilidad_adicional_ars,
      campos.faltante_sobrante_ars,
      campos.tasa_us_cierre,
      campos.total_ars,
      campos.notas,
      fecha
    );
  } else {
    db.prepare(
      `INSERT INTO resumen_diario
       (fecha, saldo_dia_anterior_ars, utilidad_diaria_ars, descuentos_ars, utilidad_adicional_ars,
        faltante_sobrante_ars, tasa_us_cierre, total_ars, notas, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      fecha,
      campos.saldo_dia_anterior_ars,
      campos.utilidad_diaria_ars,
      campos.descuentos_ars,
      campos.utilidad_adicional_ars,
      campos.faltante_sobrante_ars,
      campos.tasa_us_cierre,
      campos.total_ars,
      campos.notas,
      req.user.id
    );
  }

  res.json({ ok: true });
});

module.exports = router;
