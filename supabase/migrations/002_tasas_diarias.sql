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
