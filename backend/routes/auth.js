const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y clave son requeridos.' });
  }

  const user = db.prepare('SELECT * FROM usuarios WHERE username = ? AND activo = 1').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Usuario o clave incorrectos.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Usuario o clave incorrectos.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, rol: user.rol, nombre: user.nombre_completo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      rol: user.rol,
      nombre_completo: user.nombre_completo,
    },
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post('/cambiar-clave', requireAuth, (req, res) => {
  const { clave_actual, clave_nueva } = req.body || {};
  if (!clave_actual || !clave_nueva) {
    return res.status(400).json({ error: 'Faltan datos.' });
  }
  if (clave_nueva.length < 6) {
    return res.status(400).json({ error: 'La clave nueva debe tener al menos 6 caracteres.' });
  }

  const user = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.user.id);
  const valid = bcrypt.compareSync(clave_actual, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'La clave actual no es correcta.' });
  }

  const hash = bcrypt.hashSync(clave_nueva, 10);
  db.prepare('UPDATE usuarios SET password_hash = ? WHERE id = ?').run(hash, user.id);
  res.json({ ok: true });
});

module.exports = router;
