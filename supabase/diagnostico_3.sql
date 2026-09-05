select fecha, utilidad_diaria_ars, gastos_dia_ars, utilidad_acumulada_ars, gastos_acumulado_ars,
       cadivi_dia_ars, utilidad_cadivi_ars, faltante_dia_ars, faltante_sobrante_ars, total_ars
from resumen_diario
where fecha >= '2026-08-24'
order by fecha;
