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
- Seeds (dev local): `supabase/seed.sql`
  - Observação: o seed é executado automaticamente em `supabase db reset` quando `db.seed.enabled=true` em `supabase/config.toml`.

## Tipos TypeScript (gerados a partir do schema local)

- Arquivo canônico (único) de types gerados: `src/types/supabase.ts`
- Gerar types a partir do schema local: `supabase gen types typescript --local > src/types/supabase.ts`
