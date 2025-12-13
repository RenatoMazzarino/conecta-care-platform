# Contrato da Aba: Dados Pessoais

## 0) Metadados
- Módulo: Pacientes
- Aba: ABA01 — Dados Pessoais
- Versão: 0.4
- Status: Aprovado
- Última atualização: 2025-12-13
- Governança:
  - O legado é referência de **cobertura/estrutura**. O schema novo segue as decisões deste contrato.
  - Divergências/exceções ao legado são permitidas quando decididas e justificadas aqui.
  - Exceções aprovadas: `photo_path`, `birth_place`, `naturalness_city`/`naturalness_state`/`naturalness_country`, remoção de `document_validation_method` (manter só `doc_validation_method`).
- Referências:
  - `docs/repo_antigo/schema_current.sql`
  - `db/snapshots/`
  - `docs/contracts/_templates/CONTRACT_TEMPLATE.md`
  - `src/app/pacientes/[id]/page.tsx`
  - `src/app/pacientes/[id]/PatientPageClient.tsx` (UI atual ainda usa mocks)
  - `src/components/patient/DadosPessoaisTab.tsx` (layout alvo da Aba 01)
  - `src/types/patient.ts` (tipos provisórios; serão substituídos por types gerados)

## 1) Objetivo da Aba
- Capturar e manter dados civis e de contato do paciente (identificação + contato), com validações e normalização de dados (ex.: CPF e telefones), garantindo isolamento multi-tenant via `tenant_id` + RLS.
- Perfis típicos: atendimento/recepção (cadastro), coordenação/enfermagem (consulta), administrativo (correções).

## 2) Estrutura de UI (Cards e Campos)
- Layout alvo: `src/components/patient/DadosPessoaisTab.tsx`.
- Cards/seções:
  - **Foto do paciente (seção lateral)**: exibe avatar a partir de `photo_path` (path do Storage; URL assinada só na exibição).
  - **Identificação**: dados civis do paciente.
  - **Perfil**: preferências e atributos pessoais (apelido, pronomes, escolaridade etc.).
  - **Naturalidade & filiação**: dados de origem e filiação.
  - **Documentos & verificação**: CNS, validação documental, status do CPF etc.
  - **Contato & preferências**: telefones, e-mail, preferências de contato e janela de contato.
  - **Consentimentos & marketing**: opt-ins e trilha de consentimento.
  - **Status do cadastro (2 fases)**: `record_status` + `onboarding_step` com regra vinculada a `is_active`.
  - **Integrações/Administrativo (na tabela, UI em outras abas)**: `primary_contractor_id`, `external_ids`.
  - **Interno (auditoria)**: `created_by`, `updated_by`, `deleted_at`.

Nota (fora da ABA01 / sem coluna em `public.patients`):
- `has_legal_guardian` e `legal_guardian_status` vivem na **Aba Rede de Apoio**; na Aba 01 serão exibidos como **card derivado** via lógica do app.

