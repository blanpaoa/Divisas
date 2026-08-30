-- =========================================================================
-- Migracion: acumulados de Utilidad y Gastos SEPARADOS (en vez de un
-- unico "total acumulado" mezclado), igual que la planilla real:
--
--   UTILIDAD ACUMULADA(hoy) = utilidad de hoy + UTILIDAD ACUMULADA(ayer)
--   GASTOS ACUMULADO(hoy)   = gastos de hoy   + GASTOS ACUMULADO(ayer)
--   TOTAL = UTILIDAD ACUMULADA - GASTOS ACUMULADO
--
-- Se mantienen separados porque en la planilla real se pueden resetear
-- de forma independiente (por ejemplo, resetear solo gastos en un corte
-- de mes, sin tocar la utilidad acumulada).
--
-- Tambien agrega "Debo a Venezuela" como otro saldo de arrastre manual,
-- con la misma logica que Latin/Moneygram.
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table resumen_diario add column if not exists gastos_dia_ars numeric not null default 0;
alter table resumen_diario add column if not exists utilidad_acumulada_ars numeric not null default 0;
alter table resumen_diario add column if not exists gastos_acumulado_ars numeric not null default 0;
alter table resumen_diario add column if not exists resetear_utilidad_acumulada boolean not null default false;
alter table resumen_diario add column if not exists resetear_gastos_acumulado boolean not null default false;

alter table otros_saldos_diarios add column if not exists debo_venezuela_ars numeric not null default 0;

-- Nota: las columnas viejas (saldo_dia_anterior_ars, resetear_acumulado)
-- quedan en la tabla por compatibilidad pero ya no se usan para calcular
-- el TOTAL -- ahora se deriva de utilidad_acumulada_ars - gastos_acumulado_ars.
