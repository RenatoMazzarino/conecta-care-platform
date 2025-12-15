# Revisão do PR: Feat/pacientes-aba01-dados-pessoais

## Resumo
- Contrato da aba está na versão **0.4 (Aprovado)** e serve como referência principal de cobertura/estrutura.
- Migrations aplicam o alinhamento completo do `public.patients` ao legado, adicionando campos de marketing/consentimento/perfil, índices e checks (incluindo `tenant_id` + soft delete) — vide pacote de migrations `20251213xxxx` + `202512142004_auth_tenant_from_jwt.sql`.
- Types do Supabase foram regenerados (`src/types/supabase.ts`) após as migrations.
- Implementação ponta-a-ponta da Aba 01 (Dados Pessoais) sem mocks: actions (`getPatientById`/`updatePatientDadosPessoais`), validação Zod (`aba01DadosPessoais`), UI (cards/grid + formulário) e guarda de autenticação/tenant na página do paciente.
- Correção das regex de validação de data/e-mail para impedir falsos positivos de erro na edição.

## Evidências
- Contrato: `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md` (versão 0.4, status Aprovado, atualizado em 2025-12-13).
- Migrations: `supabase/migrations/202512130452_base.sql`, `202512130453_pacientes_aba01_dados_pessoais.sql`, `202512130704_pacientes_aba01_dados_pessoais_extend_legado.sql`, `202512131716_pacientes_aba01_align_final.sql`, `202512141854_pacientes_email_check_relax.sql`, `202512142004_auth_tenant_from_jwt.sql`.
- Types: `src/types/supabase.ts` traz os campos novos (`marketing_*`, `photo_consent*`, `communication_preferences`, `record_status`, `onboarding_step`, `tenant_id`, soft delete etc.) em `public.patients`.
- UI/Actions: `src/app/pacientes/[id]/PatientPageClient.tsx` com guard de auth/tenant + shell Dynamics; `src/components/patient/DadosPessoaisTab.tsx` para view/edit; actions em `src/features/pacientes/actions/` e schema Zod em `src/features/pacientes/schemas/aba01DadosPessoais.ts`.

## Observações e pendências
- PR declara ter executado `npm run lint`, `npm run typecheck`, `npm run build` e testes manuais básicos de login/edição.
- RLS multi-tenant habilitado com função `app_private.current_tenant_id()`; há bypass dev-only via token público (documentado).
- Remoção de mocks concluída apenas para Aba 01; demais abas ainda usam `src/types/patient.ts` (fora do escopo).
- Atenção ao comportamento de `record_status`/`is_active` e aos seeds multi-tenant; validar em runtime se aplicável.
