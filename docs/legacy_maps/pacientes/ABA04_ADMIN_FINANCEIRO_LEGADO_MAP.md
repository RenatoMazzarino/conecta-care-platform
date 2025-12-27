# MAPA DO LEGADO - ABA04: Pacientes - Administrativo e Financeiro

**Status:** Aprovado
**Versao:** 1.3.0
**Data:** 2025-12-22
**Autor:** Codex

## 1. Visao Geral

Este documento inventaria todas as colunas legadas relevantes para a Aba 04 e registra a decisao de cada uma (KEEP, MOVE, DROP). O modelo canonico esta definido no contrato:
[Contrato Canonico - ABA04 Administrativo e Financeiro](../../contracts/pacientes/ABA04_ADMIN_FINANCEIRO.md)

RLS nas tabelas canonicas usa `app_private.current_tenant_id()`.

## 2. Fonte do inventario

- Fonte: `docs/repo_antigo/schema_current.sql` (snapshot legado).
- Tabelas legadas inventariadas:
  - `public.patient_admin_info`
  - `public.patient_administrative_profiles` (tabela depreciada)
  - `public.patient_financial_profiles`

## 3. Regras de consolidacao e precedencia

- Campos duplicados sao consolidados no canonico conforme o contrato.
- `admission_date`: preferir `patient_admin_info.start_date`; fallback `patient_administrative_profiles.admission_date`.
- `discharge_date`: preferir `patient_admin_info.effective_discharge_date`, depois `patient_admin_info.end_date`, depois `patient_administrative_profiles.discharge_date`.
- `contract_status`: preferir `patient_admin_info.contract_status_enum`; fallback `patient_administrative_profiles.contract_status`.
- `contract_id`: preferir `patient_admin_info.contract_id`; fallback `patient_administrative_profiles.contract_number`.
- `created_at` e `updated_at`: preferir `patient_admin_info` como base do perfil canonico.
- `billing_entities.name`: preferir `patient_financial_profiles.payer_name`; fallback `patient_admin_info.primary_payer_description`.
- `billing_entities.legal_name`: usar `payer_name` quando `kind` for `company`, `insurer`, `broker` ou `public`.
- `billing_entities.kind`: preferir `patient_financial_profiles.payer_type`; fallback `patient_admin_info.primary_payer_type`.
- `billing_entities.doc_type` e `billing_entities.doc_number`: preferir `patient_financial_profiles.payer_doc_*`.
- `billing_entities.contact_email` e `billing_entities.contact_phone`: usar `billing_email_list` e `billing_phone`.
- `billing_entities.billing_address_*`: usar `billing_cep`, `billing_street`, `billing_number`, `billing_neighborhood`, `billing_city`, `billing_state`.
- `primary_payer_entity_id`: usar `patient_admin_info.primary_payer_legal_entity_id` quando existir; caso ausente, criar `billing_entities` a partir de `payer_*` e vincular o `id` gerado.
- `policy_profile_id`: definido por regra de origem do paciente (SUS/Operadora/Particular) configurada por tenant.
- Deduplicar `billing_entities` por `(tenant_id, kind, doc_type, doc_number)` com `doc_number` normalizado (apenas digitos). Sem documento, comparar por `(tenant_id, kind, lower(legal_name ou name))`.
- Mapear `payer_type` legado para `billing_entities.kind`: `PF/Pessoa/CPF` -> `person`, `PJ/Empresa/CNPJ` -> `company`, `Operadora/Plano` -> `insurer`, `Corretora` -> `broker`, `SUS/Prefeitura/Governo` -> `public`.

## 4. Mapeamento - `public.patient_admin_info`

