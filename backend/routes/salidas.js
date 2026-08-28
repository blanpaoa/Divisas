// Salidas / prestamos otorgados / gastos de casa
const crearRouterCrud = require('./_crudFactory');
module.exports = crearRouterCrud('salidas_prestamos', ['fecha', 'concepto', 'moneda_id', 'valor', 'porcentaje', 'total_ars']);
