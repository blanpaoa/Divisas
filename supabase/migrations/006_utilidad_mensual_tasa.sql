-- =========================================================================
-- Migracion: agrega la tasa de cierre a utilidad_mensual, para poder
-- derivar "Total US" = Utilidades Libres (ARS) / Tasa de cierre,
-- igual que en la planilla original (columnas TASA US CIERRE /
-- UTILIDADES LIBRES / TOTAL US).
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table utilidad_mensual add column if not exists tasa_cierre numeric not null default 0;

-- Nota: las columnas "utilidad_us" y "utilidad_ars" ya existentes se
-- siguen usando, pero ahora se interpretan como:
--   utilidad_ars -> "Utilidades Libres" (ARS) del mes
--   utilidad_us  -> "Total US" = utilidad_ars / tasa_cierre (se calcula
--                    solo en la app, pero se guarda tambien por si
--                    quieren ajustarlo a mano)
