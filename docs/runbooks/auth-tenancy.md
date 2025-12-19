# Runbook — Auth + Tenancy (tenant_id) no Supabase

Este projeto é **multi-tenant**. A tabela `public.patients` e as policies de RLS dependem de `tenant_id`.

Em produção, o `tenant_id` deve vir do **JWT do Supabase Auth** (o padrão é usar `app_metadata.tenant_id`).

## Como funciona no banco

A função `app_private.current_tenant_id()` resolve o tenant nesta ordem:

1) `auth.jwt()->>'tenant_id'`
2) `auth.jwt()->'app_metadata'->>'tenant_id'` (recomendado)
3) `current_setting('app.tenant_id', true)` (somente cenários controlados)

Se nenhum existir, o banco lança erro: **tenant_id ausente**.

## Dev local — criar usuário e vincular tenant

### 1) Criar usuário (Supabase Studio)

1) Suba o Supabase local e abra o Studio (via `supabase status`).
2) Vá em **Authentication → Users → Add user**.
3) Crie um usuário com e-mail e senha.

### 2) Definir `tenant_id` no `app_metadata` do usuário

No Studio, abra o **SQL Editor** e rode (ajuste e-mail e tenant):

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('tenant_id', 'SEU_TENANT_UUID_AQUI')
where email = 'seu-email@exemplo.com';
```

Notas:

- `raw_app_meta_data` é o equivalente a `app_metadata` no JWT.
- Depois de ajustar o metadata, **faça logout e login de novo** para o JWT refletir o novo `tenant_id`.

### 3) Testar no app

1) Rode `npm run dev`
2) Abra `/pacientes/<uuid>` sem estar logado:
   - Deve redirecionar para `/login?next=/pacientes/<uuid>`
3) Faça login:
   - Deve carregar a página do paciente sem erro `tenant_id ausente`.

## DEV ONLY (opcional) — bypass via token

Para desenvolvimento, existe um fallback opt-in:

- `.env.local` / `.env.local.local`:
  - `NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN=<jwt>`

Regras:

- Só funciona em `NODE_ENV=development`.
- É um bypass explícito para quando você ainda não quer usar a tela de login.
- Não use em produção.
