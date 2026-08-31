-- =========================================================================
-- Migracion: conceptos fijos en Movimientos de pesos + Utilidad Venezuela
--
-- 1) Movimientos de pesos pasa a tener un concepto FIJO (MONEY / LATIN /
--    CTA / OTROS) en vez de texto libre, con un campo de observaciones
--    aparte para el detalle (codigo "m XXXXX", nota, etc). Esto hace que
--    las formulas de Latin/Moneygram/Debo-a-Venezuela dejen de depender
--    de reconocer patrones de texto -- ahora filtran directo por concepto.
--
-- 2) Utilidad Venezuela: misma logica de cadena que Utilidad Cadivi
--    (confirmado por el usuario): utilidad_venezuela(hoy) =
--    utilidad_venezuela(ayer) + utilidad_venezuela_dia(hoy)
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table movimientos_pesos add column if not exists observaciones text;

alter table resumen_diario add column if not exists utilidad_venezuela_dia_ars numeric not null default 0;
alter table resumen_diario add column if not exists utilidad_venezuela_ars numeric not null default 0;
alter table resumen_diario add column if not exists resetear_utilidad_venezuela boolean not null default false;
