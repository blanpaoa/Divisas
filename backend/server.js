require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Inicializa la base de datos (crea el archivo y las tablas si no existen)
require('./db');

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const monedasRoutes = require('./routes/monedas');
const tenenciasRoutes = require('./routes/tenencias');
const entradasRoutes = require('./routes/entradas');
const salidasRoutes = require('./routes/salidas');
const gastosRoutes = require('./routes/gastos');
const operacionesRoutes = require('./routes/operaciones');
const transferenciasRoutes = require('./routes/transferencias');
const resumenDiarioRoutes = require('./routes/resumenDiario');
const utilidadMensualRoutes = require('./routes/utilidadMensual');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/monedas', monedasRoutes);
app.use('/api/tenencias', tenenciasRoutes);
app.use('/api/entradas', entradasRoutes);
app.use('/api/salidas', salidasRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/operaciones', operacionesRoutes);
app.use('/api/transferencias', transferenciasRoutes);
app.use('/api/resumen-diario', resumenDiarioRoutes);
app.use('/api/utilidad-mensual', utilidadMensualRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Sirve el frontend estatico (para desplegar todo junto en un solo servidor)
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Manejador de errores generico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
