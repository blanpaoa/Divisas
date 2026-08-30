-- =========================================================================
-- CARGA HISTORICA: 18 al 24 de agosto 2026
-- Generado automaticamente a partir de los excel reales de la planilla.
-- Validado: el motor de costeo reproduce las 24 posiciones de cierre reales
-- (6 dias x 4 monedas) con precision exacta.
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- IMPORTANTE: correr una sola vez. Si lo corres dos veces vas a duplicar datos.
-- =========================================================================

-- 1) Apertura de saldos (posicion antes del 18/08)
insert into apertura_saldos (moneda_id, fecha, cantidad, costo_promedio) values ((select id from monedas where codigo = 'ARS'), '2026-08-18', 1528449.0, 1.0) on conflict (moneda_id) do update set cantidad = excluded.cantidad, costo_promedio = excluded.costo_promedio, fecha = excluded.fecha;
insert into apertura_saldos (moneda_id, fecha, cantidad, costo_promedio) values ((select id from monedas where codigo = 'USD'), '2026-08-18', 100.0, 1500.0) on conflict (moneda_id) do update set cantidad = excluded.cantidad, costo_promedio = excluded.costo_promedio, fecha = excluded.fecha;
insert into apertura_saldos (moneda_id, fecha, cantidad, costo_promedio) values ((select id from monedas where codigo = 'USD_PEQ'), '2026-08-18', 75.0, 1469.37) on conflict (moneda_id) do update set cantidad = excluded.cantidad, costo_promedio = excluded.costo_promedio, fecha = excluded.fecha;
insert into apertura_saldos (moneda_id, fecha, cantidad, costo_promedio) values ((select id from monedas where codigo = 'EUR'), '2026-08-18', 5.0, 1763.51) on conflict (moneda_id) do update set cantidad = excluded.cantidad, costo_promedio = excluded.costo_promedio, fecha = excluded.fecha;
insert into apertura_saldos (moneda_id, fecha, cantidad, costo_promedio) values ((select id from monedas where codigo = 'REAL'), '2026-08-18', 10.0, 260.0) on conflict (moneda_id) do update set cantidad = excluded.cantidad, costo_promedio = excluded.costo_promedio, fecha = excluded.fecha;
insert into apertura_saldos (moneda_id, fecha, cantidad, costo_promedio) values ((select id from monedas where codigo = 'UYU'), '2026-08-18', 0.0, 21.75) on conflict (moneda_id) do update set cantidad = excluded.cantidad, costo_promedio = excluded.costo_promedio, fecha = excluded.fecha;
insert into apertura_saldos (moneda_id, fecha, cantidad, costo_promedio) values ((select id from monedas where codigo = 'COP'), '2026-08-18', 0.0, 0.065) on conflict (moneda_id) do update set cantidad = excluded.cantidad, costo_promedio = excluded.costo_promedio, fecha = excluded.fecha;
insert into apertura_saldos (moneda_id, fecha, cantidad, costo_promedio) values ((select id from monedas where codigo = 'CLP'), '2026-08-18', 92000.0, 1.08) on conflict (moneda_id) do update set cantidad = excluded.cantidad, costo_promedio = excluded.costo_promedio, fecha = excluded.fecha;
insert into apertura_saldos (moneda_id, fecha, cantidad, costo_promedio) values ((select id from monedas where codigo = 'MXN'), '2026-08-18', 0.0, 7.9) on conflict (moneda_id) do update set cantidad = excluded.cantidad, costo_promedio = excluded.costo_promedio, fecha = excluded.fecha;
insert into apertura_saldos (moneda_id, fecha, cantidad, costo_promedio) values ((select id from monedas where codigo = 'PYG'), '2026-08-18', 0.0, 0.094) on conflict (moneda_id) do update set cantidad = excluded.cantidad, costo_promedio = excluded.costo_promedio, fecha = excluded.fecha;