| Coluna legada | Tipo/Obs | Destino canonico | Decisao | Regra/justificativa | Observacoes de duplicidade |
| --- | --- | --- | --- | --- | --- |
| `patient_id` | `uuid` | `patient_admin_financial_profile.patient_id` | KEEP | Identificador do paciente. | Duplicado em `patient_financial_profiles.patient_id` e `patient_administrative_profiles.patient_id`. |
| `tenant_id` | `uuid` | `patient_admin_financial_profile.tenant_id` | KEEP | RLS por tenant. | Duplicado em `patient_financial_profiles.tenant_id`. |
| `status` | `text` | `patient_admin_financial_profile.administrative_status` | KEEP | Normalizar para enum administrativo canonico. | Sem duplicidade direta. |
| `admission_type` | `text` | `patient_admin_financial_profile.admission_type` | KEEP | Tipo de admissao no canonico. | Duplicado em `patient_administrative_profiles.admission_type`. |
| `complexity` | `text` | `patient_clinical_profiles.complexity_level` | MOVE | Campo clinico. | Normalizar para enum clinico. |
| `service_package` | `text` | — | DROP | Duplicado com `service_package_name`. | Ver `service_package_name` e `service_package_description`. |
| `start_date` | `date` | `patient_admin_financial_profile.admission_date` | KEEP | Data de admissao. | Consolidar com `patient_administrative_profiles.admission_date`. |
| `end_date` | `date` | `patient_admin_financial_profile.discharge_date` | KEEP | Data de alta. | Consolidar com `effective_discharge_date`. |
| `supervisor_id` | `uuid` | `patient_scale_rules.supervisor_id` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `escalista_id` | `uuid` | `patient_scale_rules.escalista_id` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `nurse_responsible_id` | `uuid` | `patient_clinical_profiles.nurse_responsible_id` | MOVE | Campo clinico. | Destino em Clinico. |
| `frequency` | `text` | `patient_scale_rules.frequency` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `operation_area` | `text` | `patient_scale_rules.operation_area` | MOVE | Operacao vinculada a escalas/atendimento. | Destino em Escalas. |
| `admission_source` | `text` | `patient_admin_financial_profile.admission_source` | KEEP | Origem administrativa. | Sem duplicidade direta. |
| `contract_id` | `text` | `patient_admin_financial_profile.contract_id` | KEEP | Identificador do contrato. | Duplicado com `patient_administrative_profiles.contract_number`. |
| `notes_internal` | `text` | — | DROP | Duplicado por `admin_notes`. | Consolidar em `admin_notes`. |
| `created_at` | `timestamptz` | `patient_admin_financial_profile.created_at` | KEEP | Auditoria. | Preferencia sobre outras fontes. |
| `updated_at` | `timestamptz` | `patient_admin_financial_profile.updated_at` | KEEP | Auditoria. | Preferencia sobre outras fontes. |
| `demand_origin` | `text` | `patient_admin_financial_profile.demand_origin` | KEEP | Origem da demanda. | Sem duplicidade direta. |
| `primary_payer_type` | `text` | `billing_entities.kind` | MOVE | Canonizar tipo do pagador em `billing_entities`. | Converter valores legados. |
| `contract_start_date` | `date` | `patient_admin_financial_profile.contract_start_date` | KEEP | Inicio do contrato. | Sem duplicidade direta. |
| `contract_end_date` | `date` | `patient_admin_financial_profile.contract_end_date` | KEEP | Fim do contrato. | Sem duplicidade direta. |
| `renewal_type` | `public.renewal_type_enum` | `patient_admin_financial_profile.renewal_type` | KEEP | Tipo de renovacao. | Sem duplicidade direta. |
| `external_contract_id` | `text` | `patient_admin_financial_profile.external_contract_id` | KEEP | Identificador externo. | Sem duplicidade direta. |
| `authorization_number` | `text` | `patient_admin_financial_profile.authorization_number` | KEEP | Autorizacao contratual. | Sem duplicidade direta. |
| `judicial_case_number` | `text` | `patient_admin_financial_profile.judicial_case_number` | KEEP | Processo judicial. | Sem duplicidade direta. |
| `status_reason` | `text` | `patient_admin_financial_profile.administrative_status_reason` | KEEP | Motivo do status. | Sem duplicidade direta. |
| `status_changed_at` | `timestamptz` | `patient_admin_financial_profile.administrative_status_changed_at` | KEEP | Data da mudanca de status. | Sem duplicidade direta. |
| `commercial_responsible_id` | `uuid` | `patient_admin_financial_profile.commercial_responsible_id` | KEEP | Responsavel comercial. | Sem duplicidade direta. |
| `contract_manager_id` | `uuid` | `patient_admin_financial_profile.contract_manager_id` | KEEP | Gestor do contrato. | Sem duplicidade direta. |
| `scale_rule_start_date` | `date` | `patient_scale_rules.scale_rule_start_date` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `scale_rule_end_date` | `date` | `patient_scale_rules.scale_rule_end_date` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `scale_mode` | `text` | `patient_scale_rules.scale_mode` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `scale_notes` | `text` | `patient_scale_rules.scale_notes` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `chk_contract_ok` | `boolean` | `patient_onboarding_checklist.is_completed` | MOVE | Normalizar checklist (item_code=CONTRACT). | Migrar para tabela de itens. |
| `chk_contract_at` | `date` | `patient_onboarding_checklist.completed_at` | MOVE | Normalizar checklist (item_code=CONTRACT). | Converter para timestamptz. |
| `chk_contract_by` | `text` | `patient_onboarding_checklist.completed_by_label` | MOVE | Normalizar checklist (item_code=CONTRACT). | Campo legado nao e uuid. |
| `chk_consent_ok` | `boolean` | `patient_onboarding_checklist.is_completed` | MOVE | Normalizar checklist (item_code=CONSENT). | Migrar para tabela de itens. |
| `chk_consent_at` | `date` | `patient_onboarding_checklist.completed_at` | MOVE | Normalizar checklist (item_code=CONSENT). | Converter para timestamptz. |
| `chk_consent_by` | `text` | `patient_onboarding_checklist.completed_by_label` | MOVE | Normalizar checklist (item_code=CONSENT). | Campo legado nao e uuid. |
| `chk_medical_report_ok` | `boolean` | `patient_onboarding_checklist.is_completed` | MOVE | Normalizar checklist (item_code=MEDICAL_REPORT). | Migrar para tabela de itens. |
| `chk_medical_report_at` | `date` | `patient_onboarding_checklist.completed_at` | MOVE | Normalizar checklist (item_code=MEDICAL_REPORT). | Converter para timestamptz. |
| `chk_medical_report_by` | `text` | `patient_onboarding_checklist.completed_by_label` | MOVE | Normalizar checklist (item_code=MEDICAL_REPORT). | Campo legado nao e uuid. |
| `chk_legal_docs_ok` | `boolean` | `patient_onboarding_checklist.is_completed` | MOVE | Normalizar checklist (item_code=LEGAL_DOCS). | Migrar para tabela de itens. |
| `chk_financial_docs_ok` | `boolean` | `patient_onboarding_checklist.is_completed` | MOVE | Normalizar checklist (item_code=FINANCIAL_DOCS). | Migrar para tabela de itens. |
| `chk_judicial_ok` | `boolean` | `patient_onboarding_checklist.is_completed` | MOVE | Normalizar checklist (item_code=JUDICIAL). | Migrar para tabela de itens. |
| `checklist_notes` | `text` | `patient_admin_financial_profile.checklist_notes` | KEEP | Observacoes do checklist. | Duplicado com `checklist_notes_detailed`. |
| `effective_discharge_date` | `date` | `patient_admin_financial_profile.discharge_date` | KEEP | Data de alta efetiva. | Precedencia sobre `end_date`. |
| `service_package_description` | `text` | `patient_admin_financial_profile.service_package_description` | KEEP | Descricao do pacote. | Duplicado com `service_package_name`. |
| `demand_origin_description` | `text` | `patient_admin_financial_profile.demand_origin_description` | KEEP | Detalhe da origem. | Sem duplicidade direta. |
| `official_letter_number` | `text` | `patient_admin_financial_profile.official_letter_number` | KEEP | Numero de oficio. | Sem duplicidade direta. |
| `contract_status_reason` | `text` | `patient_admin_financial_profile.contract_status_reason` | KEEP | Motivo do status do contrato. | Sem duplicidade direta. |
| `admin_notes` | `text` | `patient_admin_financial_profile.admin_notes` | KEEP | Observacoes administrativas. | Duplicado com `notes_internal`. |
| `cost_center_id` | `text` | `patient_admin_financial_profile.cost_center_id` | KEEP | Centro de custo. | Sem duplicidade direta. |
| `erp_case_code` | `text` | `patient_admin_financial_profile.erp_case_code` | KEEP | Codigo no ERP. | Sem duplicidade direta. |
| `contract_category` | `public.contract_category_enum` | `patient_admin_financial_profile.contract_category` | KEEP | Categoria do contrato. | Sem duplicidade direta. |
| `acquisition_channel` | `text` | `patient_admin_financial_profile.acquisition_channel` | KEEP | Canal de aquisicao. | Sem duplicidade direta. |
| `payer_admin_contact_id` | `uuid` | `patient_admin_financial_profile.payer_admin_contact_id` | KEEP | Contato administrativo do pagador. | Sem duplicidade direta. |
| `primary_payer_description` | `text` | `billing_entities.name` | MOVE | Nome do pagador canonizado em `billing_entities`. | Duplicado com `payer_name`. |
| `scale_model` | `public.scale_model_enum` | `patient_scale_rules.scale_model` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `shift_modality` | `public.shift_modality_enum` | `patient_scale_rules.shift_modality` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `base_professional_category` | `text` | `patient_scale_rules.base_professional_category` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `quantity_per_shift` | `integer` | `patient_scale_rules.quantity_per_shift` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `weekly_hours_expected` | `numeric` | `patient_scale_rules.weekly_hours_expected` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `day_shift_start` | `time` | `patient_scale_rules.day_shift_start` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `night_shift_start` | `time` | `patient_scale_rules.night_shift_start` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `includes_weekends` | `boolean` | `patient_scale_rules.includes_weekends` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `holiday_rule` | `text` | `patient_scale_rules.holiday_rule` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `auto_generate_scale` | `boolean` | `patient_scale_rules.auto_generate_scale` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `chk_address_proof_ok` | `boolean` | `patient_onboarding_checklist.is_completed` | MOVE | Normalizar checklist (item_code=ADDRESS_PROOF). | Migrar para tabela de itens. |
| `chk_legal_guardian_docs_ok` | `boolean` | `patient_onboarding_checklist.is_completed` | MOVE | Normalizar checklist (item_code=LEGAL_GUARDIAN_DOCS). | Migrar para tabela de itens. |
| `chk_financial_responsible_docs_ok` | `boolean` | `patient_onboarding_checklist.is_completed` | MOVE | Normalizar checklist (item_code=FINANCIAL_RESPONSIBLE_DOCS). | Migrar para tabela de itens. |
| `checklist_complete` | `boolean` | `patient_admin_financial_profile.checklist_complete` | KEEP | Status geral do checklist. | Sem duplicidade direta. |
| `checklist_notes_detailed` | `text` | — | DROP | Duplicado com `checklist_notes`. | Consolidar em `checklist_notes`. |
| `service_package_name` | `text` | `patient_admin_financial_profile.service_package_name` | KEEP | Nome do pacote. | Duplicado com `service_package`. |
| `contract_status_enum` | `text` | `patient_admin_financial_profile.contract_status` | KEEP | Status do contrato. | Duplicado com `patient_administrative_profiles.contract_status`. |
| `primary_payer_related_person_id` | `uuid` | `patient_admin_financial_profile.primary_payer_related_person_id` | KEEP | Pagador PF vinculado ao paciente. | Duplicado conceitualmente com `responsible_related_person_id`. |
| `primary_payer_legal_entity_id` | `uuid` | `patient_admin_financial_profile.primary_payer_entity_id` | KEEP | Entidade pagadora canonica. | FK para `billing_entities.id`. |
| `chk_address_proof_at` | `timestamptz` | `patient_onboarding_checklist.completed_at` | MOVE | Normalizar checklist (item_code=ADDRESS_PROOF). | Migrar para tabela de itens. |
| `chk_address_proof_by` | `uuid` | `patient_onboarding_checklist.completed_by_user_id` | MOVE | Normalizar checklist (item_code=ADDRESS_PROOF). | Migrar para tabela de itens. |
| `chk_legal_guardian_docs_at` | `timestamptz` | `patient_onboarding_checklist.completed_at` | MOVE | Normalizar checklist (item_code=LEGAL_GUARDIAN_DOCS). | Migrar para tabela de itens. |
| `chk_legal_guardian_docs_by` | `uuid` | `patient_onboarding_checklist.completed_by_user_id` | MOVE | Normalizar checklist (item_code=LEGAL_GUARDIAN_DOCS). | Migrar para tabela de itens. |
| `chk_financial_responsible_docs_at` | `timestamptz` | `patient_onboarding_checklist.completed_at` | MOVE | Normalizar checklist (item_code=FINANCIAL_RESPONSIBLE_DOCS). | Migrar para tabela de itens. |
| `chk_financial_responsible_docs_by` | `uuid` | `patient_onboarding_checklist.completed_by_user_id` | MOVE | Normalizar checklist (item_code=FINANCIAL_RESPONSIBLE_DOCS). | Migrar para tabela de itens. |
| `chk_other_docs_ok` | `boolean` | `patient_onboarding_checklist.is_completed` | MOVE | Normalizar checklist (item_code=OTHER_DOCS). | Migrar para tabela de itens. |
| `chk_other_docs_desc` | `text` | `patient_onboarding_checklist.item_description` | MOVE | Normalizar checklist (item_code=OTHER_DOCS). | Migrar descricao do item. |
| `chk_other_docs_at` | `timestamptz` | `patient_onboarding_checklist.completed_at` | MOVE | Normalizar checklist (item_code=OTHER_DOCS). | Migrar para tabela de itens. |
| `chk_other_docs_by` | `uuid` | `patient_onboarding_checklist.completed_by_user_id` | MOVE | Normalizar checklist (item_code=OTHER_DOCS). | Migrar para tabela de itens. |
| `day_shift_end` | `time` | `patient_scale_rules.day_shift_end` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `night_shift_end` | `time` | `patient_scale_rules.night_shift_end` | MOVE | Regras de escala residem no modulo Escalas. | Destino em Escalas. |
| `reference_location_id` | `uuid` | `patient_address_logistics.address_id` | MOVE | Logistica e enderecos residem na Aba02. | Usar endereco de referencia da Aba02. |
| `chk_contract_doc_id` | `uuid` | `patient_onboarding_checklist.document_id` | MOVE | Normalizar checklist (item_code=CONTRACT). | Documento em `patient_documents`. |
| `chk_consent_doc_id` | `uuid` | `patient_onboarding_checklist.document_id` | MOVE | Normalizar checklist (item_code=CONSENT). | Documento em `patient_documents`. |
| `chk_medical_report_doc_id` | `uuid` | `patient_onboarding_checklist.document_id` | MOVE | Normalizar checklist (item_code=MEDICAL_REPORT). | Documento em `patient_documents`. |
| `chk_address_proof_doc_id` | `uuid` | `patient_onboarding_checklist.document_id` | MOVE | Normalizar checklist (item_code=ADDRESS_PROOF). | Documento em `patient_documents`. |
| `chk_legal_docs_doc_id` | `uuid` | `patient_onboarding_checklist.document_id` | MOVE | Normalizar checklist (item_code=LEGAL_DOCS). | Documento em `patient_documents`. |
| `chk_financial_docs_doc_id` | `uuid` | `patient_onboarding_checklist.document_id` | MOVE | Normalizar checklist (item_code=FINANCIAL_DOCS). | Documento em `patient_documents`. |
| `chk_judicial_doc_id` | `uuid` | `patient_onboarding_checklist.document_id` | MOVE | Normalizar checklist (item_code=JUDICIAL). | Documento em `patient_documents`. |
| `payer_admin_contact_description` | `text` | `patient_admin_financial_profile.payer_admin_contact_description` | KEEP | Descricao do contato. | Sem duplicidade direta. |
| `chk_judicial_at` | `timestamptz` | `patient_onboarding_checklist.completed_at` | MOVE | Normalizar checklist (item_code=JUDICIAL). | Migrar para tabela de itens. |
| `chk_judicial_by` | `uuid` | `patient_onboarding_checklist.completed_by_user_id` | MOVE | Normalizar checklist (item_code=JUDICIAL). | Migrar para tabela de itens. |

