-- =========================================================================
-- Importa como Prestamos formales los renglones que ya estaban sueltos
-- en Entradas/Salidas, vinculandolos al mismo concepto existente (no
-- crea renglones duplicados -- concepto_vinculado usa el texto EXACTO
-- que ya tenian, respetando los espacios tal cual).
--
-- KEILLY DEBE PRESTAMO no se importa porque esta en 0 (nada que trackear).
--
-- Correr esto DESPUES de la migracion 017_concepto_vinculado.sql
-- =========================================================================

insert into prestamos (tipo, persona, concepto, moneda_id, monto_original, fecha, concepto_vinculado) values
  ('debemos', 'ALO', 'Presta 21/08', (select id from monedas where codigo='ARS'), 2000000, '2026-08-24', 'ALO PRESTA 21/08'),
  ('debemos', 'ALO', 'Presta 20/07', (select id from monedas where codigo='ARS'), 890253, '2026-08-24', 'ALO PRESTA  20/07'),
  ('debemos', 'ALO', 'Presta 15/08', (select id from monedas where codigo='USD'), 100, '2026-08-24', 'ALO PRESTA 15/08'),
  ('nos_deben', 'ALO', 'Retiro Personales', (select id from monedas where codigo='ARS'), 120000, '2026-08-24', 'ALO  RETIRO PERSONALES'),
  ('nos_deben', 'ALO', 'Retiro 10/08', (select id from monedas where codigo='USD'), 500, '2026-08-24', 'ALO RETIR 10/08');
