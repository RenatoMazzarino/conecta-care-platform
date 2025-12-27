# CONTRATO - ABA04: Pacientes - Administrativo e Financeiro (Modelo Canonico)

**Status:** Aprovado
**Versao:** 1.3.0
**Data:** 2025-12-22
**Autor:** Codex

## 1. Visao Geral e Escopo

Este contrato define o modelo canonico da Aba 04 (Administrativo e Financeiro) do modulo de Pacientes. O foco e manter apenas dados cadastrais administrativos e financeiros do paciente, sem transacoes financeiras. O mapeamento completo do legado esta documentado no mapa dedicado.

## 2. Escopo

**IN:**

- Dados administrativos do paciente (status, admissao, contratos e responsaveis).
- Dados cadastrais de faturamento e pagador.
- Checklist administrativo e documentos associados.
- RLS por `tenant_id`, auditoria e soft delete.

**OUT:**

- Lancamentos financeiros e operacoes transacionais (boletos, NF, baixas, conciliacao).
- Regras de escala, plantao ou agenda assistencial.
- Dados clinicos e prontuario.

## 3. Modelo Canonico

### 3.1 `public.patient_admin_financial_profile`

Tabela 1:1 por paciente, consolidando informacoes administrativas e financeiras cadastrais.

#### Identificacao e status

|Coluna|Tipo|Obrigatorio|Default|Validacao|Observacoes|
|---|---|---|---|---|---|
|`patient_id`|`UUID`|SIM||FK para `patients.id`|Chave primaria.|
|`tenant_id`|`UUID`|SIM||FK para `tenants.id`|RLS obrigatorio.|
|`administrative_status`|`TEXT`|SIM|`em_cadastro`|Enum (ver secao 5)|Status administrativo.|
|`administrative_status_reason`|`TEXT`|NAO|||Motivo de status.|
|`administrative_status_changed_at`|`TIMESTAMPTZ`|NAO|||Data da mudanca de status.|
|`admission_type`|`TEXT`|NAO||Enum (ver secao 5)|Tipo de admissao.|
|`admission_date`|`DATE`|NAO|||Data de admissao.|
|`discharge_prediction_date`|`DATE`|NAO|||Previsao de alta.|
|`discharge_date`|`DATE`|NAO||`>= admission_date`|Data de alta efetiva.|
|`admission_source`|`TEXT`|NAO|||Origem da admissao.|
|`demand_origin`|`TEXT`|NAO|||Origem da demanda.|
|`demand_origin_description`|`TEXT`|NAO|||Descricao da origem.|
|`acquisition_channel`|`TEXT`|NAO|||Canal de aquisicao.|
|`service_package_name`|`TEXT`|NAO|||Pacote de servico.|
|`service_package_description`|`TEXT`|NAO|||Descricao do pacote.|
|`policy_profile_id`|`UUID`|NAO||FK para `care_policy_profiles.id`|Perfil de regras do paciente.|

#### Contrato e identificadores

|Coluna|Tipo|Obrigatorio|Default|Validacao|Observacoes|
|---|---|---|---|---|---|
|`contract_id`|`TEXT`|NAO|||Identificador do contrato.|
|`external_contract_id`|`TEXT`|NAO|||Identificador externo/ERP.|
|`contract_start_date`|`DATE`|NAO|||Inicio do contrato.|
|`contract_end_date`|`DATE`|NAO||`>= contract_start_date`|Fim do contrato.|
|`contract_status`|`TEXT`|NAO||Enum (ver secao 5)|Status do contrato.|
|`contract_status_reason`|`TEXT`|NAO|||Motivo do status do contrato.|
|`contract_category`|`TEXT`|NAO||Enum (ver secao 5)|Categoria do contrato.|
|`renewal_type`|`TEXT`|NAO||Enum (ver secao 5)|Tipo de renovacao.|
|`authorization_number`|`TEXT`|NAO|||Numero de autorizacao.|
|`judicial_case_number`|`TEXT`|NAO|||Numero do processo judicial.|
|`official_letter_number`|`TEXT`|NAO|||Numero de oficio.|
|`cost_center_id`|`TEXT`|NAO|||Centro de custo.|
|`erp_case_code`|`TEXT`|NAO|||Codigo do caso no ERP.|

