-- =========================================================================
-- CORRECCIONES DE DATOS (todas seguras de re-correr, no duplican nada)
-- Esto es TODO lo que falta aplicar despues de la carga historica inicial
-- (esa NO hay que repetirla -- ya esta cargada, repetirla duplicaria
-- operaciones/entradas/gastos).
-- Corre esto ENTERO de una sola vez, DESPUES de correr
-- todas_las_migraciones.sql.
-- =========================================================================


-- ============ fix_salidas_prestamos.sql ============
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

-- ============ fix_otros_saldos_pesos.sql ============
-- =========================================================================
-- FIX: actualiza solo la tabla otros_saldos_diarios con los valores
-- correctos de "otras salidas/entradas de pesos" (las columnas que
-- faltaban cuando corriste el script original).
-- Es seguro correr esto -- usa "on conflict (fecha) do update", no duplica nada.
-- =========================================================================

insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars, otras_salidas_pesos_ars, otras_entradas_pesos_ars) values ('2026-08-18', 116660860.39, 116224958.02, 257336.0, 7583904.0, 8645001.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars, otras_salidas_pesos_ars=excluded.otras_salidas_pesos_ars, otras_entradas_pesos_ars=excluded.otras_entradas_pesos_ars;
insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars, otras_salidas_pesos_ars, otras_entradas_pesos_ars) values ('2026-08-19', 116660860.39, 113373923.56, -265370.0, 2862053.0, 5722706.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars, otras_salidas_pesos_ars=excluded.otras_salidas_pesos_ars, otras_entradas_pesos_ars=excluded.otras_entradas_pesos_ars;
insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars, otras_salidas_pesos_ars, otras_entradas_pesos_ars) values ('2026-08-20', 117085062.33, 113594419.23, -65370.0, 5884829.0, 5852201.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars, otras_salidas_pesos_ars=excluded.otras_salidas_pesos_ars, otras_entradas_pesos_ars=excluded.otras_entradas_pesos_ars;
insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars, otras_salidas_pesos_ars, otras_entradas_pesos_ars) values ('2026-08-21', 117085062.33, 118106303.47, -258978.0, 4705489.0, 4196808.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars, otras_salidas_pesos_ars=excluded.otras_salidas_pesos_ars, otras_entradas_pesos_ars=excluded.otras_entradas_pesos_ars;
insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars, otras_salidas_pesos_ars, otras_entradas_pesos_ars) values ('2026-08-22', 117085062.33, 120422327.75, -163478.0, 4499724.0, 95584.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars, otras_salidas_pesos_ars=excluded.otras_salidas_pesos_ars, otras_entradas_pesos_ars=excluded.otras_entradas_pesos_ars;
insert into otros_saldos_diarios (fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars, otras_salidas_pesos_ars, otras_entradas_pesos_ars) values ('2026-08-24', 117965090.06, 119847929.85, -163478.0, 6289597.0, 7789527.0) on conflict (fecha) do update set latin_debemos_ars=excluded.latin_debemos_ars, moneygram_nos_debe_ars=excluded.moneygram_nos_debe_ars, debo_venezuela_ars=excluded.debo_venezuela_ars, otras_salidas_pesos_ars=excluded.otras_salidas_pesos_ars, otras_entradas_pesos_ars=excluded.otras_entradas_pesos_ars;


-- ============ fix_cadivi_faltante.sql ============
-- =========================================================================
-- FIX: Utilidad Cadivi + Faltante y Sobrante correctos (los que realmente
-- alimentan el calculo de DEBEMOS), para los 6 dias historicos.
-- Seguro de correr -- usa 'on conflict (fecha) do update', no duplica.
-- =========================================================================

update resumen_diario set utilidad_cadivi_ars = 109432.0, faltante_sobrante_ars = 24953.0 where fecha = '2026-08-18';
update resumen_diario set utilidad_cadivi_ars = 119047.0, faltante_sobrante_ars = 24958.0 where fecha = '2026-08-19';
update resumen_diario set utilidad_cadivi_ars = 135509.0, faltante_sobrante_ars = 24964.0 where fecha = '2026-08-20';
update resumen_diario set utilidad_cadivi_ars = 135509.0, faltante_sobrante_ars = 24967.0 where fecha = '2026-08-21';
update resumen_diario set utilidad_cadivi_ars = 142855.0, faltante_sobrante_ars = 25004.0 where fecha = '2026-08-22';
update resumen_diario set utilidad_cadivi_ars = 177701.0, faltante_sobrante_ars = 24965.0 where fecha = '2026-08-24';

-- ============ fix_cadivi_faltante_dia.sql ============
-- =========================================================================
-- FIX: completa los campos 'dia' de Utilidad Cadivi y Faltante y Sobrante
-- (los desgloses, no solo el total), para que la cadena funcione bien
-- de ahora en adelante. Corre DESPUES de la migracion 013.
-- =========================================================================

update resumen_diario set cadivi_dia_ars = 29917.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 370.0, faltante_descuento_ars = 0.0 where fecha = '2026-08-18';
update resumen_diario set cadivi_dia_ars = 9615.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 375.0, faltante_descuento_ars = 0.0 where fecha = '2026-08-19';
update resumen_diario set cadivi_dia_ars = 16462.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 6.0, faltante_descuento_ars = 0.0 where fecha = '2026-08-20';
update resumen_diario set cadivi_dia_ars = 16462.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 9.0, faltante_descuento_ars = 0.0 where fecha = '2026-08-21';
update resumen_diario set cadivi_dia_ars = 7346.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 37.0, faltante_descuento_ars = 0.0 where fecha = '2026-08-22';
update resumen_diario set cadivi_dia_ars = 34846.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 37.0, faltante_descuento_ars = 39.0 where fecha = '2026-08-24';