Tabela padrão por campo (obrigatória):
| Card | Campo (label UI) | Nome técnico (schema.table.column) | Tipo PG | Tipo TS | Obrigatório | Default | Validações | Máscara | Descrição curta |
|------|-------------------|------------------------|--------|--------|-------------|---------|-----------|--------|----------------|
| Foto do paciente | Foto do paciente | `public.patients.photo_path` | `text` | `string \| null` | Não | `NULL` | **path interno no Storage** (ex.: `patients/<id>/photo.jpg`); URL assinada só na exibição; não armazenar URL pública; trim; não permitir string vazia | — | Foto do paciente (path interno). |
| Foto do paciente | Consentimento de foto | `public.patients.photo_consent` | `boolean` | `boolean` | Sim | `false` | — | toggle | Consentimento para uso/armazenamento de foto. |
| Foto do paciente | Data do consentimento de foto | `public.patients.photo_consent_date` | `timestamptz` | `string \| null` | Não | `NULL` | — | — | Timestamp do consentimento de foto. |
| Identificação | Nome completo | `public.patients.full_name` | `text` | `string` | Sim | — | trim; min 3; max 200 | — | Nome civil do paciente. |
| Identificação | Nome social | `public.patients.social_name` | `text` | `string \| null` | Não | `NULL` | trim; max 200 | — | Nome social (opcional). |
| Perfil | Apelido | `public.patients.nickname` | `text` | `string \| null` | Não | `NULL` | trim; max 100 | — | Apelido do paciente. |
| Perfil | Tratamento | `public.patients.salutation` | `text` | `string \| null` | Não | `NULL` | trim; max 60; (sem check no legado) | — | Forma de tratamento (legado). |
| Identificação | CPF | `public.patients.cpf` | `text` | `string \| null` | Não | `NULL` | **normalizar para dígitos**; 11 dígitos; dígitos verificadores; único por `tenant_id` quando preenchido | `000.000.000-00` | CPF do paciente. |
| Documentos & verificação | Status do CPF | `public.patients.cpf_status` | `text` | `'valid' \| 'invalid' \| 'unknown' \| null` | Não | `unknown` | `in ('valid','invalid','unknown')` | select | Status de validação do CPF (desconhecido até validação no app). |
| Identificação | RG | `public.patients.rg` | `text` | `string \| null` | Não | `NULL` | trim; max 30 | — | Registro Geral. |
| Identificação | Órgão emissor (RG) | `public.patients.rg_issuer` | `text` | `string \| null` | Não | `NULL` | trim; max 60 | — | Órgão emissor do RG. |
| Identificação | UF emissor (RG) | `public.patients.rg_issuer_state` | `text` | `string \| null` | Não | `NULL` | check legado: `^[A-Z]{2}$` | `UF` | UF emissora do RG. |
| Identificação | Data de emissão (RG) | `public.patients.rg_issued_at` | `date` | `string \| null` | Não | `NULL` | `<= current_date` | `YYYY-MM-DD` | Data de emissão do RG. |
| Documentos & verificação | CNS | `public.patients.cns` | `text` | `string \| null` | Não | `NULL` | trim; max 30 | — | Cartão Nacional de Saúde. |
| Documentos & verificação | Documento nacional | `public.patients.national_id` | `text` | `string \| null` | Não | `NULL` | trim; max 60 | — | Identificador nacional (legado). |
| Identificação | Data de nascimento | `public.patients.date_of_birth` | `date` | `string \| null` | Não | `NULL` | não futura; idade plausível | `YYYY-MM-DD` | Data de nascimento. |
| Identificação | Sexo | `public.patients.gender` | `text` | `'M' \| 'F' \| 'Outro' \| null` | Não | `NULL` | `in ('M','F','Outro')` | select | Sexo cadastral. |
| Perfil | Identidade de gênero | `public.patients.gender_identity` | `text` | `string \| null` | Não | `NULL` | `in ('Cisgenero','Transgenero','Nao Binario','Outro','Prefiro nao informar')` | select | Identidade de gênero. |
| Perfil | Pronomes | `public.patients.pronouns` | `text` | `string \| null` | Não | `NULL` | `in ('Ele/Dele','Ela/Dela','Elu/Delu','Outro')` | select | Pronomes do paciente. |
| Identificação | Estado civil | `public.patients.civil_status` | `text` | `string \| null` | Não | `NULL` | `in ('solteiro','casado','divorciado','viuvo','uniao_estavel')` | select | Estado civil. |
| Naturalidade & filiação | Nacionalidade | `public.patients.nationality` | `text` | `string \| null` | Não | `Brasileira` | trim; max 100 | — | Nacionalidade. |
| Perfil | Idioma preferido | `public.patients.preferred_language` | `text` | `string \| null` | Não | `Português` | trim; max 60 | — | Idioma preferido. |
| Perfil | Escolaridade | `public.patients.education_level` | `text` | `string \| null` | Não | `NULL` | `in ('Nao Alfabetizado','Fundamental Incompleto','Fundamental Completo','Medio Incompleto','Medio Completo','Superior Incompleto','Superior Completo','Pos Graduacao','Mestrado/Doutorado','Nao Informado')` | select | Escolaridade (legado). |
| Perfil | Profissão | `public.patients.profession` | `text` | `string \| null` | Não | `NULL` | trim; max 120 | — | Profissão. |
| Perfil | Raça/Cor | `public.patients.race_color` | `text` | `string \| null` | Não | `NULL` | `in ('Branca','Preta','Parda','Amarela','Indigena','Nao declarado')` | select | Raça/cor (legado). |
| Perfil | PCD | `public.patients.is_pcd` | `boolean` | `boolean` | Sim | `false` | — | toggle | Indica se é pessoa com deficiência. |
| Naturalidade & filiação | Local de nascimento (texto livre) | `public.patients.birth_place` | `text` | `string \| null` | Não | `NULL` | trim; max 200 | — | Local de nascimento (campo livre). |
| Naturalidade & filiação | Naturalidade — Cidade | `public.patients.naturalness_city` | `text` | `string \| null` | Não | `NULL` | trim; max 120 | — | Naturalidade (cidade); no Brasil, naturalidade é cidade/UF (e país quando aplicável). |
| Naturalidade & filiação | Naturalidade — UF/Estado | `public.patients.naturalness_state` | `text` | `string \| null` | Não | `NULL` | trim; max 60; **se `naturalness_country = 'Brasil'` preferir UF `^[A-Z]{2}$` (validação forte no app)** | — | Naturalidade (UF/estado). |
| Naturalidade & filiação | Naturalidade — País | `public.patients.naturalness_country` | `text` | `string \| null` | Não | `Brasil` | trim; max 60 | — | Naturalidade (país). |
| Naturalidade & filiação | Nome da mãe | `public.patients.mother_name` | `text` | `string \| null` | Não | `NULL` | trim; max 200 | — | Nome da mãe. |
| Naturalidade & filiação | Nome do pai | `public.patients.father_name` | `text` | `string \| null` | Não | `NULL` | trim; max 200 | — | Nome do pai. |
| Contato & preferências | Telefone principal | `public.patients.mobile_phone` | `text` | `string` | Sim | — | **normalizar para dígitos**; regex digits (check) | `(00) 00000-0000` | Telefone principal. |
| Contato & preferências | Telefone secundário | `public.patients.secondary_phone` | `text` | `string \| null` | Não | `NULL` | normalizar; regex digits (check) | `(00) 00000-0000` | Telefone secundário. |
| Contato & preferências | Tipo telefone secundário | `public.patients.secondary_phone_type` | `text` | `string \| null` | Não | `NULL` | trim; max 40 | — | Tipo/descrição do telefone secundário. |
| Contato & preferências | E-mail | `public.patients.email` | `text` | `string \| null` | Não | `NULL` | trim; lowercase; regex simples (check) | — | E-mail do paciente. |
| Contato & preferências | E-mail verificado | `public.patients.email_verified` | `boolean` | `boolean` | Sim | `false` | — | toggle | Indica se e-mail foi verificado. |
| Contato & preferências | Telefone verificado | `public.patients.mobile_phone_verified` | `boolean` | `boolean` | Sim | `false` | — | toggle | Indica se telefone foi verificado. |
| Contato & preferências | Preferência de contato (paciente) | `public.patients.pref_contact_method` | `text` | `string \| null` | Não | `NULL` | `in ('whatsapp','phone','sms','email','other')` | select | Canal preferido do paciente. |
| Contato & preferências | Janela preferida de contato | `public.patients.contact_time_preference` | `text` | `string \| null` | Não | `NULL` | `in ('Manha','Tarde','Noite','Comercial','Qualquer Horario')` | select | Horário preferido para contato. |
| Contato & preferências | Notas de contato | `public.patients.contact_notes` | `text` | `string \| null` | Não | `NULL` | trim; max 5000 | — | Observações sobre contato. |
| Contato & preferências | Preferências de comunicação | `public.patients.communication_preferences` | `jsonb` | `Json` | Sim | `{\"sms\":true,\"email\":true,\"whatsapp\":true}` | schema mínimo (sms/email/whatsapp boolean) | — | Preferências multi-canal (legado). |
| Documentos & verificação | Status validação documental | `public.patients.doc_validation_status` | `text` | `string \| null` | Não | `Pendente` | `in ('Pendente','Nao Validado','Validado','Inconsistente','Em Analise')` | select | Status da validação documental. |
| Documentos & verificação | Método de validação | `public.patients.doc_validation_method` | `text` | `string \| null` | Não | `NULL` | trim; max 120 | — | Método usado para validar docs. |
| Documentos & verificação | Fonte de validação | `public.patients.doc_validation_source` | `text` | `string \| null` | Não | `NULL` | trim; max 120 | — | Fonte/origem da validação. |
| Documentos & verificação | Validado em | `public.patients.doc_validated_at` | `timestamptz` | `string \| null` | Não | `NULL` | — | — | Timestamp de validação. |
| Documentos & verificação | Validado por | `public.patients.doc_validated_by` | `uuid` | `string \| null` | Não | `NULL` | — | — | Usuário (auth) validador. |
| Consentimentos & marketing | Aceita SMS | `public.patients.accept_sms` | `boolean` | `boolean` | Sim | `true` | — | toggle | Opt-in de SMS. |
| Consentimentos & marketing | Aceita e-mail | `public.patients.accept_email` | `boolean` | `boolean` | Sim | `true` | — | toggle | Opt-in de e-mail. |
| Consentimentos & marketing | Bloquear marketing | `public.patients.block_marketing` | `boolean` | `boolean` | Sim | `false` | — | toggle | Bloqueio geral de marketing. |
| Consentimentos & marketing | Status consentimento marketing | `public.patients.marketing_consent_status` | `text` | `string \| null` | Não | `pending` | `in ('pending','accepted','rejected')` | select | Status de consentimento marketing. |
| Consentimentos & marketing | Consentido em | `public.patients.marketing_consented_at` | `timestamptz` | `string \| null` | Não | `NULL` | — | — | Timestamp do consentimento marketing. |
| Consentimentos & marketing | Origem do consentimento | `public.patients.marketing_consent_source` | `text` | `string \| null` | Não | `NULL` | `in ('Portal Administrativo (Edicao Manual)','Formulario Web','Assinatura Digital','Importacao de Legado','Solicitacao Verbal')` | — | Fonte do consentimento marketing. |
| Consentimentos & marketing | IP do consentimento | `public.patients.marketing_consent_ip` | `inet` | `string \| null` | Não | `NULL` | — | — | IP relacionado ao consentimento. |
| Consentimentos & marketing | Histórico do consentimento | `public.patients.marketing_consent_history` | `text` | `string \| null` | Não | `NULL` | trim; max 5000 | — | Histórico (texto) do consentimento. |
| Integrações/Administrativo | Contratante primário | `public.patients.primary_contractor_id` | `uuid` | `string \| null` | Não | `NULL` | — | — | FK/ID do contratante principal (legado). |
| Integrações/Administrativo | IDs externos | `public.patients.external_ids` | `jsonb` | `Json \| null` | Não | `NULL` | — | — | IDs externos para integrações. |
| Status do cadastro | Etapa onboarding | `public.patients.onboarding_step` | `integer` | `number` | Sim | `1` | `>= 1` | — | Etapa atual do onboarding. |
| Status do cadastro | Status do registro | `public.patients.record_status` | `text` | `string` | Sim | `draft` | `in ('draft','onboarding','active','inactive','deceased','discharged','pending_financial')` + regra 2 fases com `is_active` | select | Status do cadastro/vida do paciente. |
| Status do cadastro | Ativo (marco de ativação) | `public.patients.is_active` | `boolean` | `boolean` | Sim | `false` | check 2 fases via `record_status` | toggle | Marco de ativação do paciente. |
| Interno (auditoria) | Criado por | `public.patients.created_by` | `uuid` | `string \| null` | Não | `NULL` | — | — | Usuário criador (interno). |
| Interno (auditoria) | Atualizado por | `public.patients.updated_by` | `uuid` | `string \| null` | Não | `NULL` | — | — | Usuário atualizador (interno). |
| Interno (auditoria) | Deletado em | `public.patients.deleted_at` | `timestamptz` | `string \| null` | Não | `NULL` | — | — | Soft delete (interno). |

