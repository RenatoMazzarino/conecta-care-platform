# Supabase local (dev)

## Pré-requisitos
- Supabase CLI instalado (`supabase`).
- Projeto com pasta `supabase/` (config em `supabase/config.toml`).

## Comandos básicos
- Subir stack local: `supabase start`
- Ver status/URLs/keys: `supabase status`
- Parar stack local: `supabase stop`

## Reset e aplicação de migrations
- Resetar o banco local e reaplicar migrations: `supabase db reset`
  - Útil quando você alterou migrations e quer “recriar do zero”.

## Onde ficam os arquivos importantes
- Migrations SQL: `supabase/migrations/`
- Seeds (se usados no futuro): `supabase/seed.sql`

## Tipos TypeScript (gerados a partir do schema local)
- Gerar types (schema `public`): `supabase gen types typescript --local --schema public > src/types/supabase.public.ts`
- Gerar types (com schemas extras, se necessário): `supabase gen types typescript --local > src/types/supabase.ts`

