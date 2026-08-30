-- =========================================================================
-- FIX: completa los campos 'dia' de Utilidad Cadivi y Faltante y Sobrante
-- (los desgloses, no solo el total), para que la cadena funcione bien
-- de ahora en adelante. Corre DESPUES de la migracion 013.
-- =========================================================================

update resumen_diario set cadivi_dia_ars = 29917.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 370.0, faltante_descuento_ars = 0.0 where fecha = '2026-08-18';
update resumen_diario set cadivi_dia_ars = 9615.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 375.0, faltante_descuento_ars = 0.0 where fecha = '2026-08-19';
update resumen_diario set cadivi_dia_ars = 16462.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 6.0, faltante_descuento_ars = 0.0 where fecha = '2026-08-20';
update resumen_diario set cadivi_dia_ars = 16462.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 9.0, faltante_descuento_ars = 0.0 where fecha = '2026-08-21';
update resumen_diario set cadivi_dia_ars = 7346.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 37.0, faltante_descuento_ars = 0.0 where fecha = '2026-08-22';
update resumen_diario set cadivi_dia_ars = 34846.0, cadivi_descuentos_ars = 0.0, cadivi_adicional_ars = 0.0, faltante_dia_ars = 37.0, faltante_descuento_ars = 39.0 where fecha = '2026-08-24';