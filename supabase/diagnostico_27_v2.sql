select 'operaciones' as tabla, fecha, tipo, m.codigo as moneda, cantidad, cotizacion, null as concepto, null as monto
from operaciones_cambio o join monedas m on m.id = o.moneda_id
where fecha = '2026-08-27'

union all

select 'movimientos_pesos', fecha, tipo, concepto, null, null, observaciones, monto
from movimientos_pesos
where fecha = '2026-08-27'

union all

select 'gastos', fecha, null, m.codigo, null, null, concepto, g.total_ars
from gastos g join monedas m on m.id = g.moneda_id
where fecha = '2026-08-27'

union all

select 'prestamos', fecha, tipo, persona, null, null, concepto, monto_original
from prestamos
where fecha = '2026-08-27'

order by tabla, fecha;
