# Entorno 100% local: las variables reales de Supabase se quitan y se apuntan al mock.
unset SUPABASE_SERVICE_ROLE_KEY NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY OPENAI_API_KEY
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54399
export NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-anon-key
export SUPABASE_SERVICE_ROLE_KEY=mock-service-key
export NEXT_TELEMETRY_DISABLED=1
export NODE_USE_ENV_PROXY=1
export NEXT_PUBLIC_SITE_URL=https://aretesoluciones.space
export OPENAI_API_KEY=mock-sin-uso