#### Responsaveis e pagador

|Coluna|Tipo|Obrigatorio|Default|Validacao|Observacoes|
|---|---|---|---|---|---|
|`commercial_responsible_id`|`UUID`|NAO||FK para `auth.users.id`|Responsavel comercial (display via `user_profiles`).|
|`contract_manager_id`|`UUID`|NAO||FK para `auth.users.id`|Gestor do contrato (display via `user_profiles`).|
|`payer_admin_contact_id`|`UUID`|NAO||FK para `patient_related_persons.id`|Contato administrativo do pagador.|
|`payer_admin_contact_description`|`TEXT`|NAO|||Observacao do contato.|
|`primary_payer_entity_id`|`UUID`|NAO||FK para `billing_entities.id`|Entidade pagadora canonica.|
|`primary_payer_related_person_id`|`UUID`|NAO||FK para `patient_related_persons.id`|Pagador PF vinculado ao paciente.|
|`payer_relation`|`TEXT`|NAO|||Relacao do pagador com o paciente.|
|`financial_responsible_name`|`TEXT`|NAO|||Nome do responsavel financeiro.|
|`financial_responsible_contact`|`TEXT`|NAO|||Contato do responsavel financeiro.|

#### Financeiro e faturamento

|Coluna|Tipo|Obrigatorio|Default|Validacao|Observacoes|
|---|---|---|---|---|---|
|`bond_type`|`TEXT`|NAO||Enum (ver secao 5)|Tipo de vinculo.|
|`insurer_name`|`TEXT`|NAO|||Operadora.|
|`plan_name`|`TEXT`|NAO|||Plano.|
|`insurance_card_number`|`TEXT`|NAO|||Numero da carteirinha.|
|`insurance_card_validity`|`DATE`|NAO|||Validade da carteirinha.|
|`monthly_fee`|`NUMERIC(10,2)`|NAO|`0`||Mensalidade.|
|`billing_due_day`|`INTEGER`|NAO||`1..31`|Dia de vencimento.|
|`billing_status`|`TEXT`|NAO|`active`|Enum (ver secao 5)|Status de cobranca.|
|`payment_method`|`TEXT`|NAO||Enum (ver secao 5)|Forma de pagamento.|
|`billing_model`|`TEXT`|NAO||Enum (ver secao 5)|Modelo de cobranca.|
|`billing_base_value`|`NUMERIC`|NAO|||Valor base.|
|`billing_periodicity`|`TEXT`|NAO|||Periodicidade.|
|`payment_terms`|`TEXT`|NAO|||Condicoes de pagamento.|
|`grace_period_days`|`INTEGER`|NAO|`0`||Dias de carencia.|
|`copay_percent`|`NUMERIC`|NAO|||Percentual de coparticipacao.|
|`readjustment_index`|`TEXT`|NAO|||Indice de reajuste.|
|`readjustment_month`|`INTEGER`|NAO|||Mes de reajuste.|
|`late_fee_percent`|`NUMERIC`|NAO|`0`||Multa por atraso.|
|`daily_interest_percent`|`NUMERIC`|NAO|`0`||Juros diarios.|
|`discount_early_payment`|`NUMERIC`|NAO|`0`||Desconto por pagamento antecipado.|
|`discount_days_limit`|`INTEGER`|NAO|||Limite de dias para desconto.|
|`card_holder_name`|`TEXT`|NAO|||Nome do titular do cartao.|
|`invoice_delivery_method`|`TEXT`|NAO||Enum (ver secao 5)|Metodo de envio.|
|`receiving_account_info`|`TEXT`|NAO|||Conta de recebimento.|
|`financial_notes`|`TEXT`|NAO|||Observacoes financeiras.|