## 3) Modelo de Dados (Banco)
Tabela(s) envolvidas:
- `public.patients` (somente colunas da ABA01 + metadados padrão).

Governança (aprovada):
- Legado (`schema_current.sql` + snapshots) é **referência de cobertura/estrutura**. O schema novo segue as decisões deste contrato, com divergências permitidas quando **explicitamente decididas e justificadas** aqui.

Decisões explícitas (aprovadas):
- `mobile_phone` é **obrigatório** (`NOT NULL`).
- `gender` e `civil_status` são **TEXT + CHECK** (sem enum).
- Exceções aprovadas (divergem do legado):
  - Foto: **`photo_path`** (path do Storage); URL assinada apenas na exibição.
  - Naturalidade (Brasil): **`birth_place`** (texto livre) + **`naturalness_city`**, **`naturalness_state`**, **`naturalness_country`** (não manter `place_of_birth*` no schema final).
  - Validação documental: manter apenas **`doc_validation_method`** (remover `document_validation_method`).
  - Responsável legal: **fora de `public.patients`** (vive em Rede de Apoio; Aba 01 exibe por card derivado).
- Status do paciente tem 2 fases:
  - pré-ativação: `is_active = false` → `record_status in ('draft', 'onboarding')`
  - pós-ativação: `is_active = true` → `record_status in ('active', 'inactive', 'deceased', 'discharged', 'pending_financial')`

