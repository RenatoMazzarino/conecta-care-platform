# Contrato da Aba: Rede de Apoio

## 0) Metadados

- Módulo: Pacientes
- Aba: ABA03 • Rede de Apoio
- Versão: 0.1
- Status: Draft
- Última atualização: 2025-12-21
- Referências:
  - `AGENT.md` (governança / fluxo contrato → migrations → types → actions → UI)
  - `docs/contracts/_templates/CONTRACT_TEMPLATE.md` (formato oficial)
  - `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md` (padrão visual e command bar)
  - `docs/contracts/pacientes/ABA02_ENDERECO_LOGISTICA.md` (contrato recente da seção anterior)
  - `docs/architecture/decisions/ADR-004-ui-dynamics-standard.md` (shell/command bar)
  - `html/modelo_final_aparencia_pagina_do_paciente.htm` (referência visual)
  - `docs/repo_antigo/schema_current.sql` + `db/snapshots_legado/conectacare-2025-11-29.sql` (legado)

## 1) Objetivo da Aba

- Centralizar os dados que sustentam a rede de apoio do paciente: responsáveis legais, contatos autorizados, rede de cuidados e acesso ao portal.
- Garantir leitura rápida (cards label/valor) e edição controlada (inputs + validações), protegendo a jornada multi-tenant com auditoria completa.
- Usuários: supervisores clínicos, enfermeiros, administrativos e equipe de suporte legal responsável por autorizações e convites.

## 2) Estrutura de UI (Cards e Campos)

A aba será composta por quatro cards principais, com layout em grade (coluna esquerda: cards de domínio; coluna direita: integrações/portal). Cada card respeita o modo leitura (grid label/valor) e modo edição (inputs retangulares, botões "Novo" e "Salvar/Cancelar").

### Card: Responsável legal & Documentos obrigatórios

Campos focados em identificação, relacionamento e autorização jurídica.

| Card | Campo (label UI) | Nome técnico | Tipo PG | Tipo TS | Obrigatório | Default | Validações | Máscara | Descrição curta |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Responsável Legal | Nome | name | text | string | Sim | - | Trim e mínimo 3 caracteres | - | Nome completo do representante legal. |
| Responsável Legal | Parentesco/role | relationship_degree | text | string | Sim | - | Lookup com catálogo (curador, tutor, procurador) | - | Relação jurídica com o paciente. |
| Responsável Legal | Tipo de contato | contact_type | enum | string | Sim | Familiar | Check constraint (ResponsavelLegal, ContatoEmergencia24h, etc.) | - | Classificação de autorização. |
| Responsável Legal | Contato principal | contact_phone / contact_email | text | string | Não | - | Formato E.164 para telefone, email válido | (00) 00000-0000 | Campo combinado para telefone/email. |
| Responsável Legal | Documentos jurídicos | rg, cpf, termo_curatela, procuração | text | string | Condicional | - | RG/CPF válidos, checklist de curatela/procuração | - | Referência às provas legais. |
| Responsável Legal | Flags de autorização | can_authorize_clinical / can_authorize_financial | boolean | boolean | Não | false | - | - | Autorizações específicas. |
| Responsável Legal | Preferências de comunicação | preferred_contact, contact_time_preference | text | string | Não | - | Catálogo (WhatsApp, Email, manhã/tarde/noite) | - | Canal e janela preferida. |
| Responsável Legal | Observações / LGPD | observations, observacoes_lgpd | text | string | Não | - | - | - | Notas internas obrigatórias (LGPD). |

### Card: Contatos & Autorização

Campos de múltiplos contatos que não são necessariamente responsáveis legais, mas são fontes de decisão/admissão.