-- 2) Operaciones de compra/venta (25 operaciones)
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-18', 'compra', (select id from monedas where codigo = 'USD'), 500.0, 1510.0, 755000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-18', 'venta', (select id from monedas where codigo = 'USD'), 200.0, 1555.0, 311000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-18', 'compra', (select id from monedas where codigo = 'USD_PEQ'), 5.0, 1470.0, 7350.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-18', 'compra', (select id from monedas where codigo = 'USD'), 100.0, 1515.0, 151500.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-19', 'compra', (select id from monedas where codigo = 'USD'), 100.0, 1510.0, 151000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-19', 'venta', (select id from monedas where codigo = 'USD'), 500.0, 1555.0, 777500.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-20', 'compra', (select id from monedas where codigo = 'USD'), 100.0, 1510.0, 151000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-20', 'venta', (select id from monedas where codigo = 'USD'), 800.0, 1535.0, 1228000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-20', 'compra', (select id from monedas where codigo = 'USD'), 100.0, 1510.0, 151000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-20', 'compra', (select id from monedas where codigo = 'USD'), 100.0, 1510.0, 151000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-20', 'compra', (select id from monedas where codigo = 'USD'), 200.0, 1510.0, 302000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-20', 'compra', (select id from monedas where codigo = 'USD'), 200.0, 1510.0, 302000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-21', 'compra', (select id from monedas where codigo = 'USD'), 200.0, 1520.0, 304000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-21', 'venta', (select id from monedas where codigo = 'USD'), 300.0, 1550.0, 465000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-21', 'compra', (select id from monedas where codigo = 'USD'), 300.0, 1510.0, 453000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-21', 'compra', (select id from monedas where codigo = 'USD'), 100.0, 1510.0, 151000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-21', 'compra', (select id from monedas where codigo = 'USD'), 400.0, 1510.0, 604000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-22', 'compra', (select id from monedas where codigo = 'USD'), 1000.0, 1520.0, 1520000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-22', 'venta', (select id from monedas where codigo = 'USD'), 200.0, 1550.0, 310000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-22', 'compra', (select id from monedas where codigo = 'EUR'), 100.0, 1780.0, 178000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-22', 'compra', (select id from monedas where codigo = 'USD'), 100.0, 1510.0, 151000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-22', 'venta', (select id from monedas where codigo = 'USD'), 1300.0, 1540.0, 2002000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-24', 'compra', (select id from monedas where codigo = 'USD'), 100.0, 1520.0, 152000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-24', 'compra', (select id from monedas where codigo = 'EUR'), 200.0, 1780.0, 356000.0);
insert into operaciones_cambio (fecha, tipo, moneda_id, cantidad, cotizacion, total_ars) values ('2026-08-24', 'compra', (select id from monedas where codigo = 'USD'), 300.0, 1520.0, 456000.0);

