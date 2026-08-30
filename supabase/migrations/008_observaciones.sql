-- =========================================================================
-- Migracion: agrega un campo de observaciones a Entradas, Salidas y Gastos
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table entradas_prestamos add column if not exists observaciones text;
alter table salidas_prestamos add column if not exists observaciones text;
alter table gastos add column if not exists observaciones text;