| Campo (label) | Nome técnico | Tipo PG | Obrigatório | Descrição curta |
| --- | --- | --- | --- | --- |
| Nome | name | text | Sim | Identificação do contato alternativo. |
| Parentesco | relationship_degree | text | Sim | Relação social; usado para filtro "principal". |
| Telefone / Email | phone_primary / email | text | Não | Canal preferido. |
| Pode autorizar clínica? | can_authorize_clinical | boolean | Não | Flag para decisões clínicas. |
| Pode autorizar financeiro? | can_authorize_financial | boolean | Não | Flag para decisões financeiras. |
| Pode receber comunicados? | allow_admin_notif | boolean | Não | Consentimento de comunicados. |
| Principal contato | is_main_contact | boolean | Não | Apenas um por paciente ativo. |
| Preferência de canal | preferred_contact | text | Não | WhatsApp / Email / SMS / Outro. |

### Card: Rede de Cuidados (profissionais)

Exibe médicos, fisioterapeutas, enfermagem e terceiros associados.

| Campo (label) | Nome técnico | Tipo PG | Obrigatório | Descrição curta |
| --- | --- | --- | --- | --- |
| Profissional | professional_id | uuid | Sim | Link para tabela de profissionais. |
| Papel na jornada | role_in_case | enum | Sim | Ex.: Nutri, Médico, Técnico. |
| Regime | regime | enum | Não | Fixo / variável / outro. |
| Status | status | text | Sim | Controle Ativo/Afastado/Encerrado/Standby. |
| Referência | is_reference_professional | boolean | Não | Destaca o contato principal. |
| Contato rápido | contact_phone / contact_email | text | Não | Override para contato direto. |
| Observações | notes | text | Não | Histórico de comunicação. |

### Card: Portal & Documentos

Combina acesso ao portal (usuário, convite, permissões) com evidência documental (curatela/procuração).

| Campo (label) | Nome técnico | Tipo PG | Obrigatório | Descrição curta |
| --- | --- | --- | --- | --- |
| Portal habilitado | portal_active | boolean | Sim | Ativa/desativa acesso ao portal. |
| Nivel de acesso | portal_access_level | text | Sim | Visualiza / Comunica / Autoriza. |
| Convidar/Revogar | portal_invite_token | text | - | Token temporário enviado por email. |
| Documento jurídico | patient_documents* | jsonb link | Sim para curatela | Referência ao upload com status e audit trail. |
| Status de validação | document_status | enum | Sim | (Pendente, Validado, Rejeitado). |
| Checklist de IA | document_validation_payload | jsonb | Não | Resultados do pipeline de análise automática. |
| Última atualização | portals_refresh_at | timestamptz | Não | Timestamp do último convite ou atualização. |

## 3) Modelo de Dados (Banco)

### 3.1 Tabelas canônicas sugeridas

1. `public.patient_responsible_parties` (reaproveita `patient_related_persons`): armazena responsáveis legais com flags, contatos e preferências.
2. `public.patient_contacts` (subset de `patient_related_persons` / `patient_household_members`): contatos gerais com sinalização de principal e consentimentos.
3. `public.patient_care_network` (baseado em `care_team_members`): profissionais clínicos/operacionais com regime, status, equipe interna vs externa.
4. `public.patient_documents` (mantém a tabela legada): documentos jurídicos (curatela, procuração) com audit trail simplificado.
5. `public.patient_document_logs` (legado) para auditoria de uploads/validações.
6. `public.patient_admin_history` (merge de `patient_admin_info` + `patient_administrative_profiles`): registre status administrativo (escalistas, admissões, contratações, checklists de validação).
7. `public.patient_portal_access` exclusivo para tokens e níveis de acesso ao portal.

Todas as tabelas seguem multi-tenant (`tenant_id` via `auth.jwt()->>tenant_id`) e soft delete via `deleted_at`. `created_by/updated_by` replicam o padrão do módulo (references em actions). `is_primary` e `is_main_contact` são unique partial indexes por `patient_id` + `tenant_id` quando `deleted_at is null`.

## 4) Segurança (RLS / Policies)

