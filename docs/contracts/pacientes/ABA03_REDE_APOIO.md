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

## 2) Escopo

**IN (Aba03 — Rede de Apoio):**

- Responsável legal + documentos jurídicos (curatela/interdição ou procuração particular).
- Contatos/familiares sem poder legal.
- Rede de cuidados externa (profissionais externos do paciente).
- Gestão de acesso ao portal (MVP): apenas governança e rastreabilidade, não implementação de portal.

**OUT (Aba04 Administrativa/Financeira):**

- Gestor responsável, escalista, backoffice, financeiro, faturamento e contratos financeiros.
- Checklists administrativos e fluxos de autorização financeira.

Regras de escopo:

- Um paciente pode ter 0..N responsáveis legais ao longo do tempo, mas apenas 1 pode estar vigente/ativo.
- O responsável legal só é considerado válido quando `document_status = manual_approved`.

## 3) Estrutura de UI (Cards e Campos)

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
| Status de validação | document_status | enum | Sim | Workflow completo em `document_status` (manual obrigatório). |
| Checklist de IA | document_validation_payload | jsonb | Não | Resultados do pipeline de análise automática. |
| Última atualização | portals_refresh_at | timestamptz | Não | Timestamp do último convite ou atualização. |

## 4) Modelo de Dados (Banco)

### 4.1 Tabelas canônicas sugeridas

1. `public.patient_responsible_parties` (reaproveita `patient_related_persons`): armazena responsáveis legais com flags, contatos e preferências.
2. `public.patient_contacts` (subset de `patient_related_persons` / `patient_household_members`): contatos gerais com sinalização de principal e consentimentos.
3. `public.patient_care_network` (baseado em `care_team_members`): profissionais clínicos/operacionais externos com regime e status.
4. `public.patient_documents` (mantém a tabela legada): documentos jurídicos do responsável legal (curatela/procuração).
5. `public.patient_document_logs` (legado) para auditoria de uploads/validações.
6. `public.patient_portal_access` exclusivo para tokens e níveis de acesso ao portal.

Todas as tabelas seguem multi-tenant (`tenant_id` via `auth.jwt()->>tenant_id`) e soft delete via `deleted_at`. `created_by/updated_by` replicam o padrão do módulo (references em actions). `is_primary` e `is_main_contact` são unique partial indexes por `patient_id` + `tenant_id` quando `deleted_at is null`.

### 4.2 Tabela: `public.patient_portal_access`

| Campo | Tipo PG | Obrigatório | Default | Descrição |
| --- | --- | --- | --- | --- |
| id | uuid | Sim | `gen_random_uuid()` | PK |
| tenant_id | uuid | Sim | - | Multi-tenant |
| patient_id | uuid | Sim | - | Paciente associado |
| related_person_id | uuid | Sim | - | Responsável legal vinculado |
| portal_access_level | text | Sim | `viewer` | Enum {`viewer`, `communicator`, `decision_authorized`} |
| invite_token | text | Sim | - | Hash/token do convite |
| invite_expires_at | timestamptz | Não | - | Expiração por default (+72h) |
| invited_at | timestamptz | Sim | `now()` | Timestamp da geração |
| invited_by | uuid | Sim | - | Usuário que criou o convite |
| revoked_at | timestamptz | Não | - | Timestamp de revogação |
| revoked_by | uuid | Não | - | Usuário que revogou |
| last_login_at | timestamptz | Não | - | Futuro uso para audit trail |
| created_at | timestamptz | Sim | `now()` | Auditoria padrão |
| updated_at | timestamptz | Sim | `now()` | Auditoria padrão |
| created_by | uuid | Sim | - | Usuário criador |
| updated_by | uuid | Sim | - | Usuário atualizador |
| deleted_at | timestamptz | Não | - | Soft delete |

> Essa tabela nova suporta geração/expiração de tokens, níveis de acesso e auditoria (gerar/revogar). A RLS associada deve usar `tenant_id` e claims `can_manage_portal_access=true`.

### 4.3 Fora do escopo (Aba04 Administrativa)

- Toda terminologia ligada a “gestor responsável”, “escalista”, “backoffice”, “financeiro”, “faturamento” ou “contrato financeiro” foi removida deste modelo e passa a ser tratada no escopo da Aba04 Administrativa. Os tabelas `patient_admin_info` e `patient_administrative_profiles` são referenciadas apenas para manter o mapa de legado, mas o processamento/documentação desses dados deve residir em Aba04.
- Tabelas explicitamente fora do escopo desta aba: `patient_admin_info`, `patient_administrative_profiles` e demais entidades administrativas/financeiras correlatas.

## 5) Segurança (RLS / Policies)

