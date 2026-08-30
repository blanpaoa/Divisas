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