- RLS habilitado em todas as tabelas; policies replicam o padrão do módulo: `tenant_id` igual a `current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id'` ou `service_role`.
- SELECT: pacientes vinculados ao tenant. INSERT/UPDATE/DELETE limitados a pessoas com role adequada (ex.: `authenticated` com permissão via claims, `service_role` para jobs).
- `portal_access` deve respeitar adicionais: somente `service_role` e usuários com claim `can_manage_app_access=true` podem alterar tokens ou níveis de acesso.

## 5) Operações / Actions do App

- `getPatientResponsibleParty(patient_id)` retorna responsável principal com documentos validados.
- `listPatientContacts(patient_id)` lista contatos secundários com flags de autorização.
- `listCareTeam(patient_id)` traz profissionais ativos e regime.
- `savePatientResponsibleParty(payload)` valida RG/CPF + checklist e persiste timestamps e campos auditáveis.
- `savePatientContact(payload)` garante `is_main_contact` único.
- `refreshDocumentValidation(document_id)` inicia pipeline IA (POST em action) e grava `document_validation_payload` + status.
- `invitePortalAccess(patient_id)` gera token, envia email e grava `portal_invite_sent_at`.
- `setPortalAccessLevel(patient_id, level)` define `portal_access_level` e dispara auditoria.

## 6) Máscaras e Validações (detalhadas)

- CPF/RG seguem formatos oficiais; CPF 11 dígitos numéricos e RG 7–9 dígitos com opcional hífen.
- Telefone: E.164 (remover espaços) e fallback para apenas números quando com +55.
- Email: domínio verificado contra whitelist interna.
- Documentos jurídicos: exigem `file_hash`, `document_status` e `uploaded_at`; checklists predefinidos dependem de `category` (curatela vs procuração).
- Preferências de contato: catálogos (Manhã/Tarde/Noite/Comercial/Qualquer) são validados por constraint check.
- Portal access level: enum {visualizar, comunicar, autorizar}; atualizações registram `portal_access_changed_by` e `portal_access_changed_at`.

## 7) Migrações previstas

- `supabase/migrations/20251221XXXX_pacientes_aba03_rede_apoio.sql` (placeholder): cria tabelas canônicas listadas em 3.1, indexes parciais para `is_primary` e `is_main_contact`, RLS e audit triggers.
- `supabase/migrations/20251221XXXX_pacientes_aba03_document_validation.sql`: adiciona campos `document_validation_payload`, `document_status`, `portal_access_level`, `portal_invite_token` nas tabelas referidas.

## 8) Definição de Pronto (DoD)

- [ ] Contrato revisado e aceito (documentado aqui).
- [ ] Migration(s) definidas e aplicadas no ambiente de dev (documentar números no próximo PR).
- [ ] Schemas/Types gerados (Supabase typings atualizados).
- [ ] Actions implementadas para list/get/save/invite/refresh.
- [ ] UI da Aba 03 sem mocks, usando dados reais com command bar padrão.
- [ ] RLS + policies testadas (tenants + soft delete).
- [ ] Checklist de QA manual (modo leitura/edição, portal, documentos) registrado.

## 9) Cobertura do legado (fonte: `docs/repo_antigo/schema_current.sql`, `db/snapshots_legado/conectacare-2025-11-29.sql`)

### Tabela: `public.patient_related_persons`

