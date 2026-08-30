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
