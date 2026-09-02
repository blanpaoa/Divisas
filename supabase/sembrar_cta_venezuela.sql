-- Siembra el saldo historico real de "CTA BBVA Lili Venezuela" en Salidas
-- para el 24/08 (861.602), y en otros_saldos_diarios (para que la cadena
-- de Debo a Venezuela arranque bien desde ahi en adelante).

insert into salidas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars)
values ('2026-08-24', 'CTA BBVA Lili Venezuela', (select id from monedas where codigo='ARS'), 861602, 0, 861602);

update otros_saldos_diarios set debo_venezuela_ars = 861602 where fecha = '2026-08-24';
