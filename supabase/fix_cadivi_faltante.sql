-- =========================================================================
-- FIX: Utilidad Cadivi + Faltante y Sobrante correctos (los que realmente
-- alimentan el calculo de DEBEMOS), para los 6 dias historicos.
-- Seguro de correr -- usa 'on conflict (fecha) do update', no duplica.
-- =========================================================================

update resumen_diario set utilidad_cadivi_ars = 109432.0, faltante_sobrante_ars = 24953.0 where fecha = '2026-08-18';
update resumen_diario set utilidad_cadivi_ars = 119047.0, faltante_sobrante_ars = 24958.0 where fecha = '2026-08-19';
update resumen_diario set utilidad_cadivi_ars = 135509.0, faltante_sobrante_ars = 24964.0 where fecha = '2026-08-20';
update resumen_diario set utilidad_cadivi_ars = 135509.0, faltante_sobrante_ars = 24967.0 where fecha = '2026-08-21';
update resumen_diario set utilidad_cadivi_ars = 142855.0, faltante_sobrante_ars = 25004.0 where fecha = '2026-08-22';
update resumen_diario set utilidad_cadivi_ars = 177701.0, faltante_sobrante_ars = 24965.0 where fecha = '2026-08-24';