- RLS habilitado em todas as tabelas; policies replicam o padrão do módulo: `tenant_id` igual a `current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id'` ou `service_role`.
- SELECT: pacientes vinculados ao tenant. INSERT/UPDATE/DELETE limitados a pessoas com role adequada (ex.: `authenticated` com permissão via claims, `service_role` para jobs).
- `portal_access` deve respeitar adicionais: somente `service_role` e usuários com claim `can_manage_app_access=true` podem alterar tokens ou níveis de acesso.

## 6) Derivações para UI

- O card “Responsável legal” pode ser alimentado por uma consulta derivada (join nas tabelas canônicas) ou por uma view de legado. Essa view **não é tabela canônica** da Aba03, apenas um atalho de leitura.
- Campo esperado no resumo (canônico para UI):
  - `patient_id`
  - `related_person_id` (responsável legal primário)
  - `legal_guardian_name`
  - `legal_guardian_relationship`
  - `legal_guardian_phone`
  - `has_legal_guardian`
  - `legal_doc_status`
  - `updated_at`
- Se `view_patient_legal_guardian_summary` aparecer no legado como tabela materializada, ela deve ser tratada como VIEW derivada (ou query agregada em actions), sem virar tabela canônica.

## 7) Operações / Actions do App

- `getPatientResponsibleParty(patient_id)` retorna responsável principal com documentos validados.
- `listPatientContacts(patient_id)` lista contatos secundários com flags de autorização.
- `listCareTeam(patient_id)` traz profissionais ativos e regime.
- `savePatientResponsibleParty(payload)` valida RG/CPF + checklist e persiste timestamps e campos auditáveis.
- `savePatientContact(payload)` garante `is_main_contact` único.
- `refreshDocumentValidation(document_id)` inicia pipeline IA (POST em action) e grava `document_validation_payload` + status.
- `invitePortalAccess(patient_id)` gera token, envia email e grava `portal_invite_sent_at`.
- `setPortalAccessLevel(patient_id, level)` define `portal_access_level` e dispara auditoria.

## 8) Gestão de acesso ao Portal do Paciente (MVP — governança)

### 8.1.1) Níveis de acesso

- `viewer`: apenas visualizar dados da rede de apoio e documentos associados.
- `communicator`: além de visualizar, pode receber/enviar comunicados (WhatsApp/email) desde que o contato tenha opt-in.
- `decision_authorized`: além dos anteriores, pode autorizar decisões definidas no contrato (ex.: aceitar curatela) e visualizar links sensíveis.

`portal_access_level` deve ser armazenado em metadata (enum com os valores acima) e aparecer em históricos de `portal_access_change`.

### 8.1.2) Quem pode alterar/revogar

- Somente perfis internos com claim `can_manage_portal_access=true` (ex.: equipe administrativa ou patient admin) podem alterar `portal_access_level`, gerar novos links ou revogar acessos existentes. Esse controle deve ser implementado via RLS/claims e audit_events.
- Revogação também deve marcar `portal_access_revoked_at` e `portal_access_revoked_by`.

### 8.1.3) Ação “Gerar link de acesso”

- O botão “Gerar link de acesso ao portal” no card de responsável legal envia `responsible_party_id`, `portal_access_level`, `expires_at` (ex.: +72h) e `created_by`.
- Cada geração cria log/audit event (`portal_link_generated`) com payload resumido (`link_id`, `responsible_party_id`, `expires_at`, `created_by`, `status`), e o token pode ser revogado via `portal_link_revoked`.
- O link é derivado no front-end (sem implementar auth) a partir do token persistido, com `portal_access_level` e `expira_em` visíveis na UI.

Nota: o portal não é implementado nesta etapa; a Aba03 descreve apenas a governança e a rastreabilidade de acesso.

## 9) Status de documentos jurídicos

- A enum `document_status` controla o fluxo completo:
  1. `uploaded` — o arquivo foi anexado e ainda não passou por IA ou revisão.
  2. `ai_pending` — aguardando análise automática (só quando `LEGAL_DOC_AI_ENABLED=true`).
  3. `ai_failed` — IA executou e falhou/errou, exigindo revisão manual.
  4. `ai_passed` — IA concluiu com sucesso e registrou evidências (não aprova sozinha).
  5. `manual_pending` — aguardando revisão manual (entrada padrão se IA desligado).
  6. `manual_rejected` — revisão final reprovada.
  7. `manual_approved` — revisão final aprovada; somente esse status torna o responsável legal válido.
  8. `revoked` — documento revogado/substituído (ex.: nova procuração ou sentença).
  9. `expired` — documento venceu; impede acesso até upload de nova versão.

