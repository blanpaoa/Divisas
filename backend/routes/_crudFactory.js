const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

/**
 * Crea un router CRUD basico para una tabla que tiene:
 * fecha, moneda_id, valor/cantidad, y campos propios.
 *
 * @param {string} tabla - nombre de la tabla en SQLite
 * @param {string[]} campos - columnas editables (sin id, sin creado_en, sin usuario_id)
 */
function crearRouterCrud(tabla, campos) {
  const router = express.Router();

  // Lectura: cualquier usuario autenticado (admin, operador, visor)
  router.get('/', requireAuth, (req, res) => {
    const { desde, hasta, moneda_id } = req.query;
    let query = `SELECT t.*, m.codigo AS moneda_codigo, m.nombre AS moneda_nombre
                 FROM ${tabla} t
                 LEFT JOIN monedas m ON m.id = t.moneda_id
                 WHERE 1=1`;
    const params = [];

    if (desde) {
      query += ' AND t.fecha >= ?';
      params.push(desde);
    }
    if (hasta) {
      query += ' AND t.fecha <= ?';
      params.push(hasta);
    }
    if (moneda_id) {
      query += ' AND t.moneda_id = ?';
      params.push(moneda_id);
    }
    query += ' ORDER BY t.fecha DESC, t.id DESC';

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  });

  // Escritura: solo admin y operador
  router.post('/', requireAuth, requireRole('admin', 'operador'), (req, res) => {
    const body = req.body || {};
    const cols = campos.filter((c) => body[c] !== undefined);
    if (cols.length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos validos.' });
    }
    const placeholders = cols.map(() => '?').join(', ');
    const values = cols.map((c) => body[c]);

    const sql = `INSERT INTO ${tabla} (${cols.join(', ')}, usuario_id) VALUES (${placeholders}, ?)`;
    const result = db.prepare(sql).run(...values, req.user.id);
    res.status(201).json({ id: result.lastInsertRowid });
  });

  router.put('/:id', requireAuth, requireRole('admin', 'operador'), (req, res) => {
    const body = req.body || {};
    const cols = campos.filter((c) => body[c] !== undefined);
    if (cols.length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos validos.' });
    }
    const setClause = cols.map((c) => `${c} = ?`).join(', ');
    const values = cols.map((c) => body[c]);

    const sql = `UPDATE ${tabla} SET ${setClause} WHERE id = ?`;
    db.prepare(sql).run(...values, req.params.id);
    res.json({ ok: true });
  });

  router.delete('/:id', requireAuth, requireRole('admin', 'operador'), (req, res) => {
    db.prepare(`DELETE FROM ${tabla} WHERE id = ?`).run(req.params.id);
    res.json({ ok: true });
  });

  return router;
}

module.exports = crearRouterCrud;