## 5. Mapeamento - `public.patient_administrative_profiles`

| Coluna legada | Tipo/Obs | Destino canonico | Decisao | Regra/justificativa | Observacoes de duplicidade |
| --- | --- | --- | --- | --- | --- |
| `patient_id` | `uuid` | `patient_admin_financial_profile.patient_id` | KEEP | Identificador do paciente. | Duplicado em `patient_admin_info.patient_id`. |
| `admission_date` | `date` | `patient_admin_financial_profile.admission_date` | KEEP | Data de admissao. | Consolidar com `patient_admin_info.start_date`. |
| `discharge_prediction_date` | `date` | `patient_admin_financial_profile.discharge_prediction_date` | KEEP | Previsao de alta. | Sem duplicidade direta. |
| `discharge_date` | `date` | `patient_admin_financial_profile.discharge_date` | KEEP | Data de alta. | Consolidar com `patient_admin_info.end_date`. |
| `admission_type` | `text` | `patient_admin_financial_profile.admission_type` | KEEP | Tipo de admissao. | Duplicado em `patient_admin_info.admission_type`. |
| `service_package_name` | `text` | `patient_admin_financial_profile.service_package_name` | KEEP | Nome do pacote. | Duplicado em `patient_admin_info.service_package_name`. |
| `contract_number` | `text` | `patient_admin_financial_profile.contract_id` | KEEP | Numero de contrato. | Fallback quando `contract_id` estiver vazio. |
| `contract_status` | `text` | `patient_admin_financial_profile.contract_status` | KEEP | Status do contrato. | Fallback de `contract_status_enum`. |
| `technical_supervisor_name` | `text` | `patient_clinical_profiles.technical_supervisor_name` | MOVE | Campo clinico. | Destino em Clinico. |
| `administrative_contact_name` | `text` | — | DROP | Duplicado com `payer_admin_contact_description` e contatos em `patient_related_persons`. | Consolidar nos contatos administrativos. |
| `created_at` | `timestamptz` | `patient_admin_financial_profile.created_at` | KEEP | Auditoria. | Preferencia sobre outras fontes. |
| `updated_at` | `timestamptz` | `patient_admin_financial_profile.updated_at` | KEEP | Auditoria. | Preferencia sobre outras fontes. |

