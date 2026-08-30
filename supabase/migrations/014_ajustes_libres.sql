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
