// Gastos operativos
const crearRouterCrud = require('./_crudFactory');
module.exports = crearRouterCrud('gastos', ['fecha', 'concepto', 'moneda_id', 'valor', 'porcentaje', 'total_ars']);