## 6. Mapeamento - `public.patient_financial_profiles`

| Coluna legada | Tipo/Obs | Destino canonico | Decisao | Regra/justificativa | Observacoes de duplicidade |
| --- | --- | --- | --- | --- | --- |
| `patient_id` | `uuid` | `patient_admin_financial_profile.patient_id` | KEEP | Identificador do paciente. | Duplicado em `patient_admin_info.patient_id`. |
| `bond_type` | `text` | `patient_admin_financial_profile.bond_type` | KEEP | Vinculo financeiro. | Sem duplicidade direta. |
| `insurer_name` | `text` | `patient_admin_financial_profile.insurer_name` | KEEP | Operadora. | Sem duplicidade direta. |
| `plan_name` | `text` | `patient_admin_financial_profile.plan_name` | KEEP | Plano. | Sem duplicidade direta. |
| `insurance_card_number` | `text` | `patient_admin_financial_profile.insurance_card_number` | KEEP | Numero da carteirinha. | Sem duplicidade direta. |
| `insurance_card_validity` | `date` | `patient_admin_financial_profile.insurance_card_validity` | KEEP | Validade da carteirinha. | Sem duplicidade direta. |
| `monthly_fee` | `numeric(10,2)` | `patient_admin_financial_profile.monthly_fee` | KEEP | Mensalidade. | Sem duplicidade direta. |
| `billing_due_day` | `integer` | `patient_admin_financial_profile.billing_due_day` | KEEP | Dia de vencimento. | Duplicado com `due_day`. |
| `payment_method` | `text` | `patient_admin_financial_profile.payment_method` | KEEP | Forma de pagamento. | Sem duplicidade direta. |
| `financial_responsible_name` | `text` | `patient_admin_financial_profile.financial_responsible_name` | KEEP | Responsavel financeiro. | Sem duplicidade direta. |
| `financial_responsible_contact` | `text` | `patient_admin_financial_profile.financial_responsible_contact` | KEEP | Contato do responsavel financeiro. | Sem duplicidade direta. |
| `billing_status` | `text` | `patient_admin_financial_profile.billing_status` | KEEP | Status de cobranca. | Sem duplicidade direta. |
| `notes` | `text` | `patient_admin_financial_profile.financial_notes` | KEEP | Observacoes financeiras. | Renomeado para evitar conflito com `admin_notes`. |
| `created_at` | `timestamptz` | `patient_admin_financial_profile.created_at` | KEEP | Auditoria. | Preferencia em `patient_admin_info`. |
| `updated_at` | `timestamptz` | `patient_admin_financial_profile.updated_at` | KEEP | Auditoria. | Preferencia em `patient_admin_info`. |
| `card_holder_name` | `text` | `patient_admin_financial_profile.card_holder_name` | KEEP | Titular do cartao. | Sem duplicidade direta. |
| `grace_period_days` | `integer` | `patient_admin_financial_profile.grace_period_days` | KEEP | Carencia. | Sem duplicidade direta. |
| `payment_terms` | `text` | `patient_admin_financial_profile.payment_terms` | KEEP | Condicoes de pagamento. | Sem duplicidade direta. |
| `billing_model` | `text` | `patient_admin_financial_profile.billing_model` | KEEP | Modelo de cobranca. | Sem duplicidade direta. |
| `billing_base_value` | `numeric` | `patient_admin_financial_profile.billing_base_value` | KEEP | Valor base. | Sem duplicidade direta. |
| `billing_periodicity` | `text` | `patient_admin_financial_profile.billing_periodicity` | KEEP | Periodicidade. | Sem duplicidade direta. |
| `copay_percent` | `numeric` | `patient_admin_financial_profile.copay_percent` | KEEP | Coparticipacao. | Sem duplicidade direta. |
| `readjustment_index` | `text` | `patient_admin_financial_profile.readjustment_index` | KEEP | Indice de reajuste. | Sem duplicidade direta. |
| `readjustment_month` | `integer` | `patient_admin_financial_profile.readjustment_month` | KEEP | Mes de reajuste. | Sem duplicidade direta. |
| `late_fee_percent` | `numeric` | `patient_admin_financial_profile.late_fee_percent` | KEEP | Multa. | Sem duplicidade direta. |
| `daily_interest_percent` | `numeric` | `patient_admin_financial_profile.daily_interest_percent` | KEEP | Juros diarios. | Sem duplicidade direta. |
| `discount_early_payment` | `numeric` | `patient_admin_financial_profile.discount_early_payment` | KEEP | Desconto antecipado. | Sem duplicidade direta. |
| `discount_days_limit` | `integer` | `patient_admin_financial_profile.discount_days_limit` | KEEP | Limite de dias. | Sem duplicidade direta. |
| `payer_relation` | `text` | `patient_admin_financial_profile.payer_relation` | KEEP | Relacao com paciente. | Sem duplicidade direta. |
| `billing_email_list` | `text` | `billing_entities.contact_email` | MOVE | Contato do pagador em `billing_entities`. | Normalizar lista de emails. |
| `billing_phone` | `text` | `billing_entities.contact_phone` | MOVE | Contato do pagador em `billing_entities`. | Sem duplicidade direta. |
| `invoice_delivery_method` | `text` | `patient_admin_financial_profile.invoice_delivery_method` | KEEP | Metodo de envio. | Sem duplicidade direta. |
| `tenant_id` | `uuid` | `patient_admin_financial_profile.tenant_id` | KEEP | RLS por tenant. | Duplicado em `patient_admin_info.tenant_id`. |
| `payer_type` | `text` | `billing_entities.kind` | MOVE | Canonizar tipo do pagador em `billing_entities`. | Converter valores legados. |
| `payer_name` | `text` | `billing_entities.name` | MOVE | Nome do pagador canonizado em `billing_entities`. | Duplicado com `primary_payer_description`. |
| `payer_doc_type` | `text` | `billing_entities.doc_type` | MOVE | Documento do pagador em `billing_entities`. | Sem duplicidade direta. |
| `payer_doc_number` | `text` | `billing_entities.doc_number` | MOVE | Documento do pagador em `billing_entities`. | Sem duplicidade direta. |
| `billing_cep` | `text` | `billing_entities.billing_address_cep` | MOVE | Endereco de cobranca em `billing_entities`. | Sem duplicidade direta. |
| `billing_street` | `text` | `billing_entities.billing_address_street` | MOVE | Endereco de cobranca em `billing_entities`. | Sem duplicidade direta. |
| `billing_number` | `text` | `billing_entities.billing_address_number` | MOVE | Endereco de cobranca em `billing_entities`. | Sem duplicidade direta. |
| `billing_neighborhood` | `text` | `billing_entities.billing_address_neighborhood` | MOVE | Endereco de cobranca em `billing_entities`. | Sem duplicidade direta. |
| `billing_city` | `text` | `billing_entities.billing_address_city` | MOVE | Endereco de cobranca em `billing_entities`. | Sem duplicidade direta. |
| `billing_state` | `text` | `billing_entities.billing_address_state` | MOVE | Endereco de cobranca em `billing_entities`. | Sem duplicidade direta. |
| `due_day` | `integer` | — | DROP | Duplicado de `billing_due_day`. | Consolidar em `billing_due_day`. |
| `responsible_related_person_id` | `uuid` | — | DROP | Duplicado com `primary_payer_related_person_id`. | Consolidar em `primary_payer_related_person_id`. |
| `receiving_account_info` | `text` | `patient_admin_financial_profile.receiving_account_info` | KEEP | Conta de recebimento. | Sem duplicidade direta. |

