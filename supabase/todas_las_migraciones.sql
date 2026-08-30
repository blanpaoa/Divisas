-- =========================================================================
-- TODAS LAS MIGRACIONES EN ORDEN (002 a 015)
-- Segura de correr aunque ya hayas corrido alguna antes -- todas usan
-- "IF NOT EXISTS" / "ON CONFLICT", asi que lo que ya existe no se toca.
-- Corre esto ENTERO de una sola vez en el SQL Editor de Supabase.
-- =========================================================================


-- ============ 002_tasas_diarias.sql ============
-- =========================================================================
-- Migracion: tabla de "tasa del dia" por moneda.
-- Solo el rol "admin" puede cargarla / editarla / borrarla.
-- Todos los roles activos (admin, operador, visor) la pueden leer.
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- (si ya corriste supabase/schema.sql antes, con correr SOLO este archivo alcanza)
-- =========================================================================

create table if not exists tasas_diarias (
  id bigint generated always as identity primary key,
  fecha date not null,
  moneda_id bigint not null references monedas(id),
  cotizacion numeric not null default 0,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now(),
  unique (fecha, moneda_id)
);

create index if not exists idx_tasas_fecha on tasas_diarias(fecha);
create index if not exists idx_tasas_moneda on tasas_diarias(moneda_id);

alter table tasas_diarias enable row level security;

-- Cualquier usuario activo puede leer las tasas (las necesita para cargar
-- sus propias operaciones)
drop policy if exists "tasas_select" on tasas_diarias;
create policy "tasas_select" on tasas_diarias
  for select using (mi_rol() is not null);

-- Solo admin puede cargar / editar / borrar la tasa del dia
drop policy if exists "tasas_write_admin" on tasas_diarias;
create policy "tasas_write_admin" on tasas_diarias
  for all using (mi_rol() = 'admin') with check (mi_rol() = 'admin');


-- ============ 003_motor_costeo.sql ============
-- =========================================================================
-- Migracion: motor de costeo promedio ponderado (WAC) para el cierre de caja
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- (requiere haber corrido antes supabase/schema.sql y, si lo usan,
--  supabase/migrations/002_tasas_diarias.sql)
-- =========================================================================

-- ---------------------------------------------------------------------
-- APERTURA DE SALDOS: el punto de partida del motor de costeo.
-- Una fila por moneda = "al empezar a usar la app, teniamos esta cantidad
-- a este costo promedio". A partir de ahi, el motor recalcula todo solo
-- en base a las compras/ventas cargadas en operaciones_cambio.
-- Solo admin la puede cargar/editar (es un dato sensible: define el punto
-- de partida de todos los calculos de utilidad).
-- ---------------------------------------------------------------------
create table if not exists apertura_saldos (
  id bigint generated always as identity primary key,
  moneda_id bigint not null references monedas(id),
  fecha date not null,
  cantidad numeric not null default 0,
  costo_promedio numeric not null default 0,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now(),
  unique (moneda_id)
);

alter table apertura_saldos enable row level security;

drop policy if exists "apertura_select" on apertura_saldos;
create policy "apertura_select" on apertura_saldos
  for select using (mi_rol() is not null);

drop policy if exists "apertura_write_admin" on apertura_saldos;
create policy "apertura_write_admin" on apertura_saldos
  for all using (mi_rol() = 'admin') with check (mi_rol() = 'admin');