#### Checklist e notas

|Coluna|Tipo|Obrigatorio|Default|Validacao|Observacoes|
|---|---|---|---|---|---|
|`checklist_complete`|`BOOLEAN`|NAO|`false`||Conclusao do checklist.|
|`checklist_notes`|`TEXT`|NAO|||Observacoes do checklist.|
|`admin_notes`|`TEXT`|NAO|||Observacoes administrativas.|

#### Auditoria e soft delete

|Coluna|Tipo|Obrigatorio|Default|Validacao|Observacoes|
|---|---|---|---|---|---|
|`created_at`|`TIMESTAMPTZ`|SIM|`now()`||Criacao do registro.|
|`updated_at`|`TIMESTAMPTZ`|SIM|`now()`||Ultima atualizacao.|
|`created_by`|`UUID`|SIM||FK para `auth.users.id`|Autor da criacao.|
|`updated_by`|`UUID`|SIM||FK para `auth.users.id`|Autor da atualizacao.|
|`deleted_at`|`TIMESTAMPTZ`|NAO|||Soft delete.|

### 3.2 `public.billing_entities`

Entidade pagadora canonica, tenant-scoped e reutilizavel entre pacientes (master data).

|Coluna|Tipo|Obrigatorio|Default|Validacao|Observacoes|
|---|---|---|---|---|---|
|`id`|`UUID`|SIM|`gen_random_uuid()`||Chave primaria.|
|`tenant_id`|`UUID`|SIM||FK para `tenants.id`|RLS obrigatorio.|
|`kind`|`TEXT`|SIM||Enum (ver secao 5)|Tipo de entidade pagadora.|
|`name`|`TEXT`|SIM|||Nome de exibicao.|
|`legal_name`|`TEXT`|NAO|||Razao social quando aplicavel.|
|`doc_type`|`TEXT`|NAO||Obrigatorio se `doc_number` estiver preenchido|Tipo de documento.|
|`doc_number`|`TEXT`|NAO|||Documento.|
|`contact_email`|`TEXT`|NAO|||Email de contato.|
|`contact_phone`|`TEXT`|NAO|||Telefone de contato.|
|`billing_address_cep`|`TEXT`|NAO|||CEP de cobranca.|
|`billing_address_street`|`TEXT`|NAO|||Rua de cobranca.|
|`billing_address_number`|`TEXT`|NAO|||Numero de cobranca.|
|`billing_address_neighborhood`|`TEXT`|NAO|||Bairro de cobranca.|
|`billing_address_city`|`TEXT`|NAO|||Cidade de cobranca.|
|`billing_address_state`|`TEXT`|NAO|||UF de cobranca.|
|`created_at`|`TIMESTAMPTZ`|SIM|`now()`||Criacao do registro.|
|`updated_at`|`TIMESTAMPTZ`|SIM|`now()`||Ultima atualizacao.|
|`created_by`|`UUID`|SIM||FK para `auth.users.id`|Autor da criacao.|
|`updated_by`|`UUID`|SIM||FK para `auth.users.id`|Autor da atualizacao.|
|`deleted_at`|`TIMESTAMPTZ`|NAO|||Soft delete.|

### 3.3 `public.care_policy_profiles`

Perfil de regras por tenant, usado para definir politicas operacionais e financeiras.