| Coluna | Tipo | Observações |
| --- | --- | --- |
| id | uuid | PK, `gen_random_uuid()` |
| patient_id | uuid | FK → patients, cascade delete |
| tenant_id | uuid | FK → tenants |
| name | text | Nome completo do contato |
| relationship_degree | text | grau de parentesco/legal |
| role_type | public.relatedness_role | enum (Familiar default) |
| is_legal_guardian | boolean | flags de autoridade |
| is_financial_responsible | boolean | |
| is_emergency_contact | boolean | |
| lives_with_patient | text | Catálogo (Sim/Nao/Visita) |
| visit_frequency | text | |
| access_to_home | boolean | |
| can_authorize_clinical | boolean | |
| can_authorize_financial | boolean | |
| phone_primary | text | preferred channel |
| phone_secondary | text | |
| email | text | |
| contact_time_preference | text | constraint (Manha/Tarde/Noite/Comercial/Qualquer) |
| priority_order | integer | Order for primary contact (default 99) |
| cpf | text | RG/CPF for legal check |
| rg | text | |
| address_full | text | string format |
| allow_clinical_updates | boolean | default true |
| allow_admin_notif | boolean | default true |
| block_marketing | boolean | default false |
| observations | text | free text |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |
| is_whatsapp | boolean | |
| birth_date | date | |
| rg_issuer | text | |
| rg_state | text | |
| address_street | text | |
| address_number | text | |
| address_city | text | |
| address_state | text | |
| contact_type | text | NOT NULL constraint cat. |
| is_main_contact | boolean | single true per patient |
| relation_description | text | free form |
| preferred_contact | text | constraint (WhatsApp/Telefone/SMS/Email/Outro) |
| address_summary | text | derived string |
| observacoes_lgpd | text | campo LGPD |

### Tabela: `public.patient_household_members`

| Coluna | Tipo | Observações |
| --- | --- | --- |
| id | uuid | PK |
| patient_id | uuid | FK → patients |
| name | text | |
| role | text | |
| type | text | check (resident/caregiver) |
| schedule_note | text | |
| created_at | timestamptz | default now() |

### Tabela: `public.care_team_members`

| Coluna | Tipo | Observações |
| --- | --- | --- |
| id | uuid | PK |
| patient_id | uuid | FK |
| tenant_id | uuid | FK |
| professional_id | uuid | FK → professionals |
| user_profile_id | uuid | |
| role_in_case | public.care_team_role | enum |
| is_reference_professional | boolean | flag |
| regime | public.care_team_regime | default Fixo |
| work_window_summary | text | |
| status | text | default Ativo |
| start_date | date | default current_date |
| end_date | date | |
| contact_info_override | text | |
| notes | text | |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |
| professional_category | text | check constraint |
| is_technical_responsible | boolean | |
| is_family_focal_point | boolean | |
| contact_email | text | |
| contact_phone | text | |
| work_window | text | |
| employment_type | text | check enum |
| internal_extension | text | |
| corporate_cell | text | |
| profissional_nome | text | |

### Tabela: `public.patient_documents`

| Coluna | Tipo | Observações |
| --- | --- | --- |
| id | uuid | PK |
| patient_id | uuid | FK |
| file_name | text | |
| file_path | text | |
| file_size_bytes | bigint | |
| mime_type | text | |
| title | text | |
| category | text | enum legal/consent/etc. |
| description | text | |
| tags | text[] | |
| is_verified | boolean | default false |
| verified_at | timestamptz | |
| verified_by | uuid | |
| expires_at | date | |
| created_by | uuid | |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |
| domain_type | public.doc_domain | default Administrativo |
| subcategory | text | |
| source_module | public.doc_source | default Ficha |
| file_name_original | text | |
| file_extension | text | |
| file_hash | text | |
| version | integer | default 1 |
| contract_id | text | |
| financial_record_id | uuid | |
| clinical_event_id | uuid | |
| is_visible_clinical | boolean | default true |
| is_visible_admin | boolean | default true |
| is_confidential | boolean | default false |
| min_role_level | text | |
| status | public.doc_status | default Ativo |
| last_updated_by | uuid | |
| last_updated_at | timestamptz | default now() |
| internal_notes | text | |
| external_ref | text | |
| storage_provider | public.storage_provider_enum | default Supabase |
| storage_path | text | |
| original_file_name | text | |
| previous_document_id | uuid | |
| origin_module | public.doc_origin_enum | default Ficha_Documentos |
| admin_contract_id | text | |
| finance_entry_id | uuid | |
| clinical_visit_id | uuid | |
| clinical_evolution_id | uuid | |
| prescription_id | uuid | |
| related_object_id | uuid | |
| clinical_visible | boolean | default true |
| admin_fin_visible | boolean | default true |
| min_access_role | text | default Basico |
| document_status | public.doc_status_enum | default Ativo |
| uploaded_by | uuid | |
| deleted_at | timestamptz | soft delete |
| deleted_by | uuid | |
| signature_type | public.signature_type_enum | default Nenhuma |
| signature_date | timestamptz | |
| signature_summary | text | |
| external_signature_id | text | |
| public_notes | text | |
| signed_at | timestamptz | |
| signers_summary | text | |
| uploaded_at | timestamptz | default now() |
| extension | text | |
| tenant_id | uuid | FK |

