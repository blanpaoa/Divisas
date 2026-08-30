-- =========================================================================
-- FIX: la carga original de SALIDAS estaba incompleta (le faltaban filas)
-- Este script borra las salidas de esos 6 dias y las vuelve a cargar completas.
-- Es seguro correrlo -- primero borra, despues inserta, sin duplicar.
-- =========================================================================

delete from salidas_prestamos where fecha between '2026-08-18' and '2026-08-24';

insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 38500.0, 1700.0, 40200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 536620.0, 223090.0, 759710.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'ALO  RETIRO PERSONALES', (select id from monedas where codigo = 'ARS'), 120000.0, 0.0, 120000.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'PAGOS TRANSFERE. COLOMBIA', (select id from monedas where codigo = 'ARS'), 599700.0, 50000.0, 649700.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-18', 'ALO RETIR 10/08', (select id from monedas where codigo = 'USD'), 500.0, 1490.0, 745000.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 38500.0, 1700.0, 40200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 536620.0, 223090.0, 759710.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'ALO  RETIRO PERSONALES', (select id from monedas where codigo = 'ARS'), 120000.0, 0.0, 120000.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'PAGOS TRANSFERE. COLOMBIA', (select id from monedas where codigo = 'ARS'), 599700.0, 50000.0, 649700.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-19', 'ALO RETIR 10/08', (select id from monedas where codigo = 'USD'), 500.0, 1490.0, 745000.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 40200.0, 10000.0, 50200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 759710.0, 200000.0, 959710.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'ALO  RETIRO PERSONALES', (select id from monedas where codigo = 'ARS'), 120000.0, 0.0, 120000.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'PAGOS TRANSFERE. COLOMBIA', (select id from monedas where codigo = 'ARS'), 649700.0, 36800.0, 686500.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-20', 'ALO RETIR 10/08', (select id from monedas where codigo = 'USD'), 500.0, 1490.0, 745000.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 40200.0, 10000.0, 50200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 759710.0, 6392.0, 766102.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'ALO  RETIRO PERSONALES', (select id from monedas where codigo = 'ARS'), 120000.0, 0.0, 120000.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'PAGOS TRANSFERE. COLOMBIA', (select id from monedas where codigo = 'ARS'), 649700.0, 36800.0, 686500.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-21', 'ALO RETIR 10/08', (select id from monedas where codigo = 'USD'), 500.0, 1490.0, 745000.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 40200.0, 10000.0, 50200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 766102.0, 95500.0, 861602.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'ALO  RETIRO PERSONALES', (select id from monedas where codigo = 'ARS'), 120000.0, 0.0, 120000.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'PAGOS TRANSFERE. COLOMBIA', (select id from monedas where codigo = 'ARS'), 649700.0, 36800.0, 686500.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-22', 'ALO RETIR 10/08', (select id from monedas where codigo = 'USD'), 500.0, 1490.0, 745000.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'KEILLY  DEBE PRESTAMO', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'FALTANTES FISICOS', (select id from monedas where codigo = 'ARS'), 40200.0, 10000.0, 50200.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'CTA BBVA  LILI VENEZUELA', (select id from monedas where codigo = 'ARS'), 766102.0, 95500.0, 861602.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'LILI GASTOS LOCAL 58/59', (select id from monedas where codigo = 'ARS'), 0.0, 0.0, 0.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'ALO  RETIRO PERSONALES', (select id from monedas where codigo = 'ARS'), 120000.0, 0.0, 120000.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'PAGOS TRANSFERE. COLOMBIA', (select id from monedas where codigo = 'ARS'), 649700.0, 36800.0, 686500.0);
insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars) values ('2026-08-24', 'ALO RETIR 10/08', (select id from monedas where codigo = 'USD'), 500.0, 1490.0, 745000.0);