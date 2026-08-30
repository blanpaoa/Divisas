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