-- 3) Entradas y prestamos
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'CAPITAL- PERDIDAS', (select id from monedas where codigo = 'ARS'), 4391880.0, 885934.0, 3505946.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'ULTIMA UTILI.', (select id from monedas where codigo = 'ARS'), 261579.0, 8206.0, 269785.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'SOBRANTES DEL DIA', (select id from monedas where codigo = 'ARS'), 9600.0, 400.0, 10000.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'UTILIDAD ADICIONAL', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'ABONOS DE CUENTA TRANS, VENEZUELA', (select id from monedas where codigo = 'ARS'), 211960.0, 290414.0, 502374.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'ALO PRESTA  20/07', (select id from monedas where codigo = 'ARS'), 890253.0, 0.0, 890253.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'INGRESOS DE  TRANSFE COLOMBIA PESOS', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'TRANF. DE COLOMBIA', (select id from monedas where codigo = 'USD'), 0.0, 1475.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'ALO PRESTA 15/08', (select id from monedas where codigo = 'USD'), 100.0, 1500.0, 150000.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'CAPITAL- PERDIDAS', (select id from monedas where codigo = 'ARS'), 4391880.0, 885934.0, 3505946.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'ULTIMA UTILI.', (select id from monedas where codigo = 'ARS'), 261579.0, 8206.0, 269785.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'SOBRANTES DEL DIA', (select id from monedas where codigo = 'ARS'), 9600.0, 400.0, 10000.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'UTILIDAD ADICIONAL', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'ABONOS DE CUENTA TRANS, VENEZUELA', (select id from monedas where codigo = 'ARS'), 502374.0, 522706.0, 1025080.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'ALO PRESTA  20/07', (select id from monedas where codigo = 'ARS'), 890253.0, 0.0, 890253.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'INGRESOS DE  TRANSFE COLOMBIA PESOS', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'TRANF. DE COLOMBIA', (select id from monedas where codigo = 'USD'), 0.0, 1475.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'ALO PRESTA 15/08', (select id from monedas where codigo = 'USD'), 100.0, 1500.0, 150000.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'CAPITAL- PERDIDAS', (select id from monedas where codigo = 'ARS'), 4391880.0, 885934.0, 3505946.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'ULTIMA UTILI.', (select id from monedas where codigo = 'ARS'), 261579.0, 8206.0, 269785.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'SOBRANTES DEL DIA', (select id from monedas where codigo = 'ARS'), 9600.0, 400.0, 10000.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'UTILIDAD ADICIONAL', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'ABONOS DE CUENTA TRANS, VENEZUELA', (select id from monedas where codigo = 'ARS'), 502374.0, 522706.0, 1025080.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'ALO PRESTA  20/07', (select id from monedas where codigo = 'ARS'), 890253.0, 0.0, 890253.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'INGRESOS DE  TRANSFE COLOMBIA PESOS', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'TRANF. DE COLOMBIA', (select id from monedas where codigo = 'USD'), 0.0, 1475.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'ALO PRESTA 15/08', (select id from monedas where codigo = 'USD'), 100.0, 1500.0, 150000.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'CAPITAL- PERDIDAS', (select id from monedas where codigo = 'ARS'), 4391880.0, 885934.0, 3505946.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'ULTIMA UTILI.', (select id from monedas where codigo = 'ARS'), 261579.0, 8206.0, 269785.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'SOBRANTES DEL DIA', (select id from monedas where codigo = 'ARS'), 10000.0, 3200.0, 13200.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'UTILIDAD ADICIONAL', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'ABONOS DE CUENTA TRANS, VENEZUELA', (select id from monedas where codigo = 'ARS'), 502374.0, 522706.0, 1025080.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'ALO PRESTA 21/08', (select id from monedas where codigo = 'ARS'), 4000000.0, 0.0, 4000000.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'ALO PRESTA  20/07', (select id from monedas where codigo = 'ARS'), 890253.0, 0.0, 890253.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'INGRESOS DE  TRANSFE COLOMBIA PESOS', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'TRANF. DE COLOMBIA', (select id from monedas where codigo = 'USD'), 0.0, 1475.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'ALO PRESTA 15/08', (select id from monedas where codigo = 'USD'), 100.0, 1500.0, 150000.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'CAPITAL- PERDIDAS', (select id from monedas where codigo = 'ARS'), 4391880.0, 885934.0, 3505946.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'ULTIMA UTILI.', (select id from monedas where codigo = 'ARS'), 261579.0, 8206.0, 269785.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'SOBRANTES DEL DIA', (select id from monedas where codigo = 'ARS'), 10000.0, 3200.0, 13200.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'UTILIDAD ADICIONAL', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'ABONOS DE CUENTA TRANS, VENEZUELA', (select id from monedas where codigo = 'ARS'), 502374.0, 522706.0, 1025080.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'ALO PRESTA 21/08', (select id from monedas where codigo = 'ARS'), 2000000.0, 0.0, 2000000.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'ALO PRESTA  20/07', (select id from monedas where codigo = 'ARS'), 890253.0, 0.0, 890253.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'INGRESOS DE  TRANSFE COLOMBIA PESOS', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'TRANF. DE COLOMBIA', (select id from monedas where codigo = 'USD'), 0.0, 1475.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'ALO PRESTA 15/08', (select id from monedas where codigo = 'USD'), 100.0, 1500.0, 150000.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'CAPITAL- PERDIDAS', (select id from monedas where codigo = 'ARS'), 4391880.0, 885934.0, 3505946.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'ULTIMA UTILI.', (select id from monedas where codigo = 'ARS'), 261579.0, 8206.0, 269785.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'SOBRANTES DEL DIA', (select id from monedas where codigo = 'ARS'), 13200.0, 3500.0, 16700.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'UTILIDAD ADICIONAL', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'SALDO VENEZUELA MEGA ENVIOS 24/08', (select id from monedas where codigo = 'ARS'), 8200.0, 0.0, 8200.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'ABONOS DE CUENTA TRANS, VENEZUELA', (select id from monedas where codigo = 'ARS'), 502374.0, 522706.0, 1025080.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'ALO PRESTA 21/08', (select id from monedas where codigo = 'ARS'), 2000000.0, 0.0, 2000000.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'ALO PRESTA  20/07', (select id from monedas where codigo = 'ARS'), 890253.0, 0.0, 890253.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'INGRESOS DE  TRANSFE COLOMBIA PESOS', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'TRANF. DE COLOMBIA', (select id from monedas where codigo = 'USD'), 0.0, 1475.0, 0.0);
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'ALO PRESTA 15/08', (select id from monedas where codigo = 'USD'), 100.0, 1500.0, 150000.0);

