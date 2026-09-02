-- =========================================================================
-- Migracion: "concepto_vinculado" en prestamos -- permite que un prestamo
-- se sincronice con un renglon YA EXISTENTE de Entradas/Salidas (en vez
-- de crear uno nuevo con "#ID"), para importar prestamos que ya estaban
-- cargados como renglones sueltos antes de que existiera este modulo.
--
-- Si concepto_vinculado es NULL, se sigue usando el patron automatico
-- "Persona - Concepto #ID" como hasta ahora.
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table prestamos add column if not exists concepto_vinculado text;
