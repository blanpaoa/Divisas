-- =========================================================================
-- Borra TODO lo cargado con fecha POSTERIOR al 26/08/2026 (27/08, 28/08,
-- y cualquier fecha despues), en todas las tablas que tienen fecha.
-- Despues de correr esto, la app queda con datos hasta el 26/08 inclusive.
--
-- Es seguro -- solo borra donde fecha > '2026-08-26', no toca el 26/08
-- ni ningun dia anterior.
-- =========================================================================

delete from operaciones_cambio where fecha > '2026-08-26';
delete from entradas_prestamos where fecha > '2026-08-26';
delete from salidas_prestamos where fecha > '2026-08-26';
delete from gastos where fecha > '2026-08-26';
delete from movimientos_pesos where fecha > '2026-08-26';
delete from resumen_diario where fecha > '2026-08-26';
delete from otros_saldos_diarios where fecha > '2026-08-26';
delete from ajustes_libres where fecha > '2026-08-26';
delete from cierres_venezuela where fecha > '2026-08-26';
delete from transferencias where fecha > '2026-08-26';
delete from tasas_diarias where fecha > '2026-08-26';
delete from prestamos_pagos where fecha > '2026-08-26';
delete from prestamos where fecha > '2026-08-26';
delete from transferencias_venezuela where fecha > '2026-08-26';

-- =========================================================================
-- Verificacion: esto deberia devolver 0 filas en todas.
-- =========================================================================
select 'operaciones_cambio' as tabla, count(*) from operaciones_cambio where fecha > '2026-08-26'
union all select 'entradas_prestamos', count(*) from entradas_prestamos where fecha > '2026-08-26'
union all select 'salidas_prestamos', count(*) from salidas_prestamos where fecha > '2026-08-26'
union all select 'gastos', count(*) from gastos where fecha > '2026-08-26'
union all select 'movimientos_pesos', count(*) from movimientos_pesos where fecha > '2026-08-26'
union all select 'resumen_diario', count(*) from resumen_diario where fecha > '2026-08-26'
union all select 'otros_saldos_diarios', count(*) from otros_saldos_diarios where fecha > '2026-08-26'
union all select 'ajustes_libres', count(*) from ajustes_libres where fecha > '2026-08-26'
union all select 'cierres_venezuela', count(*) from cierres_venezuela where fecha > '2026-08-26'
union all select 'transferencias', count(*) from transferencias where fecha > '2026-08-26'
union all select 'tasas_diarias', count(*) from tasas_diarias where fecha > '2026-08-26'
union all select 'prestamos_pagos', count(*) from prestamos_pagos where fecha > '2026-08-26'
union all select 'prestamos', count(*) from prestamos where fecha > '2026-08-26'
union all select 'transferencias_venezuela', count(*) from transferencias_venezuela where fecha > '2026-08-26';