Chaves e colunas mínimas:
- PK: `public.patients.id` (`uuid`, default `gen_random_uuid()`).
- Multi-tenant:
  - `public.patients.tenant_id` (`uuid`, **NOT NULL**, default `app_private.current_tenant_id()`).
- Metadados:
  - `public.patients.created_at` (`timestamptz`, default `now()`).
  - `public.patients.updated_at` (`timestamptz`, default `now()`; atualizado via trigger `touch_updated_at`).
  - `public.patients.created_by` (`uuid`, nullable; preenchido pela aplicação).
  - `public.patients.updated_by` (`uuid`, nullable; preenchido pela aplicação).
  - `public.patients.deleted_at` (`timestamptz`, nullable; soft delete quando aplicável).

Índices necessários (mínimo):
- `patients_tenant_id_idx`: btree em `tenant_id`.
- `patients_tenant_full_name_idx`: btree em (`tenant_id`, `lower(full_name)`), para busca por nome por tenant.
- `patients_tenant_cpf_uidx`: **unique** em (`tenant_id`, `cpf`) com `WHERE cpf IS NOT NULL`.
- `patients_tenant_record_status_idx`: btree em (`tenant_id`, `record_status`), para filtros de status.
- `patients_tenant_onboarding_step_idx`: btree em (`tenant_id`, `onboarding_step`), para filtros de onboarding.