-- ---------------------------------------------------------------------
-- OTROS SALDOS DIARIOS: sub-libro de conciliacion con servicios de
-- remesas (Latin Express / MoneyGram u otros). En la planilla original
-- estos numeros son ordenes de magnitud mas grandes que la caja diaria
-- (son un saldo acumulado historico con esos servicios) y quedan
-- deliberadamente fuera del motor de costeo. Se cargan a mano, opcional,
-- y se usan solo para que el chequeo EXISTENCIA vs DEBEMOS pueda cerrar
-- si ustedes quieren llevarlo. Si no lo cargan, quedan en 0 y el chequeo
-- se hace solo con la caja "core" (tenencias, entradas, salidas, gastos).
-- ---------------------------------------------------------------------
create table if not exists otros_saldos_diarios (
  id bigint generated always as identity primary key,
  fecha date not null unique,
  latin_debemos_ars numeric not null default 0,
  moneygram_nos_debe_ars numeric not null default 0,
  notas text,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

alter table otros_saldos_diarios enable row level security;

drop policy if exists "otros_saldos_select" on otros_saldos_diarios;
create policy "otros_saldos_select" on otros_saldos_diarios
  for select using (mi_rol() is not null);

drop policy if exists "otros_saldos_write" on otros_saldos_diarios;
create policy "otros_saldos_write" on otros_saldos_diarios
  for all using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

-- ---------------------------------------------------------------------
-- RESUMEN_DIARIO: agregamos la marca de "reset" del acumulado.
-- En la planilla original, el TOTAL de un dia normalmente arrastra el
-- del dia anterior (TOTAL_hoy = utilidad - gastos + TOTAL_ayer), pero de
-- vez en cuando lo resetean a mano (encontramos 6 casos en 173 dias,
-- probablemente cortes de mes). Este campo permite hacer lo mismo desde
-- la app: si esta marcado, el acumulado arranca de nuevo en 0 ese dia.
-- ---------------------------------------------------------------------
alter table resumen_diario add column if not exists resetear_acumulado boolean not null default false;


-- ============ 004_prestamos.sql ============
-- =========================================================================
-- Migracion: modulo de Prestamos (con estado y saldo pendiente por persona)
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- (requiere haber corrido antes supabase/schema.sql)
-- =========================================================================

-- ---------------------------------------------------------------------
-- PRESTAMOS: el prestamo en si (quien, cuanto, en que moneda, cuando).
-- tipo = 'nos_deben'  -> nosotros prestamos plata, alguien nos tiene que pagar
-- tipo = 'debemos'    -> a nosotros nos prestaron, le tenemos que pagar a alguien
-- ---------------------------------------------------------------------
create table if not exists prestamos (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('nos_deben', 'debemos')),
  persona text not null,
  concepto text,
  moneda_id bigint not null references monedas(id),
  monto_original numeric not null default 0,
  fecha date not null,
  notas text,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

create index if not exists idx_prestamos_fecha on prestamos(fecha);
create index if not exists idx_prestamos_tipo on prestamos(tipo);

alter table prestamos enable row level security;

drop policy if exists "prestamos_select" on prestamos;
create policy "prestamos_select" on prestamos
  for select using (mi_rol() is not null);

drop policy if exists "prestamos_write" on prestamos;
create policy "prestamos_write" on prestamos
  for all using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

-- ---------------------------------------------------------------------
-- PAGOS DE PRESTAMOS: pagos parciales o totales contra un prestamo.
-- El saldo pendiente de un prestamo = monto_original - suma(pagos.monto)
-- ---------------------------------------------------------------------
create table if not exists prestamos_pagos (
  id bigint generated always as identity primary key,
  prestamo_id bigint not null references prestamos(id) on delete cascade,
  fecha date not null,
  monto numeric not null default 0,
  notas text,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

create index if not exists idx_prestamos_pagos_prestamo on prestamos_pagos(prestamo_id);

alter table prestamos_pagos enable row level security;

drop policy if exists "prestamos_pagos_select" on prestamos_pagos;
create policy "prestamos_pagos_select" on prestamos_pagos
  for select using (mi_rol() is not null);

drop policy if exists "prestamos_pagos_write" on prestamos_pagos;
create policy "prestamos_pagos_write" on prestamos_pagos
  for all using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));


-- ============ 005_transferencias_referencia.sql ============
-- =========================================================================
-- Migracion: agrega un campo de referencia a transferencias (numero de
-- cuenta o transaccion, ej: "M 37795384"), para el circuito de
-- Colombia / Venezuela (BBVA).
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table transferencias add column if not exists referencia text;


