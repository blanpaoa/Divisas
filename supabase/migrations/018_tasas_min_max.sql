-- =========================================================================
-- Migracion: valor minimo y maximo en Tasa del dia. Se usan para no
-- permitir guardar una Compra/Venta si la cotizacion ingresada se sale
-- de ese rango para esa moneda ese dia.
--
-- Correr esto en: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

alter table tasas_diarias add column if not exists valor_minimo numeric;
alter table tasas_diarias add column if not exists valor_maximo numeric;
