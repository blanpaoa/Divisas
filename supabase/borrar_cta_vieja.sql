-- Borra la fila vieja de CTA BBVA Lili Venezuela en Salidas (ya no se usa
-- ahi -- de ahora en mas todo lo de CTA va en Movimientos de pesos)
delete from salidas_prestamos where concepto = 'CTA BBVA  LILI VENEZUELA';
delete from salidas_prestamos where concepto ilike '%CTA BBVA%';