Constraints/checks necessários (mínimo):
- CPF:
  - check `cpf` com regex `^[0-9]{11}$` quando não nulo.
  - unicidade por tenant quando não nulo.
- Telefones:
  - check `mobile_phone` (NOT NULL) e `secondary_phone` (quando não nulo) com regex de dígitos (ex.: `^[0-9]{10,13}$`).
- Email:
  - check simples quando não nulo (ex.: contém `@` e `.` após `@`) **e/ou** validação forte no app.
- Data:
  - check `date_of_birth <= current_date` quando não nulo.
- Domínios:
  - `gender in ('M','F','Outro')` quando não nulo.
  - `civil_status in ('solteiro','casado','divorciado','viuvo','uniao_estavel')` quando não nulo.
- Preferência de contato:
  - `pref_contact_method in ('whatsapp','phone','sms','email','other')` quando não nulo.
  - `contact_time_preference in ('Manha','Tarde','Noite','Comercial','Qualquer Horario')` quando não nulo.
- Perfil (legado):
  - `pronouns in ('Ele/Dele','Ela/Dela','Elu/Delu','Outro')` quando não nulo.
  - `gender_identity in ('Cisgenero','Transgenero','Nao Binario','Outro','Prefiro nao informar')` quando não nulo.
  - `education_level in (...)` quando não nulo (lista do legado).
  - `race_color in ('Branca','Preta','Parda','Amarela','Indigena','Nao declarado')` quando não nulo.
- Documentos/validação (legado):
  - `cpf_status in ('valid','invalid','unknown')` quando não nulo.
  - `doc_validation_status in ('Pendente','Nao Validado','Validado','Inconsistente','Em Analise')` quando não nulo.
- Marketing (legado):
  - `marketing_consent_status in ('pending','accepted','rejected')` quando não nulo.
  - `marketing_consent_source in (...)` quando não nulo (lista do legado).
- Status:
  - `record_status in ('draft','onboarding','active','inactive','deceased','discharged','pending_financial')`.
  - check adicional de 2 fases vinculado a `is_active`:
    - `is_active = false` → `record_status in ('draft','onboarding')`
    - `is_active = true` → `record_status in ('active','inactive','deceased','discharged','pending_financial')`
    - Nome canônico da constraint: `patients_record_status_phase_check`

