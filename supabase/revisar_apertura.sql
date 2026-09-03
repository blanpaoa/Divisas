-- Revisa si hay mas de una fila de apertura para ARS (esto rompe el
-- calculo del pozo de pesos si hay ambigüedad sobre cual usar)
select a.*, m.codigo
from apertura_saldos a
join monedas m on m.id = a.moneda_id
where m.codigo = 'ARS';
