select fecha, utilidad_diaria_ars, gastos_dia_ars, utilidad_acumulada_ars, gastos_acumulado_ars,
       cadivi_dia_ars, utilidad_cadivi_ars, faltante_dia_ars, faltante_sobrante_ars, total_ars
from resumen_diario
where fecha between '2026-08-24' and '2026-08-26'
order by fecha;

select fecha, latin_debemos_ars, moneygram_nos_debe_ars, debo_venezuela_ars
from otros_saldos_diarios
where fecha between '2026-08-24' and '2026-08-26'
order by fecha;
