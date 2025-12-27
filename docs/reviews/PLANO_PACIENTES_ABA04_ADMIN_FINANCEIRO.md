# Plano de Implementacao: Aba 04 (Administrativo e Financeiro)

## 0) Baseline

- **Status:** Aprovado
- **Contrato Canonico:** [docs/contracts/pacientes/ABA04_ADMIN_FINANCEIRO.md](../contracts/pacientes/ABA04_ADMIN_FINANCEIRO.md)
- **Mapa do Legado:** [docs/legacy_maps/pacientes/ABA04_ADMIN_FINANCEIRO_LEGADO_MAP.md](../legacy_maps/pacientes/ABA04_ADMIN_FINANCEIRO_LEGADO_MAP.md)
- **Regra:** o contrato define o schema alvo limpo; o mapa define KEEP/MOVE/DROP.

## 1) Objetivo

Implementar a Aba 04 com 5 cards (Contrato, Responsaveis, Pagador, Faturamento, Checklist), incluindo `billing_entities` e `care_policy_profiles`, com painel unificado de status e ganchos para integracoes externas e IA.

## 2) Escopo

**IN:**
- Modelagem canonica (`patient_admin_financial_profile`, `patient_onboarding_checklist`, `billing_entities`, `care_policy_profiles`).
- Backfill a partir das tabelas legadas mapeadas.
- Actions e UI para leitura/escrita do canonico.
- Sincronizacao do pagador PF com `patient_related_persons` (badge "Pagador" na Aba03).
- RLS e auditoria (created/updated + system_audit_logs).
- Ganchos de produto para integracoes e IA.

**OUT:**
- Lancamentos financeiros, boletos, NF e conciliacao.
- Regras de escala e dados clinicos (fora da Aba 04).

## 3) Ganchos de Produto (obrigatorios)

1. Assinatura digital (provider + envelope + status) + action `sendContractForSignature` + evento na timeline.
1. Policy Engine (rule_set + version) + action `setPolicyProfile` + evento na timeline.
1. Ingestao de documentos do checklist (upload + extracao) + timeline/context snapshot.
1. Integracao billing/ERP (exportacao/reconciliacao) via interface de provider + timeline.
1. Observabilidade/IA (patient_timeline_events + patient_context_snapshot) com rastreabilidade.

## 4) Fases de Implementacao

### Fase 1 — Dados (Migrations)
1. Criar tabelas canonicas conforme o contrato, incluindo `billing_entities`, `care_policy_profiles` e `patient_timeline_events`.
2. Adicionar FKs `primary_payer_entity_id` e `policy_profile_id` no perfil canonico.
3. Backfill de dados com base no mapa (KEEP/MOVE), definindo precedencia entre fontes duplicadas e usando upsert 1:1 por paciente.
4. Gerar `billing_entities` a partir de `payer_name`/`payer_doc_*`, normalizar `doc_number` e deduplicar por `(tenant_id, kind, doc_type, doc_number)` antes de vincular `primary_payer_entity_id`.
5. Migrar checklist legado para `patient_onboarding_checklist` com `item_code`, evitando duplicidade por `(patient_id, item_code)`.
6. Aplicar constraints, indices e FKs recomendados.
7. Habilitar RLS por `tenant_id` usando `app_private.current_tenant_id()`.
8. Deprecar tabelas legadas (sem novas escritas) e remover colunas DROP apos validacao.

### Fase 2 — Types e Schemas
1. Atualizar tipos do Supabase (`npm run verify`).
2. Criar schemas Zod:
   - `AdminFinancialProfileSchema`
   - `OnboardingChecklistSchema`
   - `BillingEntitySchema`
   - `CarePolicyProfileSchema`
3. Adicionar validacoes de enums e regras de data.

### Fase 3 — Actions
1. `getAdminFinancialData(patientId)`
2. `updateAdminInfo(patientId, payload)`
3. `updateFinancialProfile(patientId, payload)`
4. `getOnboardingChecklist(patientId)`
5. `updateOnboardingChecklist(patientId, payload)`
6. `upsertBillingEntity(payload)`
7. `setPrimaryPayerEntity(patientId, billingEntityId)`
8. `upsertCarePolicyProfile(payload)`
9. `setPolicyProfile(patientId, profileId)`
10. `recordPatientTimelineEvent(patientId, payload)`
11. `sendContractForSignature(patientId, payload)`
12. `requestChecklistDocumentIngestion(patientId, payload)`
13. `sendBillingExport(patientId, payload)`
14. `reconcileBillingStatus(patientId, payload)`

### Fase 4 — UI
1. Criar `AdminFinancialTab` com 5 cards.
2. Formularios com RHF + Zod, modo leitura/edicao e estados previsiveis.
3. Card Pagador com selecao/criacao de `billing_entities` e vinculo a PF quando aplicavel.
4. Validar duplicidade de `billing_entities` (doc_number + kind + doc_type, com doc_number normalizado) antes de criar novos registros.
5. Rotular `billing_entities.kind` com nomes explicitos (Pessoa (CPF), Empresa (CNPJ), Operadora, Corretora, Orgao Publico/SUS).
6. Card Contrato com selecao de `policy_profile_id`.
7. Painel unificado de status no cabecalho do paciente.
8. Checklist com lista de itens, upload e links de documentos.

### Fase 5 — Observabilidade/IA
1. Catalogar eventos do dominio (status, pagador, policy_profile, billing, checklist).
2. Normalizar payloads para consumo por IA e auditoria.
3. Preparar derivacao de `patient_context_snapshot` para assistentes internos.
4. Garantir rastreabilidade dos ganchos (assinatura, policy engine, checklist, billing/ERP).

### Fase 6 — Docs e Revisao
1. Atualizar evidencias (DoD, validacao).
2. Revisao final de consistencia entre contrato, mapa e implementacao.

## 5) Inventario de Artefatos

### Novos arquivos
- `src/components/patient/AdminFinancialTab.tsx`
- `src/features/pacientes/actions/aba04/`
- `src/features/pacientes/schemas/aba04AdminFinanceiro.schema.ts`
- `src/features/pacientes/services/aba04/`
- `supabase/migrations/202512221400_pacientes_aba04_admin_financeiro.sql`

### Alteracoes
- `src/app/pacientes/[id]/PatientPageClient.tsx`
- `src/components/patient/RedeApoioTab.tsx`
- `src/types/supabase.ts`

## 6) Criterios de Aceite (DoD)

1. Schema canonico criado com constraints, `billing_entities` e `care_policy_profiles`.
2. Backfill realizado e colunas DROP removidas apos validacao.
3. Pagador PF sincronizado com `patient_related_persons` (`is_payer = true`).
4. Checklist normalizado com `item_code` e documentos associados.
5. Painel unificado de status funcionando no cabecalho do paciente.
6. Eventos relevantes registrados em timeline/auditoria.
7. `npm run verify` sem erros.
8. Sem duplicidades em `billing_entities` por tenant (constraints e dedupe aplicados).

## 7) Decisões Finalizadas

- [x] Enum de `administrative_status` e painel unificado de status.
- [x] Pagador canonico via `billing_entities` e `primary_payer_entity_id`.
- [x] Politicas por `care_policy_profiles` e `policy_profile_id`.
- [x] Checklist canonico em `patient_onboarding_checklist`.
- [x] RLS via `app_private.current_tenant_id()`.

## 8) Backlog Pós-Autorização

- Detalhar contratos de integracao com operadoras/SUS.
- Definir taxonomia final de eventos para timeline.
- Consolidar estrategia de snapshot de contexto para IA.
