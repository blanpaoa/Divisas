-- =========================================================================
-- Migracion: Utilidad Cadivi y Faltante y Sobrante pasan a ser cadenas
-- que se arrastran dia a dia (como Utilidad/Gastos acumulado), en vez
-- de un numero suelto que no se encadenaba con el dia anterior.
--
--   utilidad_cadivi_ars(hoy) = utilidad_cadivi_ars(ayer)
--                               + cadivi_dia_ars(hoy) - cadivi_descuentos_ars(hoy)
--                               + cadivi_adicional_ars(hoy)
--
--   faltante_sobrante_ars(hoy) = faltante_sobrante_ars(ayer)
--                                  + faltante_dia_ars(hoy) - faltante_descuento_ars(hoy)
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table resumen_diario add column if not exists cadivi_dia_ars numeric not null default 0;
alter table resumen_diario add column if not exists cadivi_descuentos_ars numeric not null default 0;
alter table resumen_diario add column if not exists cadivi_adicional_ars numeric not null default 0;
alter table resumen_diario add column if not exists resetear_cadivi boolean not null default false;

alter table resumen_diario add column if not exists faltante_dia_ars numeric not null default 0;
alter table resumen_diario add column if not exists faltante_descuento_ars numeric not null default 0;
alter table resumen_diario add column if not exists resetear_faltante boolean not null default false;