|Coluna|Tipo|Obrigatorio|Default|Validacao|Observacoes|
|---|---|---|---|---|---|
|`id`|`UUID`|SIM|`gen_random_uuid()`||Chave primaria.|
|`tenant_id`|`UUID`|SIM||FK para `tenants.id`|RLS obrigatorio.|
|`name`|`TEXT`|SIM|||Nome do perfil.|
|`description`|`TEXT`|NAO|||Descricao do perfil.|
|`rule_set`|`JSONB`|SIM|||Regras de faturamento, inventario, escalas e documentos.|
|`is_default`|`BOOLEAN`|SIM|`false`||Perfil default do tenant.|
|`version`|`INTEGER`|SIM|`1`|`>= 1`|Versao incremental do perfil.|
|`created_at`|`TIMESTAMPTZ`|SIM|`now()`||Criacao do registro.|
|`updated_at`|`TIMESTAMPTZ`|SIM|`now()`||Ultima atualizacao.|
|`created_by`|`UUID`|SIM||FK para `auth.users.id`|Autor da criacao.|
|`updated_by`|`UUID`|SIM||FK para `auth.users.id`|Autor da atualizacao.|
|`deleted_at`|`TIMESTAMPTZ`|NAO|||Soft delete.|

### 3.4 `public.patient_onboarding_checklist`

Tabela para itens do checklist administrativo associados ao paciente.

|Coluna|Tipo|Obrigatorio|Default|Validacao|Observacoes|
|---|---|---|---|---|---|
|`id`|`UUID`|SIM|`gen_random_uuid()`||Chave primaria.|
|`tenant_id`|`UUID`|SIM||FK para `tenants.id`|RLS obrigatorio.|
|`patient_id`|`UUID`|SIM||FK para `patients.id`|Paciente.|
|`item_code`|`TEXT`|SIM||Enum (ver secao 5)|Codigo do item.|
|`item_description`|`TEXT`|NAO|||Descricao livre do item.|
|`is_completed`|`BOOLEAN`|SIM|`false`||Item concluido.|
|`completed_at`|`TIMESTAMPTZ`|NAO|||Data/hora de conclusao.|
|`completed_by_user_id`|`UUID`|NAO||FK para `auth.users.id`|Usuario que concluiu.|
|`completed_by_label`|`TEXT`|NAO|||Nome livre quando nao houver usuario.|
|`document_id`|`UUID`|NAO||FK para `patient_documents.id`|Documento associado.|
|`created_at`|`TIMESTAMPTZ`|SIM|`now()`||Criacao do item.|
|`updated_at`|`TIMESTAMPTZ`|SIM|`now()`||Ultima atualizacao.|
|`created_by`|`UUID`|SIM||FK para `auth.users.id`|Autor da criacao.|
|`updated_by`|`UUID`|SIM||FK para `auth.users.id`|Autor da atualizacao.|
|`deleted_at`|`TIMESTAMPTZ`|NAO|||Soft delete.|

### 3.5 `public.patient_timeline_events`

Eventos de linha do tempo para status, pagador, politica e checklist (observabilidade e IA).

|Coluna|Tipo|Obrigatorio|Default|Validacao|Observacoes|
|---|---|---|---|---|---|
|`id`|`UUID`|SIM|`gen_random_uuid()`||Chave primaria.|
|`tenant_id`|`UUID`|SIM||FK para `tenants.id`|RLS obrigatorio.|
|`patient_id`|`UUID`|SIM||FK para `patients.id`|Paciente.|
|`event_time`|`TIMESTAMPTZ`|SIM|`now()`||Momento do evento.|
|`event_type`|`TEXT`|SIM|||Tipo do evento.|
|`event_category`|`TEXT`|NAO|||Categoria funcional.|
|`title`|`TEXT`|NAO|||Titulo curto.|
|`description`|`TEXT`|NAO|||Descricao detalhada.|
|`tone`|`TEXT`|SIM|`default`|Enum (ver secao 5)|Tom visual.|
|`payload`|`JSONB`|NAO|||Payload estruturado.|
|`created_at`|`TIMESTAMPTZ`|SIM|`now()`||Criacao do registro.|
|`updated_at`|`TIMESTAMPTZ`|SIM|`now()`||Ultima atualizacao.|
|`created_by`|`UUID`|SIM||FK para `auth.users.id`|Autor da criacao.|
|`updated_by`|`UUID`|SIM||FK para `auth.users.id`|Autor da atualizacao.|
|`deleted_at`|`TIMESTAMPTZ`|NAO|||Soft delete.|

