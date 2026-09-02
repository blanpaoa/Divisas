-- CORRECCION FINAL: "CTA BBVA Lili Venezuela" en Salidas debe ser el
-- BRUTO (861.602 -- lo que salio hacia la cuenta), no el neto. El neto
-- (-163.478) es "Debo a Venezuela", que ya esta bien en otros_saldos_diarios,
-- separado -- no se toca.

update salidas_prestamos set valor = 861602, total_ars = 861602
  where fecha = '2026-08-24' and concepto = 'CTA BBVA Lili Venezuela';
