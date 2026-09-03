-- =========================================================================
-- Corrige 'otras_salidas_pesos_ars'/'otras_entradas_pesos_ars' de los 6 dias
-- historicos para que NO incluyan Gastos ni Utilidad Cadivi/Venezuela --
-- porque ahora el motor los suma automaticamente desde sus propias tablas
-- (Gastos, Cierre diario). Sin este ajuste, esos 6 dias contarian esos
-- montos DOS VECES. El resultado final del pozo de pesos no cambia.
-- =========================================================================

update otros_saldos_diarios set otras_salidas_pesos_ars=7287490.0, otras_entradas_pesos_ars=8615084.0 where fecha='2026-08-18';
update otros_saldos_diarios set otras_salidas_pesos_ars=2339347.0, otras_entradas_pesos_ars=5713091.0 where fecha='2026-08-19';
update otros_saldos_diarios set otras_salidas_pesos_ars=5878829.0, otras_entradas_pesos_ars=5835739.0 where fecha='2026-08-20';
update otros_saldos_diarios set otras_salidas_pesos_ars=4511881.0, otras_entradas_pesos_ars=4180346.0 where fecha='2026-08-21';
update otros_saldos_diarios set otras_salidas_pesos_ars=4499724.0, otras_entradas_pesos_ars=88238.0 where fecha='2026-08-22';
update otros_saldos_diarios set otras_salidas_pesos_ars=6288597.0, otras_entradas_pesos_ars=7754681.0 where fecha='2026-08-24';