## 4) Segurança (RLS / Policies)
RLS:
- `public.patients`: **enabled**

Policies (por tenant):
- SELECT: permitir quando `tenant_id = app_private.current_tenant_id()` **e** `deleted_at IS NULL`.
- INSERT: permitir quando `tenant_id = app_private.current_tenant_id()` (via `WITH CHECK`).
- UPDATE: permitir quando `tenant_id = app_private.current_tenant_id()` **e** `deleted_at IS NULL` (via `USING` + `WITH CHECK`).
- DELETE: permitir quando `tenant_id = app_private.current_tenant_id()` **e** `deleted_at IS NULL` (via `USING`).

Observação sobre `tenant_id` + `app_private.current_tenant_id()`:
- O `tenant_id` deve ser derivado do JWT (`auth.jwt()->>'tenant_id'`) e **nunca** retornar `NULL`.
- Fallback seguro recomendado: permitir override explícito via `current_setting('app.tenant_id', true)` para seeds/local, e lançar erro se ausente.

## 5) Operações / Actions do App
Leituras necessárias:
- `getPatientById(patientId)`: retorna os campos da ABA01 de `public.patients` (por tenant) + metadados úteis (`updated_at`).

Updates necessários:
- `updatePatientDadosPessoais(patientId, payload)` onde `payload` contém **apenas** campos da ABA01:
  - Identificação/Perfil: `full_name`, `social_name`, `nickname`, `cpf`, `rg`, `rg_issuer`, `rg_issuer_state`, `rg_issued_at`,
    `date_of_birth`, `gender`, `gender_identity`, `pronouns`, `civil_status`, `preferred_language`,
    `education_level`, `profession`, `race_color`, `is_pcd`
  - Naturalidade/filiação: `birth_place`, `naturalness_city`, `naturalness_state`, `naturalness_country`,
    `nationality`, `mother_name`, `father_name`
  - Documentos/validação: `national_id`, `cns`, `cpf_status`, `doc_validation_status`, `doc_validation_method`,
    `doc_validation_source`, `doc_validated_at`, `doc_validated_by`
  - Contato: `mobile_phone`, `secondary_phone`, `secondary_phone_type`, `email`, `email_verified`, `mobile_phone_verified`,
    `pref_contact_method`, `contact_time_preference`, `contact_notes`, `communication_preferences`
  - Marketing/consentimentos: `accept_sms`, `accept_email`, `block_marketing`, `marketing_consent_status`, `marketing_consented_at`,
    `marketing_consent_source`, `marketing_consent_ip`, `marketing_consent_history`
  - Foto: `photo_path`, `photo_consent`, `photo_consent_date`
  - Status: `record_status`, `onboarding_step`, `is_active`
  - Integrações/administrativo: `primary_contractor_id`, `external_ids`
  - Campos internos **não** podem ser enviados pelo app: `tenant_id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`.
- Regras obrigatórias:
  - normalizar CPF/telefones para dígitos antes de persistir.
  - `email` em lowercase e trimmed.
  - validação do payload (ex.: `zod`) com erros claros (campo + mensagem).

Regras de salvar/cancelar:
- UI inicia em modo **view**.
- Ao clicar em **Editar**, entrar em modo **edit** com formulário.
- **Salvar** chama `updatePatientDadosPessoais`; sucesso volta para view e refetch/revalidate.
- **Cancelar** descarta alterações locais e volta para view.

Estados de UI:
- `loading`: skeleton/spinner no conteúdo da aba.
- `error`: mensagem + ação de tentar novamente.
- `success`: toast/banner “Dados pessoais atualizados”.

## 6) Máscaras e Validações (detalhadas)
CPF:
- Entrada com máscara `000.000.000-00`.
- Persistência: somente dígitos (`^[0-9]{11}$`).
- Validar dígitos verificadores no app (antes do update).

Telefone:
- Entrada com máscara `(00) 00000-0000` (aceitar `(00) 0000-0000` quando aplicável).
- Persistência: somente dígitos (aceitar 10–11 BR; opcional 12–13 com DDI).

