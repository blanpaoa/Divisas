// Operaciones de compra / venta de divisas (libro diario de la planilla 2)
const crearRouterCrud = require('./_crudFactory');
module.exports = crearRouterCrud('operaciones_cambio', ['fecha', 'tipo', 'moneda_id', 'cantidad', 'cotizacion', 'total_ars']);
