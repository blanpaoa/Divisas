const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado. Falta el token.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, username, rol }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido o expirado.' });
  }
}

// Uso: requireRole('admin') o requireRole('admin', 'operador')
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tenes permisos para esta accion.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