- **Bloqueio obrigatório:** o responsável legal só é considerado vigente quando associado a `document_status = manual_approved`. Outros status mantêm o registro em estado “em revisão” e não habilitam autorizações ou links persistentes.
- **IA opcional:** `LEGAL_DOC_AI_ENABLED` defaulta para `false`. Quando OFF, os estados `ai_*` são pulados automaticamente e o fluxo segue `uploaded` → `manual_pending`. Quando ON, a IA apenas “pré-analisa”; o resultado (`ai_passed` ou `ai_failed`) alimenta checklists, mas a aprovação final continua manual.

## 10) Máscaras e Validações (detalhadas)

- CPF/RG seguem formatos oficiais; CPF 11 dígitos numéricos e RG 7–9 dígitos com opcional hífen.
- Telefone: E.164 (remover espaços) e fallback para apenas números quando com +55.
- Email: domínio verificado contra whitelist interna.
- Documentos jurídicos: exigem `file_hash`, `document_status` e `uploaded_at`; checklists predefinidos dependem de `category` (curatela vs procuração).
- Preferências de contato: catálogos (Manhã/Tarde/Noite/Comercial/Qualquer) são validados por constraint check.
- Portal access level: enum {visualizar, comunicar, autorizar}; atualizações registram `portal_access_changed_by` e `portal_access_changed_at`.

## 11) Migrações previstas

- `supabase/migrations/20251221XXXX_pacientes_aba03_rede_apoio.sql` (placeholder): cria tabelas canônicas listadas em 4.1, indexes parciais para `is_primary` e `is_main_contact`, RLS e audit triggers.
- `supabase/migrations/20251221XXXX_pacientes_aba03_document_validation.sql`: adiciona campos `document_validation_payload`, `document_status`, `portal_access_level`, `portal_invite_token` nas tabelas referidas.

## 12) Definição de Pronto (DoD)

- [ ] Contrato revisado e aceito (documentado aqui).
- [ ] Migration(s) definidas e aplicadas no ambiente de dev (documentar números no próximo PR).
- [ ] Schemas/Types gerados (Supabase typings atualizados).
- [ ] Actions implementadas para list/get/save/invite/refresh.
- [ ] UI da Aba 03 sem mocks, usando dados reais com command bar padrão.
- [ ] RLS + policies testadas (tenants + soft delete).
- [ ] Checklist de QA manual (modo leitura/edição, portal, documentos) registrado.

## 13) Cobertura do legado (100%) (fonte: `docs/repo_antigo/schema_current.sql`, `db/snapshots_legado/conectacare-2025-11-29.sql`)

- As tabelas in-scope abaixo têm suas colunas e mapeamento explícitos no mapa legado→canônico. Itens administrativos aparecem apenas na lista out-of-scope para preservar rastreabilidade sem misturar escopo.

**IN-SCOPE (Aba03):**

- `patient_related_persons` — 42 colunas (responsável legal + contatos).
- `care_team_members` — 26 colunas (rede de cuidados externa).
- `patient_household_members` — 7 colunas (contatos conviventes).
- `patient_documents` — 64 colunas (recorte jurídico: curatela/procuração).
- `patient_document_logs` — 8 colunas (auditoria dos documentos).
- `view_patient_legal_guardian_summary` — 6 colunas (view legado; referência para UI).

**OUT-OF-SCOPE (Aba04 Administrativa/Financeira):**

- `patient_admin_info` — 101 colunas (administrativo/financeiro).
- `patient_administrative_profiles` — 12 colunas (administrativo).

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

### View legado: `public.view_patient_legal_guardian_summary`

| Coluna | Tipo | Observações |
| --- | --- | --- |
| patient_id | uuid | |
| related_person_id | uuid | |
| responsavellegalnome | text | |
| responsavellegalparentesco | text | |
| responsavellegaltelefoneprincipal | text | |
| hasresponsavellegal | boolean | |

> **Nota:** esta view é apenas referência para UI; na Aba03 ela deve ser tratada como VIEW derivada, não como tabela canônica.

## 14) Mapa legado → canônico

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
| Resumo (view) | `view_patient_legal_guardian_summary.*` | `view_patient_legal_guardian_summary.*` | View legado usada como atalho de leitura, sem criar tabela canônica. |
| Portal | `patient_portal_access.*` | patient_documents / patient_related_persons | Documentos legais alimentam tokens; `portal_access_level` derived. |

## 15) Separação Aba03 x Aba04 (decisão fechada)

- **Aba03 (Rede de Apoio):** responsável legal + documentos jurídicos, contatos/familiares e rede de cuidados externa.
- **Aba04 (Administrativa/Financeira):** gestores internos, escalistas, backoffice, faturamento e contratos financeiros.

## 16) Perguntas em aberto para Renato

- Confirmar quais perfis internos terão a permissão `can_manage_portal_access=true`.
- Definir o campo canônico para assinatura final da revisão (`approved_by` ou `signed_by`) e em qual tabela ficará registrado.
