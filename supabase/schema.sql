-- =========================================================================
-- Esquema de base de datos para "Casa de Cambio" en Supabase (Postgres)
-- Ejecutar este archivo completo en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

-- ---------------------------------------------------------------------
-- PERFILES (extiende auth.users con nombre y rol)
-- Supabase ya trae autenticacion (auth.users). Esta tabla guarda los
-- datos adicionales de cada usuario: nombre, rol, si esta activo.
-- ---------------------------------------------------------------------
create table if not exists perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  nombre_completo text,
  rol text not null check (rol in ('admin', 'operador', 'visor')) default 'visor',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

-- Cuando se crea un usuario nuevo en Supabase Auth, le creamos
-- automaticamente una fila en "perfiles" con rol "visor" por defecto.
-- (Los admins pueden despues subir el rol de un usuario desde la tabla).
create or replace function crear_perfil_automatico()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, username, rol)
  values (new.id, new.email, 'visor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure crear_perfil_automatico();

-- Funcion auxiliar: rol del usuario actualmente logueado
create or replace function mi_rol()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select rol from public.perfiles where id = auth.uid() and activo = true;
$$;

-- ---------------------------------------------------------------------
-- MONEDAS
-- ---------------------------------------------------------------------
create table if not exists monedas (
  id bigint generated always as identity primary key,
  codigo text not null unique,
  nombre text not null,
  activa boolean not null default true
);

-- ---------------------------------------------------------------------
-- TENENCIAS DIARIAS
-- ---------------------------------------------------------------------
create table if not exists tenencias_diarias (
  id bigint generated always as identity primary key,
  fecha date not null,
  moneda_id bigint not null references monedas(id),
  valor numeric not null default 0,
  cotizacion numeric not null default 0,
  total_ars numeric not null default 0,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now(),
  unique (fecha, moneda_id)
);

-- ---------------------------------------------------------------------
-- ENTRADAS Y PRESTAMOS
-- ---------------------------------------------------------------------
create table if not exists entradas_prestamos (
  id bigint generated always as identity primary key,
  fecha date not null,
  concepto text not null,
  moneda_id bigint not null references monedas(id),
  valor numeric not null default 0,
  porcentaje numeric not null default 0,
  total_ars numeric not null default 0,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- SALIDAS / PRESTAMOS OTORGADOS
-- ---------------------------------------------------------------------
create table if not exists salidas_prestamos (
  id bigint generated always as identity primary key,
  fecha date not null,
  concepto text not null,
  moneda_id bigint not null references monedas(id),
  valor numeric not null default 0,
  porcentaje numeric not null default 0,
  total_ars numeric not null default 0,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- GASTOS
-- ---------------------------------------------------------------------
create table if not exists gastos (
  id bigint generated always as identity primary key,
  fecha date not null,
  concepto text,
  moneda_id bigint not null references monedas(id),
  valor numeric not null default 0,
  porcentaje numeric not null default 0,
  total_ars numeric not null default 0,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- OPERACIONES DE COMPRA / VENTA
-- ---------------------------------------------------------------------
create table if not exists operaciones_cambio (
  id bigint generated always as identity primary key,
  fecha date not null,
  tipo text not null check (tipo in ('compra', 'venta')),
  moneda_id bigint not null references monedas(id),
  cantidad numeric not null default 0,
  cotizacion numeric not null default 0,
  total_ars numeric not null default 0,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- TRANSFERENCIAS
-- ---------------------------------------------------------------------
create table if not exists transferencias (
  id bigint generated always as identity primary key,
  fecha date not null,
  destino text not null,
  tipo text not null check (tipo in ('debemos', 'abonos', 'ingreso', 'egreso')),
  moneda_id bigint not null references monedas(id),
  valor numeric not null default 0,
  total_ars numeric not null default 0,
  notas text,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- RESUMEN DIARIO
-- ---------------------------------------------------------------------
create table if not exists resumen_diario (
  id bigint generated always as identity primary key,
  fecha date not null unique,
  saldo_dia_anterior_ars numeric not null default 0,
  utilidad_diaria_ars numeric not null default 0,
  descuentos_ars numeric not null default 0,
  utilidad_adicional_ars numeric not null default 0,
  faltante_sobrante_ars numeric not null default 0,
  tasa_us_cierre numeric not null default 0,
  total_ars numeric not null default 0,
  notas text,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- UTILIDAD MENSUAL
-- ---------------------------------------------------------------------
create table if not exists utilidad_mensual (
  id bigint generated always as identity primary key,
  anio integer not null,
  mes integer not null check (mes between 1 and 12),
  utilidad_us numeric not null default 0,
  utilidad_ars numeric not null default 0,
  notas text,
  unique (anio, mes)
);

-- ---------------------------------------------------------------------
-- INDICES
-- ---------------------------------------------------------------------
create index if not exists idx_tenencias_fecha on tenencias_diarias(fecha);
create index if not exists idx_entradas_fecha on entradas_prestamos(fecha);
create index if not exists idx_salidas_fecha on salidas_prestamos(fecha);
create index if not exists idx_gastos_fecha on gastos(fecha);
create index if not exists idx_operaciones_fecha on operaciones_cambio(fecha);
create index if not exists idx_transferencias_fecha on transferencias(fecha);
create index if not exists idx_resumen_fecha on resumen_diario(fecha);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS)
-- Reglas: cualquier usuario activo (admin/operador/visor) puede LEER.
-- Solo admin y operador pueden ESCRIBIR (insert/update/delete).
-- Solo admin puede administrar monedas y perfiles de otros usuarios.
-- =========================================================================

alter table perfiles enable row level security;
alter table monedas enable row level security;
alter table tenencias_diarias enable row level security;
alter table entradas_prestamos enable row level security;
alter table salidas_prestamos enable row level security;
alter table gastos enable row level security;
alter table operaciones_cambio enable row level security;
alter table transferencias enable row level security;
alter table resumen_diario enable row level security;
alter table utilidad_mensual enable row level security;

-- ---- PERFILES ----
drop policy if exists "perfiles_select" on perfiles;
create policy "perfiles_select" on perfiles
  for select using (auth.uid() = id or mi_rol() = 'admin');

drop policy if exists "perfiles_update_admin" on perfiles;
create policy "perfiles_update_admin" on perfiles
  for update using (mi_rol() = 'admin');

drop policy if exists "perfiles_insert_admin" on perfiles;
create policy "perfiles_insert_admin" on perfiles
  for insert with check (mi_rol() = 'admin' or auth.uid() = id);

-- ---- MONEDAS ----
drop policy if exists "monedas_select" on monedas;
create policy "monedas_select" on monedas
  for select using (mi_rol() is not null);

drop policy if exists "monedas_write_admin" on monedas;
create policy "monedas_write_admin" on monedas
  for all using (mi_rol() = 'admin') with check (mi_rol() = 'admin');

-- ---- Tablas operativas: helper generado a mano para cada tabla ----

-- tenencias_diarias
drop policy if exists "tenencias_select" on tenencias_diarias;
create policy "tenencias_select" on tenencias_diarias for select using (mi_rol() is not null);
drop policy if exists "tenencias_write" on tenencias_diarias;
create policy "tenencias_write" on tenencias_diarias for all
  using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

-- entradas_prestamos
drop policy if exists "entradas_select" on entradas_prestamos;
create policy "entradas_select" on entradas_prestamos for select using (mi_rol() is not null);
drop policy if exists "entradas_write" on entradas_prestamos;
create policy "entradas_write" on entradas_prestamos for all
  using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

-- salidas_prestamos
drop policy if exists "salidas_select" on salidas_prestamos;
create policy "salidas_select" on salidas_prestamos for select using (mi_rol() is not null);
drop policy if exists "salidas_write" on salidas_prestamos;
create policy "salidas_write" on salidas_prestamos for all
  using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

-- gastos
drop policy if exists "gastos_select" on gastos;
create policy "gastos_select" on gastos for select using (mi_rol() is not null);
drop policy if exists "gastos_write" on gastos;
create policy "gastos_write" on gastos for all
  using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

-- operaciones_cambio
drop policy if exists "operaciones_select" on operaciones_cambio;
create policy "operaciones_select" on operaciones_cambio for select using (mi_rol() is not null);
drop policy if exists "operaciones_write" on operaciones_cambio;
create policy "operaciones_write" on operaciones_cambio for all
  using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

-- transferencias
drop policy if exists "transferencias_select" on transferencias;
create policy "transferencias_select" on transferencias for select using (mi_rol() is not null);
drop policy if exists "transferencias_write" on transferencias;
create policy "transferencias_write" on transferencias for all
  using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

-- resumen_diario
drop policy if exists "resumen_select" on resumen_diario;
create policy "resumen_select" on resumen_diario for select using (mi_rol() is not null);
drop policy if exists "resumen_write" on resumen_diario;
create policy "resumen_write" on resumen_diario for all
  using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

-- utilidad_mensual
drop policy if exists "utilidad_select" on utilidad_mensual;
create policy "utilidad_select" on utilidad_mensual for select using (mi_rol() is not null);
drop policy if exists "utilidad_write" on utilidad_mensual;
create policy "utilidad_write" on utilidad_mensual for all
  using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

-- =========================================================================
-- CATALOGO INICIAL DE MONEDAS (tomado de las planillas originales)
-- =========================================================================
insert into monedas (codigo, nombre) values
  ('ARS', 'Pesos argentinos'),
  ('USD', 'Dolar (cara grande)'),
  ('USD_PEQ', 'Dolar (cara chica)'),
  ('EUR', 'Euro'),
  ('REAL', 'Real brasilero'),
  ('UYU', 'Peso uruguayo'),
  ('MXN', 'Peso mexicano'),
  ('PYG', 'Guarani'),
  ('CLP', 'Peso chileno'),
  ('GBP', 'Libra esterlina'),
  ('PEN', 'Sol peruano'),
  ('CAD', 'Dolar canadiense'),
  ('AUD', 'Dolar australiano'),
  ('COP', 'Peso colombiano'),
  ('VES', 'Bolivar venezolano')
on conflict (codigo) do nothing;

-- =========================================================================
-- IMPORTANTE - PASO MANUAL DESPUES DE CORRER ESTE SCRIPT:
-- 1. Andar a Authentication -> Users -> Add user, crear tu primer usuario
--    (email + password).
-- 2. Ir a Table Editor -> perfiles, buscar la fila que se creo sola para
--    ese usuario, y cambiarle "rol" de "visor" a "admin".
-- A partir de ahi ese usuario ya puede entrar a la app y crear al resto
-- de los usuarios/roles desde la seccion "Usuarios" de la aplicacion.
-- =========================================================================