-- ============ 006_utilidad_mensual_tasa.sql ============
-- =========================================================================
-- Migracion: agrega la tasa de cierre a utilidad_mensual, para poder
-- derivar "Total US" = Utilidades Libres (ARS) / Tasa de cierre,
-- igual que en la planilla original (columnas TASA US CIERRE /
-- UTILIDADES LIBRES / TOTAL US).
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table utilidad_mensual add column if not exists tasa_cierre numeric not null default 0;

-- Nota: las columnas "utilidad_us" y "utilidad_ars" ya existentes se
-- siguen usando, pero ahora se interpretan como:
--   utilidad_ars -> "Utilidades Libres" (ARS) del mes
--   utilidad_us  -> "Total US" = utilidad_ars / tasa_cierre (se calcula
--                    solo en la app, pero se guarda tambien por si
--                    quieren ajustarlo a mano)


-- ============ 007_comisiones_mensuales.sql ============
-- =========================================================================
-- Migracion: Comisiones mensuales de Latin Express y MoneyGram
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

create table if not exists comisiones_mensuales (
  id bigint generated always as identity primary key,
  anio integer not null,
  mes integer not null check (mes between 1 and 12),
  latin numeric not null default 0,
  money numeric not null default 0,
  fecha date,
  notas text,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now(),
  unique (anio, mes)
);

alter table comisiones_mensuales enable row level security;

drop policy if exists "comisiones_select" on comisiones_mensuales;
create policy "comisiones_select" on comisiones_mensuales
  for select using (mi_rol() is not null);

drop policy if exists "comisiones_write" on comisiones_mensuales;
create policy "comisiones_write" on comisiones_mensuales
  for all using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));


-- ============ 008_observaciones.sql ============
-- =========================================================================
-- Migracion: agrega un campo de observaciones a Entradas, Salidas y Gastos
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table entradas_prestamos add column if not exists observaciones text;
alter table salidas_prestamos add column if not exists observaciones text;
alter table gastos add column if not exists observaciones text;


-- ============ 009_acumulados_separados.sql ============
-- =========================================================================
-- Migracion: acumulados de Utilidad y Gastos SEPARADOS (en vez de un
-- unico "total acumulado" mezclado), igual que la planilla real:
--
--   UTILIDAD ACUMULADA(hoy) = utilidad de hoy + UTILIDAD ACUMULADA(ayer)
--   GASTOS ACUMULADO(hoy)   = gastos de hoy   + GASTOS ACUMULADO(ayer)
--   TOTAL = UTILIDAD ACUMULADA - GASTOS ACUMULADO
--
-- Se mantienen separados porque en la planilla real se pueden resetear
-- de forma independiente (por ejemplo, resetear solo gastos en un corte
-- de mes, sin tocar la utilidad acumulada).
--
-- Tambien agrega "Debo a Venezuela" como otro saldo de arrastre manual,
-- con la misma logica que Latin/Moneygram.
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table resumen_diario add column if not exists gastos_dia_ars numeric not null default 0;
alter table resumen_diario add column if not exists utilidad_acumulada_ars numeric not null default 0;
alter table resumen_diario add column if not exists gastos_acumulado_ars numeric not null default 0;
alter table resumen_diario add column if not exists resetear_utilidad_acumulada boolean not null default false;
alter table resumen_diario add column if not exists resetear_gastos_acumulado boolean not null default false;

alter table otros_saldos_diarios add column if not exists debo_venezuela_ars numeric not null default 0;

-- Nota: las columnas viejas (saldo_dia_anterior_ars, resetear_acumulado)
-- quedan en la tabla por compatibilidad pero ya no se usan para calcular
-- el TOTAL -- ahora se deriva de utilidad_acumulada_ars - gastos_acumulado_ars.