Domínios (selects / checks):
- `gender`: `M`, `F`, `Outro`.
- `civil_status`: `solteiro`, `casado`, `divorciado`, `viuvo`, `uniao_estavel`.
- `gender_identity`: `Cisgenero`, `Transgenero`, `Nao Binario`, `Outro`, `Prefiro nao informar`.
- `pronouns`: `Ele/Dele`, `Ela/Dela`, `Elu/Delu`, `Outro`.
- `education_level`: `Nao Alfabetizado`, `Fundamental Incompleto`, `Fundamental Completo`, `Medio Incompleto`, `Medio Completo`, `Superior Incompleto`, `Superior Completo`, `Pos Graduacao`, `Mestrado/Doutorado`, `Nao Informado`.
- `race_color`: `Branca`, `Preta`, `Parda`, `Amarela`, `Indigena`, `Nao declarado`.
- `pref_contact_method`: `whatsapp`, `phone`, `sms`, `email`, `other`.
- `contact_time_preference`: `Manha`, `Tarde`, `Noite`, `Comercial`, `Qualquer Horario`.
- `cpf_status`: `valid`, `invalid`, `unknown`.
- `doc_validation_status`: `Pendente`, `Nao Validado`, `Validado`, `Inconsistente`, `Em Analise`.
- `marketing_consent_status`: `pending`, `accepted`, `rejected`.
- `marketing_consent_source`: `Portal Administrativo (Edicao Manual)`, `Formulario Web`, `Assinatura Digital`, `Importacao de Legado`, `Solicitacao Verbal`.
- `record_status`: `draft`, `onboarding`, `active`, `inactive`, `deceased`, `discharged`, `pending_financial` com regra de 2 fases via `is_active`.

Método preferido de contato:
- Campo opcional (`pref_contact_method`, single-select) com check (valores definidos no contrato).
- Observação: multi-select por pessoa/contato será na **Aba Rede de Apoio** (futuro), não aqui.

Email:
- `trim()` + `toLowerCase()`.
- Validar formato no app; no banco manter check simples (não substituir validação do app).

Data:
- UI usa `input[type=date]` (ISO `YYYY-MM-DD`).
- Validar `<= hoje` e idade plausível.

Nome:
- `trim()`; colapsar espaços múltiplos; max 200.

## 7) Migrações previstas
Base (fundação do schema):
- `supabase/migrations/202512130452_base.sql`
  - schema `app_private`
  - função `app_private.current_tenant_id()` (não retorna `NULL`)
  - função/trigger `touch_updated_at`

Aba 01 (criação inicial):
- `supabase/migrations/202512130453_pacientes_aba01_dados_pessoais.sql`
  - cria `public.patients` (v0.2) + RLS/policies por tenant + trigger `updated_at`

Aba 01 (extensão legado):
- `supabase/migrations/202512130704_pacientes_aba01_dados_pessoais_extend_legado.sql`
  - adiciona colunas/checks do legado para cobertura (pronouns, gender_identity, education_level, race_color, consentimentos, status etc.)
  - ajusta policy de SELECT/UPDATE/DELETE para ignorar `deleted_at` (soft delete)

Aba 01 (alinhamento final do contrato):
- `supabase/migrations/202512131716_pacientes_aba01_align_final.sql`
  - renomeia para nomenclatura canônica do contrato (`photo_path`, `birth_place`, `naturalness_*`)
  - remove duplicidade `document_validation_method` (mantém `doc_validation_method`)
  - garante defaults/checks do status 2 fases e unicidade de CPF por tenant

## 8) Definição de Pronto (DoD)
Checklist:
- [ ] Contrato aprovado
- [ ] Migration criada e aplicada no Supabase local
- [ ] Tipos TS regenerados
- [ ] UI sem mocks, usando Supabase
- [ ] Actions implementadas
- [ ] RLS e policies validadas
- [ ] Testes manuais (lista)
- [ ] Documentação do runbook atualizada

Testes manuais mínimos (ABA01):
- [ ] Abrir `/pacientes/[id]` e carregar dados reais do Supabase
- [ ] Entrar em modo edição, alterar campos e salvar
- [ ] Validar CPF inválido/telefone inválido/email inválido (erro de campo)
- [ ] Garantir isolamento por tenant (um tenant não lê/atualiza outro)

TODOs (não bloqueiam a ABA01):
- TODO: definir bucket/policies do Storage para `photo_path` (sem expor URLs públicas indevidas).
