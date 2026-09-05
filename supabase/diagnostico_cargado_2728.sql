select 'operaciones' as tabla, fecha, tipo, m.codigo as moneda, cantidad, cotizacion, null as concepto, null as monto
from operaciones_cambio o join monedas m on m.id = o.moneda_id
where fecha in ('2026-08-27','2026-08-28')

union all

select 'movimientos_pesos', fecha, tipo, concepto, null, null, observaciones, monto
from movimientos_pesos
where fecha in ('2026-08-27','2026-08-28')

order by fecha, tabla;