### Tabela: `public.patient_document_logs`

| Coluna | Tipo | Observações |
| --- | --- | --- |
| id | uuid | PK |
| document_id | uuid | FK → patient_documents |
| tenant_id | uuid | |
| happened_at | timestamptz | default now() |
| user_id | uuid | |
| action | text | ex.: uploaded, validated |
| details | jsonb | payload |
| created_at | timestamptz | default now() |

### Tabela: `public.patient_admin_info`

| Coluna | Tipo | Observações |
| --- | --- | --- |
| patient_id | uuid | PK/FK |
| tenant_id | uuid | |
| status | text | default Ativo |
| admission_type | text | |
| complexity | text | |
| service_package | text | |
| start_date | date | |
| end_date | date | |
| supervisor_id | uuid | FK |
| escalista_id | uuid | FK |
| nurse_responsible_id | uuid | FK |
| frequency | text | |
| operation_area | text | |
| admission_source | text | |
| contract_id | text | |
| notes_internal | text | |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |
| demand_origin | text | |
| primary_payer_type | text | |
| contract_start_date | date | |
| contract_end_date | date | |
| renewal_type | public.renewal_type_enum | |
| external_contract_id | text | |
| authorization_number | text | |
| judicial_case_number | text | |
| status_reason | text | |
| status_changed_at | timestamptz | |
| commercial_responsible_id | uuid | |
| contract_manager_id | uuid | |
| scale_rule_start_date | date | |
| scale_rule_end_date | date | |
| scale_mode | text | |
| scale_notes | text | |
| chk_contract_ok | boolean | |
| chk_contract_at | date | |
| chk_contract_by | text | |
| chk_consent_ok | boolean | |
| chk_consent_at | date | |
| chk_consent_by | text | |
| chk_medical_report_ok | boolean | |
| chk_medical_report_at | date | |
| chk_medical_report_by | text | |
| chk_legal_docs_ok | boolean | |
| chk_financial_docs_ok | boolean | |
| chk_judicial_ok | boolean | |
| checklist_notes | text | |
| effective_discharge_date | date | |
| service_package_description | text | |
| demand_origin_description | text | |
| official_letter_number | text | |
| contract_status_reason | text | |
| admin_notes | text | |
| cost_center_id | text | |
| erp_case_code | text | |
| contract_category | public.contract_category_enum | |
| acquisition_channel | text | |
| payer_admin_contact_id | uuid | FK → patient_related_persons |
| primary_payer_description | text | |
| scale_model | public.scale_model_enum | |
| shift_modality | public.shift_modality_enum | |
| base_professional_category | text | |
| quantity_per_shift | integer | default 1 |
| weekly_hours_expected | numeric | |
| day_shift_start | time | |
| night_shift_start | time | |
| includes_weekends | boolean | default true |
| holiday_rule | text | |
| auto_generate_scale | boolean | default false |
| chk_address_proof_ok | boolean | |
| chk_legal_guardian_docs_ok | boolean | |
| chk_financial_responsible_docs_ok | boolean | |
| checklist_complete | boolean | |
| checklist_notes_detailed | text | |
| service_package_name | text | |

