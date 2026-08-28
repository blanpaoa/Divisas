// Tenencias diarias por moneda (tabla "MONEDA / VALOR / % / TOTAL AR" de la planilla)
const crearRouterCrud = require('./_crudFactory');
module.exports = crearRouterCrud('tenencias_diarias', ['fecha', 'moneda_id', 'valor', 'cotizacion', 'total_ars']);
