# ADR-002: Multi-tenant + RLS por design

Status: Accepted
Data: 2025-12-17
Owner: @RenatoMazzarino

Contexto

- A plataforma é SaaS multi-tenant. Precisamos garantir isolamento de dados por empresa em todas as entidades sensíveis.

Decisão

- Toda tabela de domínio deve possuir coluna `tenant_id` (NOT NULL) e policies de **Row-Level Security (RLS)** ativas.
- A função `app_private.current_tenant_id()` resolve o tenant a partir do JWT (preferencialmente `app_metadata.tenant_id`) e nega acesso sem tenant.
- Policies padrão por tenant (SELECT/INSERT/UPDATE/DELETE) devem filtrar por `tenant_id` e respeitar soft delete quando aplicável.

Alternativas consideradas

- Isolamento por schema ou banco por tenant: rejeitado por custo operacional e migração complexa.
- Controle de acesso apenas no app (sem RLS): rejeitado por risco de bypass e erro humano.

Consequências

- Isolamento forte por tenant e segurança por padrão (deny by default).
- Dependência de autenticação com JWT correto; em dev local, admite-se fallback controlado para seeds/testes.

Referências

- docs/runbooks/auth-tenancy.md
- docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md (Seção RLS)
- supabase/migrations/202512142004_auth_tenant_from_jwt.sql
- docs/architecture/SYSTEM_ARCHITECTURE.md (Princípios)