-- 4) Salidas / prestamos otorgados
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 38500.0, 1700.0, 40200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 536620.0, 223090.0, 759710.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 38500.0, 1700.0, 40200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 536620.0, 223090.0, 759710.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 40200.0, 10000.0, 50200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 759710.0, 200000.0, 959710.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 40200.0, 10000.0, 50200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 759710.0, 6392.0, 766102.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 40200.0, 10000.0, 50200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 766102.0, 95500.0, 861602.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 40200.0, 10000.0, 50200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 766102.0, 95500.0, 861602.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);

-- 5) Gastos
insert into gastos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'AYSA', (select id from monedas where codigo = 'ARS'), 46358.0, 0.0, 46358.0);
insert into gastos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'EDESUR', (select id from monedas where codigo = 'ARS'), 108116.0, 0.0, 108116.0);
insert into gastos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'EXPENSAS', (select id from monedas where codigo = 'ARS'), 109440.0, 0.0, 109440.0);
insert into gastos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'BAULERA', (select id from monedas where codigo = 'ARS'), 26500.0, 0.0, 26500.0);
insert into gastos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'TAXI', (select id from monedas where codigo = 'ARS'), 6000.0, 0.0, 6000.0);
insert into gastos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'MONOTRIBUTO ALO', (select id from monedas where codigo = 'ARS'), 522706.0, 0.0, 522706.0);
insert into gastos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'TAXI', (select id from monedas where codigo = 'ARS'), 6000.0, 0.0, 6000.0);
insert into gastos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'MONOTRIBUTO LILI', (select id from monedas where codigo = 'ARS'), 193608.0, 0.0, 193608.0);
insert into gastos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'TRASNPORTE', (select id from monedas where codigo = 'ARS'), 1000.0, 0.0, 1000.0);

