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