-- ============ 010_pozo_pesos.sql ============
-- =========================================================================
-- Migracion: campos de "otras salidas" y "otras entradas" de pesos,
-- necesarios para calcular el pozo de pesos dia a dia.
--
-- Formula confirmada directamente contra la celda real de la planilla
-- (formula de Google Sheets capturada de la barra de formulas) y
-- validada con precision exacta contra 6 dias reales:
--
--   saldo_pesos(hoy) = saldo_pesos(ayer) - compras_pesos(hoy) + ventas_pesos(hoy)
--                      - otras_salidas(hoy) + otras_entradas(hoy)
--
-- "otras_salidas" / "otras_entradas" son los totales de la tabla
-- SALIDA DE PESOS / ENTRADA DE PESOS de la planilla de operaciones:
-- pagos/ingresos de Latin Express, Moneygram, y otros movimientos de
-- caja que no son compra/venta de divisas (efectivo, cuentas BBVA,
-- pagos varios).
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table otros_saldos_diarios add column if not exists otras_salidas_pesos_ars numeric not null default 0;
alter table otros_saldos_diarios add column if not exists otras_entradas_pesos_ars numeric not null default 0;


-- ============ 011_movimientos_pesos.sql ============
-- =========================================================================
-- Migracion: log de "Otros movimientos de pesos" (item por item, en vez
-- de un numero suelto por dia). Alimenta automaticamente la formula del
-- pozo de pesos: otras_salidas(dia) = suma de tipo='salida' ese dia,
-- otras_entradas(dia) = suma de tipo='entrada' ese dia.
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

create table if not exists movimientos_pesos (
  id bigint generated always as identity primary key,
  fecha date not null,
  tipo text not null check (tipo in ('salida', 'entrada')),
  concepto text not null,
  monto numeric not null default 0,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

create index if not exists idx_movimientos_pesos_fecha on movimientos_pesos(fecha);

alter table movimientos_pesos enable row level security;

drop policy if exists "movimientos_pesos_select" on movimientos_pesos;
create policy "movimientos_pesos_select" on movimientos_pesos
  for select using (mi_rol() is not null);

drop policy if exists "movimientos_pesos_write" on movimientos_pesos;
create policy "movimientos_pesos_write" on movimientos_pesos
  for all using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));


-- ============ 012_utilidad_cadivi.sql ============
-- =========================================================================
-- Migracion: agrega "Utilidad Cadivi" a resumen_diario.
--
-- Se confirmo contra la planilla real (dia 24/08) que el calculo de
-- DEBEMOS usa DOS valores que no son los que la app tenia:
--
--   DEBEMOS = ENTRADAS + UTILIDAD_CADIVI + DEBEMOS_A_LATIN + FALTANTES_DIARIOS
--
-- "UTILIDAD_CADIVI" es una cadena propia (independiente de la utilidad
-- de compra/venta del motor de costeo): SALDO_DIA_ANTERIOR + UTILIDAD_DIARIA
-- - DESCUENTOS + ADICIONAL, verificado exacto: 142.855 + 34.846 - 0 + 0 = 177.701
--
-- "FALTANTES_DIARIOS" ya existia como columna (faltante_sobrante_ars) pero
-- estaba mal cargada -- debe ser el TOTAL de la cadena SALDO_ANTERIOR +
-- SOBRANTE - DESCUENTO (verificado: 24.967+37-39=24.965), no el "sobrante"
-- del dia solo.
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table resumen_diario add column if not exists utilidad_cadivi_ars numeric not null default 0;