## 7. Campos novos no canonico (sem origem direta no legado)

- `patient_admin_financial_profile.created_by`
- `patient_admin_financial_profile.updated_by`
- `patient_admin_financial_profile.deleted_at`
- `patient_admin_financial_profile.policy_profile_id`
- `patient_related_persons.is_payer`
- `billing_entities.created_by`
- `billing_entities.updated_by`
- `billing_entities.deleted_at`
- `care_policy_profiles.id`
- `care_policy_profiles.tenant_id`
- `care_policy_profiles.name`
- `care_policy_profiles.description`
- `care_policy_profiles.rule_set`
- `care_policy_profiles.is_default`
- `care_policy_profiles.version`
- `care_policy_profiles.created_at`
- `care_policy_profiles.updated_at`
- `care_policy_profiles.created_by`
- `care_policy_profiles.updated_by`
- `care_policy_profiles.deleted_at`
- `patient_timeline_events.id`
- `patient_timeline_events.tenant_id`
- `patient_timeline_events.patient_id`
- `patient_timeline_events.event_time`
- `patient_timeline_events.event_type`
- `patient_timeline_events.event_category`
- `patient_timeline_events.title`
- `patient_timeline_events.description`
- `patient_timeline_events.tone`
- `patient_timeline_events.payload`
- `patient_timeline_events.created_at`
- `patient_timeline_events.updated_at`
- `patient_timeline_events.created_by`
- `patient_timeline_events.updated_by`
- `patient_timeline_events.deleted_at`
- `patient_onboarding_checklist.id`
- `patient_onboarding_checklist.created_at`
- `patient_onboarding_checklist.updated_at`
- `patient_onboarding_checklist.created_by`
- `patient_onboarding_checklist.updated_by`
- `patient_onboarding_checklist.deleted_at`

## 8. Decisões Finalizadas

- [x] Escalas mapeadas para `patient_scale_rules`.
- [x] Clinico mapeado para `patient_clinical_profiles`.
- [x] Logistica mapeada para `patient_address_logistics` (Aba02).
- [x] Pagador consolidado em `billing_entities`.
- [x] Checklist canonico em `patient_onboarding_checklist`.

## 9. Backlog Pós-Autorização

- Revisar mapeamento se novas colunas legadas forem incorporadas ao snapshot.
- Monitorar novos valores legados de `payer_type` para manter a conversao consistente.
