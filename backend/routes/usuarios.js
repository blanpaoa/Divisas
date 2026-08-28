const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/', (req, res) => {
  const usuarios = db
    .prepare('SELECT id, username, nombre_completo, rol, activo, creado_en FROM usuarios ORDER BY id')
    .all();
  res.json(usuarios);
});

router.post('/', (req, res) => {
  const { username, password, nombre_completo, rol } = req.body || {};
  if (!username || !password || !rol) {
    return res.status(400).json({ error: 'username, password y rol son requeridos.' });
  }
  if (!['admin', 'operador', 'visor'].includes(rol)) {
    return res.status(400).json({ error: 'Rol invalido.' });
  }

  const existing = db.prepare('SELECT id FROM usuarios WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Ese nombre de usuario ya existe.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      'INSERT INTO usuarios (username, password_hash, nombre_completo, rol) VALUES (?, ?, ?, ?)'
    )
    .run(username, hash, nombre_completo || null, rol);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { nombre_completo, rol, activo, password } = req.body || {};
  const id = req.params.id;

  const user = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

  if (rol && !['admin', 'operador', 'visor'].includes(rol)) {
    return res.status(400).json({ error: 'Rol invalido.' });
  }

  db.prepare(
    'UPDATE usuarios SET nombre_completo = COALESCE(?, nombre_completo), rol = COALESCE(?, rol), activo = COALESCE(?, activo) WHERE id = ?'
  ).run(nombre_completo ?? null, rol ?? null, activo === undefined ? null : Number(activo), id);

  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE usuarios SET password_hash = ? WHERE id = ?').run(hash, id);
  }

  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  if (Number(id) === req.user.id) {
    return res.status(400).json({ error: 'No podes eliminar tu propio usuario.' });
  }
  db.prepare('UPDATE usuarios SET activo = 0 WHERE id = ?').run(id);
  res.json({ ok: true });
});

module.exports = router;
