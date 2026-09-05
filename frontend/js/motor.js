/**
 * Motor de costeo promedio ponderado (WAC) para operaciones de cambio de divisas.
 *
 * Reglas confirmadas contra la planilla original (verificado en 173 dias reales):
 * 1. Cada dia se procesan primero todas las COMPRAS (actualizan el costo promedio
 *    ponderado de la tenencia), y despues todas las VENTAS (realizan utilidad
 *    usando ese costo promedio ya actualizado, y reducen la cantidad).
 * 2. costo_promedio_nuevo = (cantidad_anterior * costo_anterior + cantidad_comprada * precio_compra)
 *                           / (cantidad_anterior + cantidad_comprada)
 * 3. utilidad_venta = cantidad_vendida * (precio_venta - costo_promedio_vigente)
 * 4. La tenencia se valua siempre al costo promedio ponderado (no a cotizacion de mercado).
 */
function calcularPosiciones(aperturas, operaciones) {
  // aperturas: [{moneda_id, cantidad, costo_promedio}]
  // operaciones: [{fecha, tipo:'compra'|'venta', moneda_id, cantidad, cotizacion}]
  const posiciones = {}; // moneda_id -> {cantidad, costo_promedio}
  aperturas.forEach((a) => {
    posiciones[a.moneda_id] = { cantidad: Number(a.cantidad), costo_promedio: Number(a.costo_promedio) };
  });

  // Agrupar operaciones por fecha, y dentro de cada fecha por moneda
  const porFecha = {};
  operaciones.forEach((op) => {
    porFecha[op.fecha] = porFecha[op.fecha] || [];
    porFecha[op.fecha].push(op);
  });

  const fechas = Object.keys(porFecha).sort();
  const resultado = {}; // fecha -> { monedas: {moneda_id: {cantidad, costo_promedio, utilidad}}, utilidad_total }

  for (const fecha of fechas) {
    const ops = porFecha[fecha];
    const utilidadPorMoneda = {};
    const cantidadVendidaPorMoneda = {};

    // 1) compras primero
    ops.filter((o) => o.tipo === 'compra').forEach((o) => {
      const pos = posiciones[o.moneda_id] || { cantidad: 0, costo_promedio: 0 };
      const cantidadNueva = pos.cantidad + Number(o.cantidad);
      const costoNuevo = cantidadNueva === 0
        ? 0
        : (pos.cantidad * pos.costo_promedio + Number(o.cantidad) * Number(o.cotizacion)) / cantidadNueva;
      posiciones[o.moneda_id] = { cantidad: cantidadNueva, costo_promedio: costoNuevo };
    });

    // 2) ventas despues (usan el costo promedio ya actualizado por las compras del mismo dia)
    ops.filter((o) => o.tipo === 'venta').forEach((o) => {
      const pos = posiciones[o.moneda_id] || { cantidad: 0, costo_promedio: 0 };
      const utilidad = Number(o.cantidad) * (Number(o.cotizacion) - pos.costo_promedio);
      utilidadPorMoneda[o.moneda_id] = (utilidadPorMoneda[o.moneda_id] || 0) + utilidad;
      cantidadVendidaPorMoneda[o.moneda_id] = (cantidadVendidaPorMoneda[o.moneda_id] || 0) + Number(o.cantidad);
      posiciones[o.moneda_id] = { cantidad: pos.cantidad - Number(o.cantidad), costo_promedio: pos.costo_promedio };
    });

    const snapshot = {};
    let utilidad_total = 0;
    Object.entries(posiciones).forEach(([monedaId, pos]) => {
      snapshot[monedaId] = { ...pos };
    });
    Object.values(utilidadPorMoneda).forEach((u) => { utilidad_total += u; });

    resultado[fecha] = {
      monedas: snapshot,
      utilidad_por_moneda: utilidadPorMoneda,
      cantidad_vendida_por_moneda: cantidadVendidaPorMoneda,
      utilidad_total,
    };
  }

  return resultado;
}

/**
 * Calcula el saldo de PESOS (ARS) dia a dia. Formula confirmada
 * directamente contra la celda real de la planilla (con captura de la
 * barra de formulas) y validada con precision exacta contra 6 dias
 * reales:
 *
 *   saldo(hoy) = saldo(ayer) - compras_pesos(hoy) + ventas_pesos(hoy)
 *                - otras_salidas(hoy) + otras_entradas(hoy)
 *
 * "otras_salidas"/"otras_entradas" son los totales de la tabla
 * SALIDA DE PESOS / ENTRADA DE PESOS de la planilla de operaciones
 * (pagos/ingresos de Latin Express, Moneygram, y varios otros
 * movimientos de caja que no son compra/venta de divisas).
 */
function calcularSaldoPesos(aperturaPesos, operaciones, otrosPesosPorFecha) {
  // Agrupar compras/ventas en pesos por fecha
  const porFecha = {};
  operaciones.forEach((o) => {
    porFecha[o.fecha] = porFecha[o.fecha] || { compras: 0, ventas: 0 };
    const monto = Number(o.cantidad) * Number(o.cotizacion);
    if (o.tipo === 'compra') porFecha[o.fecha].compras += monto;
    else porFecha[o.fecha].ventas += monto;
  });

  // otrosPesosPorFecha: [{ fecha, otras_salidas, otras_entradas }]
  otrosPesosPorFecha.forEach((o) => {
    porFecha[o.fecha] = porFecha[o.fecha] || { compras: 0, ventas: 0 };
    porFecha[o.fecha].otras_salidas = Number(o.otras_salidas) || 0;
    porFecha[o.fecha].otras_entradas = Number(o.otras_entradas) || 0;
  });

  const fechas = Object.keys(porFecha).sort();
  let saldo = Number(aperturaPesos) || 0;
  const resultado = {};
  for (const fecha of fechas) {
    const d = porFecha[fecha];
    saldo = saldo - (d.compras || 0) + (d.ventas || 0) - (d.otras_salidas || 0) + (d.otras_entradas || 0);
    resultado[fecha] = saldo;
  }
  return resultado; // { fecha: saldo_al_cierre_de_ese_dia }
}

// Exponer tambien como objeto global para uso directo en el navegador (sin bundler)
if (typeof window !== 'undefined') {
  window.MotorCosteo = { calcularPosiciones, calcularSaldoPesos };
}
if (typeof module !== 'undefined') {
  module.exports = { calcularPosiciones, calcularSaldoPesos };
}
