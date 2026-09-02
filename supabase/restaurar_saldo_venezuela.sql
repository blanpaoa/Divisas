-- Restaura el registro borrado por error: "SALDO VENEZUELA MEGA ENVIOS 24/08"
-- (se habia borrado desde 'estado vigente' del 25/08, lo que en realidad
-- borro el registro original del 24/08, haciendolo desaparecer de todos
-- los dias desde entonces)
insert into entradas_prestamos (fecha, concepto, moneda_id, valor, porcentaje, total_ars)
values ('2026-08-24', 'SALDO VENEZUELA MEGA ENVIOS 24/08', (select id from monedas where codigo='ARS'), 8200, 0, 8200);
