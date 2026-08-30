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