### Tabela: `public.patient_administrative_profiles`

| Coluna | Tipo | Observações |
| --- | --- | --- |
| patient_id | uuid | PK/FK |
| admission_date | date | default CURRENT_DATE |
| discharge_prediction_date | date | |
| discharge_date | date | |
| admission_type | text | check enum |
| service_package_name | text | |
| contract_number | text | |
| contract_status | text | default active |
| technical_supervisor_name | text | |
| administrative_contact_name | text | |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

## 10) Mapa legado → canônico

| Domínio | Campo canônico | Origem legado | Regra / Observação |
| --- | --- | --- | --- |
| Responsável legal | patient_responsible_parties.name | patient_related_persons.name | Mesmo campo; cards de leitura/edição compartilham label. |
| Responsável legal | patient_responsible_parties.relationship_degree | patient_related_persons.relationship_degree | Mantém enum para curatela/procuração. |
| Responsável legal | patient_responsible_parties.contact_type | patient_related_persons.contact_type | Constraint já existente aplicada. |
| Responsável legal | patient_responsible_parties.flags | vários campos booleanos | Campos (is_legal_guardian, is_financial_responsible, is_emergency_contact) agrupados e auditados. |
| Contatos | `patient_contacts.*` | `patient_related_persons.*` | Reaproveita columns e adiciona `is_main_contact` partial unique contra `patient_id`. |
| Contatos | patient_contacts.preferred_contact | patient_related_persons.preferred_contact | Constraint (WhatsApp/Telefone/SMS/Email/Outro). |
| Contatos | patient_contacts.priority_order | patient_related_persons.priority_order | Usa weight default 99 para ordenação. |
| Rede de cuidados | `patient_care_network.*` | care_team_members.* | Copy of columns with canonical naming (regime/status/role). |
| Documentos | `patient_documents.*` | `patient_documents.*` | Mantém columns; novas fields (document_status, document_validation_payload) ficam derived. |
| Auditoria | `patient_document_logs.*` | `patient_document_logs.*` | Legado direto. |
| Administrativo | `patient_admin_history.*` | `patient_admin_info.*` + `patient_administrative_profiles.*` | Merge de status, escalistas, checklists. |
| Portal | `patient_portal_access.*` | patient_documents / patient_related_persons | Documentos legais alimentam tokens; `portal_access_level` derived. |

## 11) Separação Aba03 x Aba04 (decisão em aberto)

Opções avaliadas:

- **Opção A**: Aba 03 = Rede externa (responsáveis, contatos, rede clínica); Aba 04 = equipes internas + operações administrativas.
- **Opção B (recomendada V1)**: Aba 03 cobre toda a rede de apoio (externa + interna) e usa `type`/`origin` para filtrar, liberando Aba 04 para indicadores puramente administrativos.
- **Opção C**: Aba 03 = rede clínica; Aba 04 = operações/portal/escala.

Feedback solicitado:

- Confirmar se a Aba 04 deve conter os mesmos profissionais internos ou apenas supervisores/escala.
- Validar o escopo do portal (visualização x autorização) e se o convite fica restrito a contatos ou inclui toda a rede de cuidados.
- Definir quais roles têm autoridade para alterar `portal_access_level` e revogar tokens.
- Decidir quais `document_status` bloqueiam o acesso (ex.: curatela rejeitada impede convite).

## 12) Perguntas em aberto para Renato

- Queremos manter a Aba 03 como guarda única da rede ou dividir profissionais internos com Aba 04?
- Qual fluxo deve ser padrão para documentos jurídicos: IA + checklist manual ou apenas manual no V1?
- O portal precisa de níveis distintos (visualizar / autorizar) já no MVP ou só "visualizar" + "autorizar" como toggle?
- Quem assina/officia checklists (curatela/procuração) e onde registrar o responsável final? (ex.: `signed_by`).
