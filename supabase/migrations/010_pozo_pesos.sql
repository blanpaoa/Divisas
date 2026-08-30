-- =========================================================================
-- Migracion: campos de "otras salidas" y "otras entradas" de pesos,
-- necesarios para calcular el pozo de pesos dia a dia.
--
-- Formula confirmada directamente contra la celda real de la planilla
-- (formula de Google Sheets capturada de la barra de formulas) y
-- validada con precision exacta contra 6 dias reales:
--
--   saldo_pesos(hoy) = saldo_pesos(ayer) - compras_pesos(hoy) + ventas_pesos(hoy)
--                      - otras_salidas(hoy) + otras_entradas(hoy)
--
-- "otras_salidas" / "otras_entradas" son los totales de la tabla
-- SALIDA DE PESOS / ENTRADA DE PESOS de la planilla de operaciones:
-- pagos/ingresos de Latin Express, Moneygram, y otros movimientos de
-- caja que no son compra/venta de divisas (efectivo, cuentas BBVA,
-- pagos varios).
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table otros_saldos_diarios add column if not exists otras_salidas_pesos_ars numeric not null default 0;
alter table otros_saldos_diarios add column if not exists otras_entradas_pesos_ars numeric not null default 0;
