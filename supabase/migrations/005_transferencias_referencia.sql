-- =========================================================================
-- Migracion: agrega un campo de referencia a transferencias (numero de
-- cuenta o transaccion, ej: "M 37795384"), para el circuito de
-- Colombia / Venezuela (BBVA).
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table transferencias add column if not exists referencia text;
