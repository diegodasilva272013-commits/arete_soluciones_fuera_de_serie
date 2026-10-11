-- CHEQUEO PREVIO de 0080: los nombres nuevos NO deben existir.
-- Resultado esperado: las 4 filas con 0. Si alguna da distinto de 0, NO correr 0080.
select 'tabla frecuencia_guardarropa' as chequeo, count(*) as cantidad
  from information_schema.tables where table_schema = 'public' and table_name = 'frecuencia_guardarropa'
union all
select 'tabla frecuencia_entradas', count(*)
  from information_schema.tables where table_schema = 'public' and table_name = 'frecuencia_entradas'
union all
select 'columna preferencias.horario_entradas_inicio', count(*)
  from information_schema.columns where table_schema = 'public' and table_name = 'frecuencia_preferencias' and column_name = 'horario_entradas_inicio'
union all
select 'columna preferencias.horario_entradas_fin', count(*)
  from information_schema.columns where table_schema = 'public' and table_name = 'frecuencia_preferencias' and column_name = 'horario_entradas_fin';
