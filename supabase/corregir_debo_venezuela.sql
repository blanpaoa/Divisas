-- CORRECCION: "Debo a Venezuela" es el NETO (Salida - Entrada), no solo
-- el lado de salida. El valor correcto para el 24/08 es -163.478
-- (861.602 de CTA BBVA - 1.025.080 de Abonos Cuenta Trans Venezuela),
-- confirmado con la formula real de la planilla (=E36-K10).

update otros_saldos_diarios set debo_venezuela_ars = -163478 where fecha = '2026-08-24';
update salidas_prestamos set valor = -163478, total_ars = -163478
  where fecha = '2026-08-24' and concepto = 'CTA BBVA Lili Venezuela';
