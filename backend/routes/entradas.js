// Entradas y prestamos recibidos (CAPITAL, ULTIMA UTILIDAD, INGRESOS TRANSF COLOMBIA, etc.)
const crearRouterCrud = require('./_crudFactory');
module.exports = crearRouterCrud('entradas_prestamos', ['fecha', 'concepto', 'moneda_id', 'valor', 'porcentaje', 'total_ars']);
