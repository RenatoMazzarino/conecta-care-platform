# ADR-005: Tenancy via app_metadata no JWT

Status: Accepted
Data: 2025-12-17
Owner: @RenatoMazzarino

Contexto

- O `tenant_id` deve acompanhar o usuário autenticado para que o banco (RLS) aplique o escopo correto por empresa. Precisamos de uma forma padronizada e segura de transportar esse dado.

Decisão

- Em produção, o `tenant_id` será obtido do JWT do Supabase Auth, preferencialmente em `app_metadata.tenant_id`.
- A função `app_private.current_tenant_id()` deve ler, nesta ordem: `auth.jwt()->>'tenant_id'`, `auth.jwt()->'app_metadata'->>'tenant_id'` e fallback opcional `current_setting('app.tenant_id', true)` apenas para dev/seeds.
- Sem `tenant_id`, o acesso é negado.

Alternativas consideradas

- Enviar `tenant_id` via header/app para cada request: rejeitado por risco de spoofing.
- Persistir `tenant_id` apenas em tabela de sessão: rejeitado por acoplamento e duplicação de fonte de verdade.

Consequências

- Garante resolução consistente de tenant no banco; UI/Actions apenas propagam a sessão válida.
- Para desenvolvimento local, mantém-se bypass opcional via `NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN` (DEV ONLY), nunca em produção.

Referências

- docs/runbooks/auth-tenancy.md
- supabase/migrations/202512142004_auth_tenant_from_jwt.sql
- docs/architecture/SYSTEM_ARCHITECTURE.md (Segurança e Multi-tenancy por Design)
