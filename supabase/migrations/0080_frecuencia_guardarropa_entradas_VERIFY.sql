-- VERIFICACIÓN POSTERIOR de 0080. Un solo resultado. Esperado:
--   tablas nuevas = 2 · columnas nuevas = 2 · tablas con RLS activa = 2 ·
--   políticas = 8 · policies de anon sobre las tablas nuevas = 0 ·
--   triggers = 1 · índices = 2 · filas en las tablas nuevas = 0
select 'tablas nuevas' as verificacion, count(*)::int as cantidad, 2 as esperado
  from information_schema.tables where table_schema = 'public' and table_name in ('frecuencia_guardarropa','frecuencia_entradas')
union all
select 'columnas nuevas en preferencias', count(*)::int, 2
  from information_schema.columns where table_schema = 'public' and table_name = 'frecuencia_preferencias' and column_name in ('horario_entradas_inicio','horario_entradas_fin')
union all
select 'tablas con RLS activa', count(*)::int, 2
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname in ('frecuencia_guardarropa','frecuencia_entradas') and c.relrowsecurity
union all
select 'políticas', count(*)::int, 8
  from pg_policies where schemaname = 'public' and tablename in ('frecuencia_guardarropa','frecuencia_entradas')
union all
select 'permisos de anon sobre las tablas nuevas', count(*)::int, 0
  from information_schema.role_table_grants where table_schema = 'public' and table_name in ('frecuencia_guardarropa','frecuencia_entradas') and grantee = 'anon'
union all
select 'triggers', count(*)::int, 1
  from information_schema.triggers where trigger_schema = 'public' and trigger_name = 'trg_frecuencia_entradas_updated_at'
union all
select 'índices', count(*)::int, 2
  from pg_indexes where schemaname = 'public' and indexname in ('idx_frecuencia_guardarropa_user','idx_frecuencia_entradas_user_fecha')
union all
select 'filas en tablas nuevas', (select count(*) from public.frecuencia_guardarropa)::int + (select count(*) from public.frecuencia_entradas)::int, 0;