-- ============ 013_cadena_cadivi_faltante.sql ============
-- =========================================================================
-- Migracion: Utilidad Cadivi y Faltante y Sobrante pasan a ser cadenas
-- que se arrastran dia a dia (como Utilidad/Gastos acumulado), en vez
-- de un numero suelto que no se encadenaba con el dia anterior.
--
--   utilidad_cadivi_ars(hoy) = utilidad_cadivi_ars(ayer)
--                               + cadivi_dia_ars(hoy) - cadivi_descuentos_ars(hoy)
--                               + cadivi_adicional_ars(hoy)
--
--   faltante_sobrante_ars(hoy) = faltante_sobrante_ars(ayer)
--                                  + faltante_dia_ars(hoy) - faltante_descuento_ars(hoy)
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table resumen_diario add column if not exists cadivi_dia_ars numeric not null default 0;
alter table resumen_diario add column if not exists cadivi_descuentos_ars numeric not null default 0;
alter table resumen_diario add column if not exists cadivi_adicional_ars numeric not null default 0;
alter table resumen_diario add column if not exists resetear_cadivi boolean not null default false;

alter table resumen_diario add column if not exists faltante_dia_ars numeric not null default 0;
alter table resumen_diario add column if not exists faltante_descuento_ars numeric not null default 0;
alter table resumen_diario add column if not exists resetear_faltante boolean not null default false;


-- ============ 014_ajustes_libres.sql ============
-- =========================================================================
-- Migracion: Ajustes Libres. Tabla generica para cargar valores sueltos
-- que aparecen en la planilla y todavia no tienen un modulo propio en
-- la app -- en vez de agregar una tabla nueva cada vez que aparece algo
-- asi, se carga aca. Si con el tiempo algo se vuelve recurrente y
-- estructurado, ahi si conviene formalizarlo en su propio modulo.
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

create table if not exists ajustes_libres (
  id bigint generated always as identity primary key,
  fecha date not null,
  categoria text not null,
  concepto text,
  monto numeric not null default 0,
  afecta text not null default 'ninguno' check (afecta in ('existencia', 'debemos', 'ninguno')),
  notas text,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

create index if not exists idx_ajustes_libres_fecha on ajustes_libres(fecha);

alter table ajustes_libres enable row level security;

drop policy if exists "ajustes_libres_select" on ajustes_libres;
create policy "ajustes_libres_select" on ajustes_libres
  for select using (mi_rol() is not null);

drop policy if exists "ajustes_libres_write" on ajustes_libres;
create policy "ajustes_libres_write" on ajustes_libres
  for all using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));


-- ============ 015_depositos_cierres_venezuela.sql ============
-- =========================================================================
-- Migracion: Depositos bancarios y Cierres de Venezuela (USD)
--
-- Ambos se cargan como logs simples de referencia. IMPORTANTE: por ahora
-- NO se suman automaticamente a la Posicion actual (motor de costeo) --
-- en la muestra de dias reales que revisamos, estos movimientos estaban
-- siempre en cero, asi que no hay forma de confirmar con certeza la
-- formula exacta de como afectan el costo promedio. Quedan como registro
-- informativo hasta que aparezca un dia con movimiento real para validar.
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

create table if not exists depositos_bancarios (
  id bigint generated always as identity primary key,
  fecha date not null,
  monto numeric not null default 0,
  notas text,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

create index if not exists idx_depositos_fecha on depositos_bancarios(fecha);
alter table depositos_bancarios enable row level security;

drop policy if exists "depositos_select" on depositos_bancarios;
create policy "depositos_select" on depositos_bancarios
  for select using (mi_rol() is not null);

drop policy if exists "depositos_write" on depositos_bancarios;
create policy "depositos_write" on depositos_bancarios
  for all using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));


create table if not exists cierres_venezuela (
  id bigint generated always as identity primary key,
  fecha date not null,
  tipo text not null check (tipo in ('salida', 'entrada')),
  moneda_id bigint not null references monedas(id),
  cantidad numeric not null default 0,
  concepto text,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

create index if not exists idx_cierres_vzla_fecha on cierres_venezuela(fecha);
alter table cierres_venezuela enable row level security;

drop policy if exists "cierres_vzla_select" on cierres_venezuela;
create policy "cierres_vzla_select" on cierres_venezuela
  for select using (mi_rol() is not null);

drop policy if exists "cierres_vzla_write" on cierres_venezuela;
create policy "cierres_vzla_write" on cierres_venezuela
  for all using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