-- 6) Cierre diario (utilidad/gastos acumulados)
insert into resumen_diario (fecha, utilidad_diaria_ars, gastos_dia_ars, utilidad_acumulada_ars, gastos_acumulado_ars, faltante_sobrante_ars, total_ars) values ('2026-08-18', 9142.000000000007, 296414.0, 1465444.0, 2079809.0, 370.0, -614365.0) on conflict (fecha) do update set utilidad_diaria_ars=excluded.utilidad_diaria_ars, gastos_dia_ars=excluded.gastos_dia_ars, utilidad_acumulada_ars=excluded.utilidad_acumulada_ars, gastos_acumulado_ars=excluded.gastos_acumulado_ars, faltante_sobrante_ars=excluded.faltante_sobrante_ars, total_ars=excluded.total_ars;
insert into resumen_diario (fecha, utilidad_diaria_ars, gastos_dia_ars, utilidad_acumulada_ars, gastos_acumulado_ars, faltante_sobrante_ars, total_ars) values ('2026-08-19', 22794.99999999996, 522706.0, 1488239.0, 2602515.0, 375.0, -1114276.0) on conflict (fecha) do update set utilidad_diaria_ars=excluded.utilidad_diaria_ars, gastos_dia_ars=excluded.gastos_dia_ars, utilidad_acumulada_ars=excluded.utilidad_acumulada_ars, gastos_acumulado_ars=excluded.gastos_acumulado_ars, faltante_sobrante_ars=excluded.faltante_sobrante_ars, total_ars=excluded.total_ars;
insert into resumen_diario (fecha, utilidad_diaria_ars, gastos_dia_ars, utilidad_acumulada_ars, gastos_acumulado_ars, faltante_sobrante_ars, total_ars) values ('2026-08-20', 20055.99999999995, 6000.0, 1508295.0, 2608515.0, 6.0, -1100220.0) on conflict (fecha) do update set utilidad_diaria_ars=excluded.utilidad_diaria_ars, gastos_dia_ars=excluded.gastos_dia_ars, utilidad_acumulada_ars=excluded.utilidad_acumulada_ars, gastos_acumulado_ars=excluded.gastos_acumulado_ars, faltante_sobrante_ars=excluded.faltante_sobrante_ars, total_ars=excluded.total_ars;
insert into resumen_diario (fecha, utilidad_diaria_ars, gastos_dia_ars, utilidad_acumulada_ars, gastos_acumulado_ars, faltante_sobrante_ars, total_ars) values ('2026-08-21', 11400.0, 193608.0, 1519695.0, 2802123.0, 9.0, -1282428.0) on conflict (fecha) do update set utilidad_diaria_ars=excluded.utilidad_diaria_ars, gastos_dia_ars=excluded.gastos_dia_ars, utilidad_acumulada_ars=excluded.utilidad_acumulada_ars, gastos_acumulado_ars=excluded.gastos_acumulado_ars, faltante_sobrante_ars=excluded.faltante_sobrante_ars, total_ars=excluded.total_ars;
insert into resumen_diario (fecha, utilidad_diaria_ars, gastos_dia_ars, utilidad_acumulada_ars, gastos_acumulado_ars, faltante_sobrante_ars, total_ars) values ('2026-08-22', 37500.0, 0.0, 1557195.0, 2802123.0, 37.0, -1244928.0) on conflict (fecha) do update set utilidad_diaria_ars=excluded.utilidad_diaria_ars, gastos_dia_ars=excluded.gastos_dia_ars, utilidad_acumulada_ars=excluded.utilidad_acumulada_ars, gastos_acumulado_ars=excluded.gastos_acumulado_ars, faltante_sobrante_ars=excluded.faltante_sobrante_ars, total_ars=excluded.total_ars;
insert into resumen_diario (fecha, utilidad_diaria_ars, gastos_dia_ars, utilidad_acumulada_ars, gastos_acumulado_ars, faltante_sobrante_ars, total_ars) values ('2026-08-24', 0.0, 1000.0, 1557195.0, 2803123.0, 37.0, -1245928.0) on conflict (fecha) do update set utilidad_diaria_ars=excluded.utilidad_diaria_ars, gastos_dia_ars=excluded.gastos_dia_ars, utilidad_acumulada_ars=excluded.utilidad_acumulada_ars, gastos_acumulado_ars=excluded.gastos_acumulado_ars, faltante_sobrante_ars=excluded.faltante_sobrante_ars, total_ars=excluded.total_ars;

-- 7) Otros saldos (Latin / Moneygram / Venezuela)
insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars) values ('2026-08-18', 116660860.39, 116224958.02, 257336.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars;
insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars) values ('2026-08-19', 116660860.39, 113373923.56, -265370.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars;
insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars) values ('2026-08-20', 117085062.33, 113594419.23, -65370.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars;
insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars) values ('2026-08-21', 117085062.33, 118106303.47, -258978.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars;
insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars) values ('2026-08-22', 117085062.33, 120422327.75, -163478.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars;
insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars) values ('2026-08-24', 117965090.06, 119847929.85, -163478.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars;
-- =========================================================================
-- VERIFICACION: correr esto DESPUES de la carga para confirmar que
-- el motor de costeo reproduce las posiciones correctas.
-- Deberia mostrar, para 2026-08-24 (el ultimo dia cargado):
--   USD = 700, USD_PEQ = 80, EUR = 305, REAL = 10
-- (si no coincide, avisar antes de seguir cargando el 25/08 en adelante)
-- =========================================================================
-- select m.codigo, o.tipo,
--        sum(case when o.tipo='compra' then o.cantidad else -o.cantidad end) as movimiento_neto
-- from operaciones_cambio o join monedas m on m.id = o.moneda_id
-- where o.fecha between '2026-08-18' and '2026-08-24'
-- group by m.codigo, o.tipo
-- order by m.codigo;
