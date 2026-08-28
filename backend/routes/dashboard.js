const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Rango de fechas por defecto: ultimos 30 dias
function rangoFechas(req) {
  const hasta = req.query.hasta || new Date().toISOString().slice(0, 10);
  const desdeDefault = new Date();
  desdeDefault.setDate(desdeDefault.getDate() - 30);
  const desde = req.query.desde || desdeDefault.toISOString().slice(0, 10);
  return { desde, hasta };
}

// Resumen general: capital total actual, utilidad del periodo, gastos del periodo
router.get('/resumen', requireAuth, (req, res) => {
  const { desde, hasta } = rangoFechas(req);

  const capitalActual = db
    .prepare(
      `SELECT COALESCE(SUM(total_ars), 0) AS total
       FROM tenencias_diarias
       WHERE fecha = (SELECT MAX(fecha) FROM tenencias_diarias WHERE fecha <= ?)`
    )
    .get(hasta);

  const utilidadPeriodo = db
    .prepare(
      `SELECT COALESCE(SUM(utilidad_diaria_ars), 0) AS total
       FROM resumen_diario WHERE fecha BETWEEN ? AND ?`
    )
    .get(desde, hasta);

  const gastosPeriodo = db
    .prepare(`SELECT COALESCE(SUM(total_ars), 0) AS total FROM gastos WHERE fecha BETWEEN ? AND ?`)
    .get(desde, hasta);

  const entradasPeriodo = db
    .prepare(
      `SELECT COALESCE(SUM(total_ars), 0) AS total FROM entradas_prestamos WHERE fecha BETWEEN ? AND ?`
    )
    .get(desde, hasta);

  const operacionesPeriodo = db
    .prepare(
      `SELECT tipo, COUNT(*) AS cantidad, COALESCE(SUM(total_ars), 0) AS total_ars
       FROM operaciones_cambio WHERE fecha BETWEEN ? AND ? GROUP BY tipo`
    )
    .all(desde, hasta);

  res.json({
    periodo: { desde, hasta },
    capital_actual_ars: capitalActual.total,
    utilidad_periodo_ars: utilidadPeriodo.total,
    gastos_periodo_ars: gastosPeriodo.total,
    entradas_periodo_ars: entradasPeriodo.total,
    operaciones_periodo: operacionesPeriodo,
  });
});

// Evolucion diaria de utilidad y capital total, para graficos de linea
router.get('/evolucion', requireAuth, (req, res) => {
  const { desde, hasta } = rangoFechas(req);

  const utilidadDiaria = db
    .prepare(
      `SELECT fecha, utilidad_diaria_ars, total_ars
       FROM resumen_diario WHERE fecha BETWEEN ? AND ? ORDER BY fecha ASC`
    )
    .all(desde, hasta);

  const capitalDiario = db
    .prepare(
      `SELECT fecha, SUM(total_ars) AS capital_total_ars
       FROM tenencias_diarias WHERE fecha BETWEEN ? AND ? GROUP BY fecha ORDER BY fecha ASC`
    )
    .all(desde, hasta);

  res.json({ periodo: { desde, hasta }, utilidad_diaria: utilidadDiaria, capital_diario: capitalDiario });
});

// Distribucion de tenencias por moneda en la fecha mas reciente disponible
router.get('/distribucion-monedas', requireAuth, (req, res) => {
  const hasta = req.query.hasta || new Date().toISOString().slice(0, 10);

  const rows = db
    .prepare(
      `SELECT t.moneda_id, m.codigo, m.nombre, t.valor, t.cotizacion, t.total_ars
       FROM tenencias_diarias t
       JOIN monedas m ON m.id = t.moneda_id
       WHERE t.fecha = (SELECT MAX(fecha) FROM tenencias_diarias WHERE fecha <= ?)
       ORDER BY t.total_ars DESC`
    )
    .all(hasta);

  res.json(rows);
});

// Gastos agrupados por concepto, para graficos de torta/barras
router.get('/gastos-por-concepto', requireAuth, (req, res) => {
  const { desde, hasta } = rangoFechas(req);
  const rows = db
    .prepare(
      `SELECT COALESCE(concepto, 'Sin concepto') AS concepto, SUM(total_ars) AS total_ars
       FROM gastos WHERE fecha BETWEEN ? AND ? GROUP BY concepto ORDER BY total_ars DESC`
    )
    .all(desde, hasta);
  res.json(rows);
});

// Utilidad mensual del anio (para el grafico anual tipo la tabla Enero-Diciembre)
router.get('/utilidad-anual', requireAuth, (req, res) => {
  const anio = req.query.anio || new Date().getFullYear();
  const rows = db
    .prepare('SELECT mes, utilidad_us, utilidad_ars FROM utilidad_mensual WHERE anio = ? ORDER BY mes')
    .all(anio);
  res.json({ anio: Number(anio), meses: rows });
});

module.exports = router;
