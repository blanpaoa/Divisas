// Transferencias hacia otros paises (Venezuela, Colombia, etc.)
const crearRouterCrud = require('./_crudFactory');
module.exports = crearRouterCrud('transferencias', ['fecha', 'destino', 'tipo', 'moneda_id', 'valor', 'total_ars', 'notas']);
