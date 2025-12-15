# Revisão do PR: Feat/pacientes-aba01-dados-pessoais

## Status da revisão
✅ **Aprovado para merge (sem blockers)**  
- CI passou e preview (Vercel) está ok conforme a própria PR.

## Resumo
- Contrato da aba está na versão **0.4 (Aprovado)** e serve como referência principal de cobertura/estrutura.
- Migrations alinham `public.patients` ao legado, adicionando campos de perfil/consentimento/marketing + índices + checks, incluindo **multi-tenant (`tenant_id`)** e **soft delete (`deleted_at`)**.
- Types do Supabase foram regenerados (`src/types/supabase.ts`) após as migrations.
- Implementação ponta-a-ponta da **Aba 01 (Dados Pessoais)** sem mocks: actions (`getPatientById`/`updatePatientDadosPessoais`), validação/normalização Zod (`aba01DadosPessoais`), UI (view em grid/cards + edit em formulário) e **guard de autenticação/tenant** no detalhe do paciente.
- Correção de regex escapadas que causavam falso erro de “Data inválida”/“E-mail inválido” ao salvar edições.

## Evidências
- Contrato: `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md` (v0.4, Aprovado).
- Migrations:
  - `supabase/migrations/202512130452_base.sql`
  - `supabase/migrations/202512130453_pacientes_aba01_dados_pessoais.sql`
  - `supabase/migrations/202512130704_pacientes_aba01_dados_pessoais_extend_legado.sql`
  - `supabase/migrations/202512131716_pacientes_aba01_align_final.sql`
  - `supabase/migrations/202512141854_pacientes_email_check_relax.sql`
  - `supabase/migrations/202512142004_auth_tenant_from_jwt.sql`
- Types: `src/types/supabase.ts` contém os novos campos (marketing/consentimento/onboarding/tenant/soft delete etc.).
- UI/Actions:
  - `src/app/pacientes/[id]/PatientPageClient.tsx` (shell “Dynamics” + guard auth/tenant)
  - `src/components/patient/DadosPessoaisTab.tsx` (view/edit)
  - `src/features/pacientes/actions/*`
  - `src/features/pacientes/schemas/aba01DadosPessoais.ts`

## Observações e pendências (não bloqueantes)
- Remoção de mocks concluída apenas para Aba 01; demais abas ainda usam `src/types/patient.ts` (fora do escopo).
- Multi-tenant/RLS depende de `app_private.current_tenant_id()` e JWT contendo `tenant_id` (inclui fallback via `app_metadata.tenant_id`).
- Existe bypass **DEV ONLY** via token público (opt-in) documentado nos runbooks; deve ser ignorado em produção.
- Validar em runtime a semântica de `record_status`/`is_active` e seeds multi-tenant, conforme evolução do módulo.

## Checklist de validação (executado/esperado)
- `npm run lint`, `npm run typecheck`, `npm run build` ✅ (conforme PR + CI)
- Manual:
  - abrir `/pacientes/<uuid>` sem login → redirect para `/login?next=...`
  - login → carrega sem “tenant_id ausente”
  - editar e salvar → não acusar falso “Data inválida”/“E-mail inválido”
  - e-mail inválido → bloquear com mensagem adequada