## 4. Estrutura de UI (cards)

- **Contrato:** `administrative_status`, `administrative_status_reason`, `admission_type`, `admission_date`, `discharge_prediction_date`, `discharge_date`, `admission_source`, `demand_origin`, `demand_origin_description`, `acquisition_channel`, `service_package_name`, `service_package_description`, `policy_profile_id`, `contract_id`, `external_contract_id`, `contract_start_date`, `contract_end_date`, `contract_status`, `contract_status_reason`, `contract_category`, `renewal_type`, `authorization_number`, `judicial_case_number`, `official_letter_number`, `cost_center_id`, `erp_case_code`.
- **Responsaveis:** `commercial_responsible_id`, `contract_manager_id`, `financial_responsible_name`, `financial_responsible_contact`, `payer_admin_contact_id`, `payer_admin_contact_description`.
- **Pagador:** `primary_payer_entity_id`, `billing_entities.kind`, `billing_entities.name`, `billing_entities.legal_name`, `billing_entities.doc_type`, `billing_entities.doc_number`, `billing_entities.contact_email`, `billing_entities.contact_phone`, `billing_entities.billing_address_cep`, `billing_entities.billing_address_street`, `billing_entities.billing_address_number`, `billing_entities.billing_address_neighborhood`, `billing_entities.billing_address_city`, `billing_entities.billing_address_state`, `primary_payer_related_person_id`, `payer_relation`.
- **Faturamento:** `bond_type`, `insurer_name`, `plan_name`, `insurance_card_number`, `insurance_card_validity`, `monthly_fee`, `billing_due_day`, `billing_status`, `payment_method`, `billing_model`, `billing_base_value`, `billing_periodicity`, `payment_terms`, `grace_period_days`, `copay_percent`, `readjustment_index`, `readjustment_month`, `late_fee_percent`, `daily_interest_percent`, `discount_early_payment`, `discount_days_limit`, `card_holder_name`, `invoice_delivery_method`, `receiving_account_info`, `financial_notes`.
- **Checklist:** itens de `patient_onboarding_checklist` (`item_code`, `item_description`, `is_completed`, `completed_at`, `completed_by_user_id`, `completed_by_label`, `document_id`) + resumo (`checklist_complete`, `checklist_notes`).

## 5. Regras, validacoes e enums

- `administrative_status`: `em_cadastro`, `pendente_documentos`, `pendente_autorizacao`, `em_implantacao`, `pronto_para_faturar`, `faturamento_suspenso`, `encerrado_administrativo`.
- `contract_status`: `Proposta`, `Em_Implantacao`, `Ativo`, `Suspenso`, `Encerrado`, `Cancelado`, `Recusado`.
- `contract_status` indica fase e vigencia do contrato/atendimento; `administrative_status` indica prontidao administrativa e pendencias, podendo bloquear inicio ou faturamento mesmo com contrato valido.
- `billing_entities.kind`: `person`, `company`, `insurer`, `broker`, `public`.
- Rotulos de UI recomendados (sem alterar o enum tecnico): `person` = "Pessoa (CPF)", `company` = "Empresa (CNPJ)", `insurer` = "Operadora", `broker` = "Corretora", `public` = "Orgao Publico/SUS".
- `admission_type`: `home_care`, `paliativo`, `procedimento_pontual`, `reabilitacao`.
- `contract_category`: `Particular_Premium`, `Convenio_Padrao`, `Judicial`, `SUS`, `Cortesia`.
- `renewal_type`: `Automatica`, `Periodo_Fixo`, `Por_Laudo`, `Judicial`.
- `bond_type`: `Plano_Saude`, `Particular`, `Convenio`, `Publico`.
- `billing_status`: `active`, `suspended`, `defaulting`.
- `payment_method`: `Boleto`, `Pix`, `Transferencia`, `Debito_Automatico`, `Cartao_Credito`, `Dinheiro`, `Outro`.
- `billing_model`: `Mensalidade`, `Diaria`, `Plantao_12h`, `Plantao_24h`, `Visita`, `Pacote_Fechado`, `Outro`.
- `invoice_delivery_method`: `Email`, `Portal`, `WhatsApp`, `Correio`, `Nao_Envia`.
- `item_code`: `CONTRACT`, `CONSENT`, `MEDICAL_REPORT`, `LEGAL_DOCS`, `FINANCIAL_DOCS`, `JUDICIAL`, `ADDRESS_PROOF`, `LEGAL_GUARDIAN_DOCS`, `FINANCIAL_RESPONSIBLE_DOCS`, `OTHER_DOCS`.
- `patient_timeline_events.tone`: `default`, `success`, `warning`, `critical`.
- Validacoes obrigatorias: `billing_due_day` entre 1 e 31; `contract_end_date` >= `contract_start_date` quando ambas preenchidas; `discharge_date` >= `admission_date` quando ambas preenchidas; `doc_type` obrigatorio quando `doc_number` estiver preenchido.

