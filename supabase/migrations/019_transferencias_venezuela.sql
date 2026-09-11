-- =========================================================================
-- Migracion: modulo completo de Transferencias a Venezuela (Cliente +
-- Beneficiario + Transaccion), pedido explicito del usuario.
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

create table if not exists clientes_venezuela (
  id bigint generated always as identity primary key,
  documento text not null unique,
  nombre text not null,
  direccion text,
  telefono text,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);
create index if not exists idx_clientes_venezuela_documento on clientes_venezuela(documento);

create table if not exists beneficiarios_venezuela (
  id bigint generated always as identity primary key,
  cliente_id bigint not null references clientes_venezuela(id) on delete cascade,
  tipo_documento text not null check (tipo_documento in ('RIF', 'E', 'CI')),
  documento text not null,
  nombre text not null,
  direccion text,
  banco text,
  cuenta text,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);
create index if not exists idx_beneficiarios_venezuela_cliente on beneficiarios_venezuela(cliente_id);

create table if not exists transferencias_venezuela (
  id bigint generated always as identity primary key,
  fecha date not null,
  cliente_id bigint not null references clientes_venezuela(id),
  beneficiario_id bigint not null references beneficiarios_venezuela(id),
  valor_ars numeric(18, 2) not null,
  tasa numeric(20, 4) not null,
  total_bs numeric(18, 2) not null,
  usuario_id uuid references perfiles(id),
  creado_en timestamptz not null default now()
);
create index if not exists idx_transferencias_venezuela_fecha on transferencias_venezuela(fecha);

alter table clientes_venezuela enable row level security;
alter table beneficiarios_venezuela enable row level security;
alter table transferencias_venezuela enable row level security;

drop policy if exists "clientes_venezuela_select" on clientes_venezuela;
create policy "clientes_venezuela_select" on clientes_venezuela for select using (mi_rol() is not null);
drop policy if exists "clientes_venezuela_write" on clientes_venezuela;
create policy "clientes_venezuela_write" on clientes_venezuela for all using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

drop policy if exists "beneficiarios_venezuela_select" on beneficiarios_venezuela;
create policy "beneficiarios_venezuela_select" on beneficiarios_venezuela for select using (mi_rol() is not null);
drop policy if exists "beneficiarios_venezuela_write" on beneficiarios_venezuela;
create policy "beneficiarios_venezuela_write" on beneficiarios_venezuela for all using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));

drop policy if exists "transferencias_venezuela_select" on transferencias_venezuela;
create policy "transferencias_venezuela_select" on transferencias_venezuela for select using (mi_rol() is not null);
drop policy if exists "transferencias_venezuela_write" on transferencias_venezuela;
create policy "transferencias_venezuela_write" on transferencias_venezuela for all using (mi_rol() in ('admin','operador')) with check (mi_rol() in ('admin','operador'));
