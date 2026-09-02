-- =========================================================================
-- ESTADO FINAL CORRECTO -- 18 al 24/08, validado matematicamente contra la
-- planilla real (diferencia $0.00 en Entradas, Salidas, Existencia, Debemos,
-- pozo de pesos, Cadivi/Venezuela y Faltante/Sobrante, los 6 dias).
-- Seguro de re-correr las veces que haga falta -- usa UPDATE.
-- =========================================================================

update otros_saldos_diarios set latin_debemos_ars=116660860.39, moneygram_nos_debe_ars=116224958.02, debo_venezuela_ars=257336 where fecha='2026-08-18';
update resumen_diario set cadivi_dia_ars=29917.0, cadivi_descuentos_ars=0.0, cadivi_adicional_ars=0.0, utilidad_cadivi_ars=109432.0, faltante_dia_ars=370.0, faltante_descuento_ars=0.0, faltante_sobrante_ars=24953.0 where fecha='2026-08-18';
update salidas_prestamos set valor=759710, total_ars=759710 where fecha='2026-08-18' and concepto='CTA BBVA Lili Venezuela';

update otros_saldos_diarios set latin_debemos_ars=116660860.39, moneygram_nos_debe_ars=113373923.56, debo_venezuela_ars=-265370 where fecha='2026-08-19';
update resumen_diario set cadivi_dia_ars=9615.0, cadivi_descuentos_ars=0.0, cadivi_adicional_ars=0.0, utilidad_cadivi_ars=119047.0, faltante_dia_ars=375.0, faltante_descuento_ars=0.0, faltante_sobrante_ars=24958.0 where fecha='2026-08-19';
update salidas_prestamos set valor=759710, total_ars=759710 where fecha='2026-08-19' and concepto='CTA BBVA Lili Venezuela';

update otros_saldos_diarios set latin_debemos_ars=117085062.33, moneygram_nos_debe_ars=113594419.23, debo_venezuela_ars=-65370 where fecha='2026-08-20';
update resumen_diario set cadivi_dia_ars=16462.0, cadivi_descuentos_ars=0.0, cadivi_adicional_ars=0.0, utilidad_cadivi_ars=135509.0, faltante_dia_ars=6.0, faltante_descuento_ars=0.0, faltante_sobrante_ars=24964.0 where fecha='2026-08-20';
update salidas_prestamos set valor=959710, total_ars=959710 where fecha='2026-08-20' and concepto='CTA BBVA Lili Venezuela';

update otros_saldos_diarios set latin_debemos_ars=117085062.33, moneygram_nos_debe_ars=118106303.47, debo_venezuela_ars=-258978 where fecha='2026-08-21';
update resumen_diario set cadivi_dia_ars=16462.0, cadivi_descuentos_ars=0.0, cadivi_adicional_ars=0.0, utilidad_cadivi_ars=135509.0, faltante_dia_ars=9.0, faltante_descuento_ars=0.0, faltante_sobrante_ars=24967.0 where fecha='2026-08-21';
update salidas_prestamos set valor=766102, total_ars=766102 where fecha='2026-08-21' and concepto='CTA BBVA Lili Venezuela';

update otros_saldos_diarios set latin_debemos_ars=117085062.33, moneygram_nos_debe_ars=120422327.75, debo_venezuela_ars=-163478 where fecha='2026-08-22';
update resumen_diario set cadivi_dia_ars=7346.0, cadivi_descuentos_ars=0.0, cadivi_adicional_ars=0.0, utilidad_cadivi_ars=142855.0, faltante_dia_ars=37.0, faltante_descuento_ars=0.0, faltante_sobrante_ars=25004.0 where fecha='2026-08-22';
update salidas_prestamos set valor=861602, total_ars=861602 where fecha='2026-08-22' and concepto='CTA BBVA Lili Venezuela';

update otros_saldos_diarios set latin_debemos_ars=117965090.06, moneygram_nos_debe_ars=119847929.85, debo_venezuela_ars=-163478 where fecha='2026-08-24';
update resumen_diario set cadivi_dia_ars=34846.0, cadivi_descuentos_ars=0.0, cadivi_adicional_ars=0.0, utilidad_cadivi_ars=177701.0, faltante_dia_ars=37.0, faltante_descuento_ars=39.0, faltante_sobrante_ars=24965.0 where fecha='2026-08-24';
update salidas_prestamos set valor=861602, total_ars=861602 where fecha='2026-08-24' and concepto='CTA BBVA Lili Venezuela';