## 6. Painel unificado de status do paciente

A UI deve exibir no cabecalho do paciente um mini-card com `contract_status`, `administrative_status`, `billing_status` (quando aplicavel) e flags criticas (checklist completo, politica aplicada, pendencias de documentos).

## 7. Pagador, politicas e Aba03

- Quem paga e o regime/origem que altera regras sao dimensoes distintas: `billing_entities` define o pagador e `care_policy_profiles` define o perfil de regras do atendimento.
- A origem do paciente (SUS/Operadora/Particular/etc) deve mapear para um `policy_profile_id`, com possibilidade de override por paciente.
- `policy_profile_id` impacta inventario, financeiro, escalas e exigencia documental; `rule_set` e a base para automacoes.
- Ao criar `billing_entities.kind = person` como pagador, criar/atualizar `patient_related_persons` com `is_payer = true` e `role_type = Pagador`; a Aba03 exibe o badge "Pagador" com base nesse flag.
- `user_profiles` e usado apenas para exibicao (display); as FKs de usuarios apontam para `auth.users.id`.
- A UI deve reutilizar `billing_entities` existentes (busca por documento/nome) e criar novas entidades somente quando nao houver correspondencia.

## 8. RLS e `tenant_id`

Todas as queries devem filtrar por `tenant_id` (RLS), garantindo isolamento multi-tenant:
`tenant_id = app_private.current_tenant_id()`.
Essa funcao resolve `auth.jwt()->>'tenant_id'` ou `current_setting('app.tenant_id')` quando presente.

## 9. Auditoria

- Colunas obrigatorias: `created_at`, `updated_at`, `created_by`, `updated_by`.
- Auditoria de alteracoes via `system_audit_logs` (entidade, acao, diffs, usuario, timestamp).

## 10. Soft delete

Todas as tabelas da Aba 04 devem ter `deleted_at` e usar soft delete.

## 11. Indices e constraints

- `patient_admin_financial_profile`: indices em `tenant_id`, `contract_id`, `external_contract_id`, `policy_profile_id`, `primary_payer_entity_id`.
- `billing_entities`: indices em `tenant_id`, `kind`, `doc_type`, `doc_number` e unique recomendado em `(tenant_id, kind, doc_type, doc_number_normalized)` quando existir documento.
- `care_policy_profiles`: unique recomendado em `(tenant_id, name)` e index em `is_default`.
- Checklist: unique `(patient_id, item_code)`.
- `patient_timeline_events`: indices em `tenant_id`, `(patient_id, event_time desc)` e `event_type`.
- FKs principais: `patient_id` -> `patients.id`, `tenant_id` -> `tenants.id`, `policy_profile_id` -> `care_policy_profiles.id`, `primary_payer_entity_id` -> `billing_entities.id`, `payer_admin_contact_id` -> `patient_related_persons.id`, `primary_payer_related_person_id` -> `patient_related_persons.id`, `document_id` -> `patient_documents.id`.
- Regras anti-duplicidade:
  - `patient_admin_financial_profile` e 1:1 com paciente; usar upsert por `patient_id` e `tenant_id`.
  - `billing_entities` deve ser deduplicado por `(tenant_id, kind, doc_type, doc_number)` quando documento existir; normalizar `doc_number` (apenas digitos).
  - Quando `doc_number` estiver vazio, comparar por `(tenant_id, kind, lower(legal_name ou name))` antes de criar nova entidade.
  - `patient_onboarding_checklist` deve usar upsert por `(patient_id, item_code)` para evitar itens duplicados.

## 12. Integracoes & IA Entranhada (Ganchos de Produto)

1. **Assinatura Digital e Protocolo**
   - Documentos de checklist registram provider (ex.: docusign, clicksign), `envelope_id`, status, timestamps e signer roles.
   - Action canonica: `sendContractForSignature` registra documento e evento na timeline.
   - Eventos esperados: `contract_sent`, `contract_signed`, `contract_voided`.

1. **Policy Engine (Care Policy Profiles)**
   - `care_policy_profiles.rule_set` e `version` sao a base para automacoes.
   - Action canonica: `setPolicyProfile` registra alteracao e evento na timeline (`policy_profile_changed`).

1. **Ingestao de Documentos do Checklist**
   - Upload e extracao de documentos alimentam `patient_documents` e vinculam `document_id` nos itens do checklist.
   - Action canonica: `requestChecklistDocumentIngestion` registra evento e vinculo no checklist.
   - Eventos registrados em `patient_timeline_events` e usados no `patient_context_snapshot`.

1. **Integracao Billing/ERP**
   - Interface de provider para exportacao e reconciliacao de cobranca (sem SDK).
   - Actions canonicas: `sendBillingExport` e `reconcileBillingStatus` registram eventos na timeline.
   - Eventos de export/reconcile registrados na timeline.

1. **Observabilidade & IA**
   - `patient_timeline_events` + `patient_context_snapshot` (derivado) sustentam auditoria e copiloto interno.
   - Toda automacao exige rastreabilidade e explainability operacional.

## 13. Mapa do legado

Mapa completo de inventario e decisoes KEEP/MOVE/DROP:
[ABA04: Mapa do Legado - Administrativo e Financeiro](../../legacy_maps/pacientes/ABA04_ADMIN_FINANCEIRO_LEGADO_MAP.md)

## 14. DoD (Definition of Done)

### DoD Documental

- [ ] Contrato atualizado e aprovado.
- [ ] Mapa de legado 100% inventariado e validado.
- [ ] Plano de implementacao alinhado ao contrato e mapa.

### DoD Tecnico

- [ ] Migrations para tabelas canonicas, `billing_entities`, `care_policy_profiles` e checklist.
- [ ] Backfill executado conforme mapa do legado.
- [ ] RLS por `tenant_id` em todas as tabelas novas.
- [ ] Types e schemas (Zod) atualizados.
- [ ] Actions CRUD implementadas e testadas.
- [ ] UI com 5 cards e painel unificado de status funcionando.
- [ ] `npm run verify` sem erros.

## 15. Decisões Finalizadas

- [x] Enum de `administrative_status` definido e diferente de `contract_status`.
- [x] RLS padrao via `app_private.current_tenant_id()`.
- [x] Pagador canonico via `billing_entities` e FK `primary_payer_entity_id`.
- [x] Perfil de regras via `care_policy_profiles` e `policy_profile_id`.
- [x] Checklist canonico em `patient_onboarding_checklist`.
- [x] FKs de usuarios padronizadas em `auth.users.id`.

## 16. Backlog Pós-Autorização

- Detalhar payloads e taxonomia de `patient_timeline_events` para observabilidade.
- Evoluir adapters de operadoras/SUS com contratos de integracao.
- Padronizar `patient_context_snapshot` para consumo por IA.
