# Contrato da Aba: GED (Gestao Eletronica de Documentos)

## 0) Metadados

- Modulo: Pacientes
- Aba: ABA05 — GED (Gestao Eletronica de Documentos)
- Versao: 1.1.0
- Status: Aprovado
- Ultima atualizacao: 2026-01-02
- Referencias:
  - [AGENT.md](../../../AGENT.md) (governanca e fluxo contrato -> migrations -> types -> actions -> UI)
  - [docs/contracts/_templates/CONTRACT_TEMPLATE.md](../_templates/CONTRACT_TEMPLATE.md)
  - [docs/contracts/pacientes/ABA03_REDE_APOIO.md](./ABA03_REDE_APOIO.md)
  - [docs/contracts/pacientes/ABA04_ADMIN_FINANCEIRO.md](./ABA04_ADMIN_FINANCEIRO.md)
  - [docs/architecture/decisions/ADR-007-ged-custodia-watermark-time-stamp.md](../../architecture/decisions/ADR-007-ged-custodia-watermark-time-stamp.md)
  - [docs/architecture/decisions/ADR-004-ui-dynamics-standard.md](../../architecture/decisions/ADR-004-ui-dynamics-standard.md)
  - [html/ged-viewer-dynamics.html](../../../html/ged-viewer-dynamics.html) (viewer protegido / Dynamics)
  - [html/modelo_final_aparencia_pagina_do_paciente.htm](../../../html/modelo_final_aparencia_pagina_do_paciente.htm) (shell Pacientes)
  - [docs/repo_antigo/schema_current.sql](../../repo_antigo/schema_current.sql) + [db/snapshots_legado/conectacare-2025-11-29.sql](../../../db/snapshots_legado/conectacare-2025-11-29.sql) (referencia externa)
  - [SERPRO (ACT ICP-Brasil)](https://www.serpro.gov.br/) (referencia oficial do provedor TSA)
  - LGPD (Lei 13.709/2018) e requisitos contratuais do tenant

Declaracao de greenfield: Conecta Care GED e greenfield; nao ha migracao/backfill de legado neste ciclo. Qualquer mencao a snapshot/legado e referencia externa e nao e requisito de implementacao.

## 1) Objetivo da Aba

- Transformar o GED em submodulo do paciente com pagina dedicada (`/pacientes/{id}/ged`) e UI estilo Explorer/OneDrive.
- Centralizar a custodia de arquivos do paciente com hash, carimbo do tempo, logs e controle de acesso.
- Exibir documentos via viewer protegido (watermark overlay) e imprimir/baixar apenas derivados com evidencias.
- Suportar acesso ao original somente via link seguro, autenticado, com expiracao e download unico.
- Garantir onboarding enterprise com importacao em massa (ZIP + manifest + fallback) sem bloquear o fluxo.

## 2) Escopo

**IN (GED):**

- Pagina dedicada do GED no modulo de Pacientes, com CTA na antiga aba.
- Pastas persistidas no banco (create/rename/move), com pastas sistema nao deletaveis.
- Explorer UI (arvore de pastas, breadcrumbs, busca com escopo e lista de arquivos).
- Selecoes em massa (arquivar, solicitar originais) com barra de acoes.
- Centro de Custodia (contadores + requisicoes mae + auditoria por item).
- Armazenamento do original imutavel com SHA-256, TSA SERPRO e trilha completa de eventos.
- Viewer protegido (overlay), impressao derivada, artifacts e links seguros.
- Importacao em massa (onboarding) via ZIP em contexto single-paciente.
- RLS, soft delete e auditoria detalhada.

**OUT:**

- Validacoes/aprovacoes de dominio (CPF, laudos, etc.) — ficam nas abas especificas.
- Geracao clinica (receitas, laudos) — origem nos modulos de prontuario.
- Importacao multi-paciente (escopo de outro modulo/admin).
- Storage refletindo estrutura de pastas (proibido; pastas sao so no banco).

## 3) Taxonomia enterprise (classificacao + pastas)

Taxonomia = classificacao canonica. Pastas sao persistidas no banco e nao refletem o storage.

### 3.1 Classificacao canonica (valores do schema de referencia)

- `doc_domain`: Administrativo | Clinico | Misto
- `doc_source`: Ficha | Prontuario | Portal | Importacao | Email
- `doc_origin` (coluna `origin_module`): Ficha_Documentos | Ficha_Administrativo | Ficha_Financeiro | Prontuario | PortalPaciente | Importacao | Outro
- `doc_status`: Ativo | Substituido | Arquivado | Rascunho
- `doc_status_enum` (coluna `document_status`): Ativo | Substituido | Arquivado | Rascunho | ExcluidoLogicamente

### 3.2 `doc_type` e `category`

- `doc_type` e armazenado em `public.patient_documents.subcategory` (valores canonicos):
  - clinico: `receita`, `exame`, `laudo`, `evolucao`, `prescricao`
  - administrativo: `contrato`, `autorizacao`
  - financeiro: `fatura`, `comprovante`
  - identidade: `identidade`
  - consentimento: `consentimento`
  - juridico/operadora: `juridico_operadora`
  - outros: `outros`
- `category` (lista minima recomendada): identity | legal | financial | clinical | consent | other
- Mapeamento recomendado (referencia externa `doc_category` -> GED `category`):
  - Identificacao -> identity
  - Juridico -> legal
  - Financeiro -> financial
  - Clinico -> clinical
  - Consentimento -> consent
  - Outros -> other
- Uso opcional em importacao; nao implica migracao/backfill.

### 3.3 Pastas persistidas (estrutura GED)

- Pastas sao gravadas em `public.patient_ged_folders` e sao exclusivas por paciente/tenant.
- `path` e materializado por IDs (nao por nomes) e nao influencia o storage.
- Pastas sistema (root level, `is_system=true`): Clinico, Administrativo, Financeiro, Juridico, Comunicacao.
- Regras:
  - Pastas sistema nao podem ser deletadas ou movidas.
  - Renomear e permitido apenas para pastas nao-sistema.
  - Subpastas livres podem ser criadas sob qualquer pasta (inclusive sistema).

### 3.4 Views/atalhos (filtros, nao pastas)

- Arquivados
- Needs review
- Importados em massa
- Links seguros
- Artefatos
- Solicitacoes de original

Estas views sao filtros e nao alteram `folder_id` nem o storage.

### 3.5 Naming e labels (sem PHI)

- `storage_path` e `artifact_path` nunca devem conter nomes ou dados sensiveis.
- Naming padrao por IDs (ver secao 10).
- Nome exibido (UI): `patient_documents.title` (curado, sem PHI quando possivel).
- Nome original: `patient_documents.original_file_name` preservado apenas para referencia.

## 4) Estrutura de UI (Explorer/OneDrive)

Referencia visual obrigatoria: [html/ged-viewer-dynamics.html](../../../html/ged-viewer-dynamics.html).

### Componentes principais

1. **Arvore de pastas (esquerda)**: atalhos sistema + arvore persistida (expand/collapse estavel).
2. **Breadcrumbs**: caminho da pasta atual.
3. **Command bar**: Novo > Pasta, Upload rapido, Importar ZIP, Centro de Custodia, Arquivar, Solicitar originais.
4. **Busca**: input + botao Buscar + toggle "Buscar em todo GED".
5. **Lista de arquivos**: tabela estilo OneDrive, com selecao em massa.
6. **Barra de acoes em massa**: aparece quando ha selecao (Arquivar, Solicitar originais).
7. **Viewer protegido (modal)**: preview com banner e watermark overlay.
8. **Centro de Custodia**: subview/modal com contadores + requisicoes mae + auditoria.

Tabela de campos essenciais (visivel na UI):

| Area | Campo (label UI) | Coluna | Tipo PG | Obrigatorio | Observacoes |
| --- | --- | --- | --- | --- | --- |
| Lista GED | Nome | `patient_documents.title` | text | Sim | Nome amigavel. |
| Lista GED | Tipo | `patient_documents.subcategory` | text | Sim | `doc_type` canonico. |
| Lista GED | Dominio | `patient_documents.domain_type` | text | Sim | `doc_domain`. |
| Lista GED | Status | `patient_documents.document_status` | enum | Sim | Exibe `Ativo/Arquivado/Rascunho`. |
| Lista GED | Modificado em | `patient_documents.updated_at` | timestamptz | Sim | Ordenacao. |
| Busca global | Caminho | `patient_ged_folders.path` + nomes | text | Nao | Exibido apenas em "Buscar em todo GED". |
| Detalhes | Pasta | `patient_documents.folder_id` | uuid | Nao | Vinculo com a pasta atual. |
| Viewer | Banner de custodia | N/A | N/A | Sim | Texto: "Documento em custodia Conecta Care". |
| Viewer | Watermark overlay | N/A | N/A | Sim | user_name, user_role, viewed_at, tenant_id, patient_id. |
| Impressao | Artefato | `document_artifacts.*` | N/A | Sim | Copia exata do impresso. |
| Original | Link seguro | `document_secure_links.*` | N/A | Sim | Expiracao + download unico. |

## 5) Fluxos end-to-end

### 5.1 Upload/ingestao

1. Validar MIME/size por categoria e taxonomia obrigatoria.
2. Se for DICOM (nivel 1), registrar como download-only e custodiar o binario sem viewer.
3. Persistir o binario original em storage privado (imutavel) com path por IDs.
4. Calcular `file_hash` (SHA-256) do binario original.
5. Chamar RPC `create_ged_document_bundle` para inserir, em transacao unica:
   - `patient_documents` (com `folder_id` da pasta atual)
   - `document_time_stamps` (SERPRO)
   - `patient_document_logs` (acao `upload`)
6. Se a RPC falhar, remover o arquivo do storage (sem doc fantasma).
7. DEV sem sandbox SERPRO: gravar receipt mockado no mesmo schema (fonte `server-time`).

### 5.2 Pastas (create/rename/move/delete)

1. Criar pasta: inserir `patient_ged_folders` com `parent_id`, `name`, `name_norm`, `sort_order`.
2. Renomear: permitido apenas em pastas nao-sistema.
3. Mover: RPC `move_ged_folder(folder_id, new_parent_id)` atualiza `parent_id`, `path` e `depth` da subarvore.
4. Delete: somente pastas nao-sistema e sem documentos/filhos (soft delete).

### 5.3 Busca e listagem

1. Padrao: lista documentos da pasta atual + subpastas (por `folder_id` e subarvore).
2. Toggle "Buscar em todo GED": ignora pasta atual e busca em toda a biblioteca.
3. Busca global exibe coluna "Caminho" e nao altera a pasta selecionada.

### 5.4 Visualizacao protegida

1. Viewer exibe banner "Documento em custodia Conecta Care".
2. Watermark overlay discreta (sem alterar binario): user_name, user_role, viewed_at, tenant_id, patient_id.
3. Toggle DEV "Habilitar captura/print (DEV)" pode desativar overlay apenas em ambiente DEV.
4. Registrar evento `view` em `patient_document_logs`.

### 5.5 Impressao e download derivado

1. Gerar artefato de impressao (PDF render) com watermark e cabecalho em todas as paginas.
2. Registrar evento `print` em `patient_document_logs`.
3. Criar registro em `document_artifacts` e armazenar copia exata do impresso.
4. Abrir preview do artefato (sem forcar download).
5. Download de artefato usa endpoint dedicado para logar IP/UA e redirecionar para URL assinada.
6. Derivado nunca vira versao em `patient_documents`.

### 5.6 Solicitar original (single e em massa)

1. Selecionar documentos e criar `ged_original_requests` (requisicao mae).
2. Para cada documento, criar `ged_original_request_items` e gerar `document_secure_links`.
3. Registrar eventos `request_original` e `grant_original` com `request_id` e `link_id`.
4. Ao consumir link: registrar `access_original` + `consume_original`, com IP/UA no servidor.
5. Requisicao mae evolui de status conforme os itens (open/in_progress/completed/expired/revoked).

### 5.7 Centro de Custodia

1. Exibir contadores (links ativos/usados/expirados/revogados, artefatos gerados, downloads).
2. Listar requisicoes mae com filtros (dominio/tipo/status).
3. Accordion por requisicao com auditoria detalhada por item (timestamps + IP/UA).

### 5.8 Importacao em massa (onboarding ZIP)

1. Importacao no GED do paciente e sempre single-paciente.
2. Upload de ZIP para bucket privado (namespace `imports/{job_id}/`).
3. Manifest opcional (`manifest.json` ou `manifest.csv`).
4. Sem manifest: fallback por estrutura de pastas do ZIP.
5. Para cada arquivo: hash + TSA + log, mesmo quando cair em `needs_review`.
6. Itens sem taxonomia valida vao para `needs_review` (sem bloquear o job).

## 6) Regras duras (nao negociaveis)

- Nunca sobrescrever binarios originais.
- Derivados (impressao/export) nunca viram versoes.
- Toda acao gera log com usuario, timestamp e contexto.
- Original so via link seguro autenticado com expiracao e download unico.
- Pastas sao persistidas no banco; storage nao reflete estrutura de pastas.
- Arquivar apenas muda status; documento permanece na mesma pasta e aparece em "Arquivados".
- Busca padrao respeita pasta atual + subpastas; busca global ignora pasta.

## 7) Modelo de Dados (Banco)

### 7.1 `public.patient_documents`

Tabela canonica de documentos do paciente.

#### Identificacao e arquivo

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id` (RLS). |
| `patient_id` | uuid | Sim | — | FK -> `patients.id`. |
| `folder_id` | uuid | Nao | NULL | FK -> `patient_ged_folders.id` (pasta atual). |
| `title` | text | Sim | — | Titulo exibido. |
| `description` | text | Nao | NULL | Descricao livre. |
| `file_name` | text | Sim | — | Nome interno. |
| `file_path` | text | Nao | NULL | Caminho externo (importacao). |
| `storage_path` | text | Sim | — | Path em storage privado (por IDs). |
| `storage_provider` | storage_provider_enum | Nao | `Supabase` | Provedor atual. |
| `original_file_name` | text | Nao | NULL | Nome original do arquivo. |
| `file_name_original` | text | Nao | NULL | Nome original (importacao). |
| `file_size_bytes` | bigint | Nao | NULL | Tamanho. |
| `mime_type` | text | Nao | NULL | MIME. |
| `file_hash` | text | Sim | — | SHA-256 do binario original. |
| `file_extension` | text | Nao | NULL | Extensao (importacao). |
| `extension` | text | Nao | NULL | Extensao (importacao). |
| `uploaded_at` | timestamptz | Sim | `now()` | Entrada do arquivo. |
| `uploaded_by` | uuid | Nao | NULL | FK -> `auth.users.id`. |

#### Taxonomia e origem

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `category` | text | Sim | — | Lista minima (identity/legal/financial/clinical/consent/other). |
| `subcategory` | text | Sim | — | `doc_type` canonico. |
| `domain_type` | doc_domain | Sim | `Administrativo` | Valores do schema de referencia. |
| `source_module` | doc_source | Sim | `Ficha` | Valores do schema de referencia. |
| `origin_module` | doc_origin_enum | Sim | `Ficha_Documentos` | Valores do schema de referencia. |
| `document_status` | doc_status_enum | Sim | `Ativo` | Status preferencial. |
| `status` | doc_status | Sim | `Ativo` | Status do schema de referencia. |
| `tags` | text[] | Nao | NULL | Tags livres. |
| `internal_notes` | text | Nao | NULL | Notas internas. |
| `external_ref` | text | Nao | NULL | Referencia externa. |

#### Versionamento e visibilidade

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `version` | integer | Sim | `1` | Incremental. |
| `previous_document_id` | uuid | Nao | NULL | FK -> `patient_documents.id`. |
| `is_visible_clinical` | boolean | Sim | `true` | Campo existente (clinico). |
| `is_visible_admin` | boolean | Sim | `true` | Campo existente (admin). |
| `clinical_visible` | boolean | Sim | `true` | Visibilidade clinica. |
| `admin_fin_visible` | boolean | Sim | `true` | Visibilidade administrativa/financeira. |
| `is_confidential` | boolean | Sim | `false` | Documento sensivel. |
| `min_access_role` | text | Sim | `Basico` | Role minima conforme politica atual do modulo. |
| `min_role_level` | text | Nao | NULL | Nivel minimo (campo existente). |
| `is_verified` | boolean | Sim | `false` | Validacao em abas especificas. |
| `verified_at` | timestamptz | Nao | NULL | Timestamp de validacao. |
| `verified_by` | uuid | Nao | NULL | FK -> `auth.users.id`. |
| `expires_at` | date | Nao | NULL | Data de expiracao. |

Regra de versao:

- Cada nova versao do original gera um novo registro em `patient_documents` (append-only), apontando para `previous_document_id`.

#### Relacoes de dominio

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `contract_id` | text | Nao | NULL | Contrato. |
| `admin_contract_id` | text | Nao | NULL | Contrato admin. |
| `financial_record_id` | uuid | Nao | NULL | FK logica (campo existente). |
| `finance_entry_id` | uuid | Nao | NULL | FK -> `financial_ledger_entries.id`. |
| `clinical_event_id` | uuid | Nao | NULL | Evento clinico. |
| `clinical_visit_id` | uuid | Nao | NULL | Visita clinica. |
| `clinical_evolution_id` | uuid | Nao | NULL | Evolucao clinica. |
| `prescription_id` | uuid | Nao | NULL | Prescricao. |
| `related_object_id` | uuid | Nao | NULL | Referencia generica. |

#### Assinatura

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `signature_type` | signature_type_enum | Nao | `Nenhuma` | Enum existente. |
| `signature_date` | timestamptz | Nao | NULL | Data da assinatura. |
| `signature_summary` | text | Nao | NULL | Resumo da assinatura. |
| `external_signature_id` | text | Nao | NULL | ID do provedor. |
| `public_notes` | text | Nao | NULL | Notas publicas. |
| `signed_at` | timestamptz | Nao | NULL | Timestamp de assinatura. |
| `signers_summary` | text | Nao | NULL | Resumo de signatarios. |

#### Auditoria e soft delete

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |
| `updated_at` | timestamptz | Sim | `now()` | Auditoria. |
| `created_by` | uuid | Nao | NULL | FK -> `auth.users.id`. |
| `last_updated_by` | uuid | Nao | NULL | FK -> `auth.users.id`. |
| `last_updated_at` | timestamptz | Sim | `now()` | Auditoria. |
| `deleted_at` | timestamptz | Nao | NULL | Soft delete. |
| `deleted_by` | uuid | Nao | NULL | FK -> `auth.users.id`. |

### 7.2 `public.patient_ged_folders`

Pastas persistidas do GED.

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `patient_id` | uuid | Sim | — | FK -> `patients.id`. |
| `parent_id` | uuid | Nao | NULL | FK -> `patient_ged_folders.id`. |
| `name` | text | Sim | — | Nome exibido. |
| `name_norm` | text | Sim | — | Lowercase para unicidade. |
| `path` | text | Sim | — | Materialized path por IDs. |
| `depth` | integer | Sim | `0` | Nivel na arvore. |
| `is_system` | boolean | Sim | `false` | Pastas sistema nao deletaveis. |
| `sort_order` | integer | Nao | NULL | Ordenacao opcional. |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |
| `updated_at` | timestamptz | Sim | `now()` | Auditoria. |
| `deleted_at` | timestamptz | Nao | NULL | Soft delete. |

### 7.3 `public.patient_document_logs`

Auditoria de eventos do GED.

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `document_id` | uuid | Sim | — | FK -> `patient_documents.id`. |
| `action` | text | Sim | — | upload/view/print/archive/request_original/grant_original/access_original/consume_original/download_artifact. |
| `happened_at` | timestamptz | Sim | `now()` | Timestamp do evento. |
| `user_id` | uuid | Nao | NULL | FK -> `auth.users.id`. |
| `details` | jsonb | Nao | NULL | Payload minimo (ver secao 13). |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |

### 7.4 `public.document_artifacts`

Artefatos canonicos de impressao/export (copia exata do impresso).

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `patient_id` | uuid | Sim | — | FK -> `patients.id`. |
| `document_id` | uuid | Sim | — | FK -> `patient_documents.id`. |
| `document_log_id` | uuid | Sim | — | FK -> `patient_document_logs.id`. |
| `artifact_type` | text | Sim | `print` | print/export/render. |
| `storage_path` | text | Sim | — | Namespace de artefatos. |
| `file_hash` | text | Sim | — | SHA-256 do artefato. |
| `file_size_bytes` | bigint | Nao | NULL | Tamanho. |
| `mime_type` | text | Nao | NULL | MIME. |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |
| `created_by` | uuid | Nao | NULL | FK -> `auth.users.id`. |
| `deleted_at` | timestamptz | Nao | NULL | Soft delete. |

### 7.5 `public.document_time_stamps`

Tabela canonica de receipts do carimbo do tempo (SERPRO).

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `document_id` | uuid | Sim | — | FK -> `patient_documents.id`. |
| `document_hash` | text | Sim | — | Hash do documento carimbado. |
| `provider` | text | Sim | `SERPRO` | ACT ICP-Brasil. |
| `receipt_payload` | jsonb | Sim | — | Payload do receipt (schema SERPRO). |
| `issued_at` | timestamptz | Sim | — | Data/hora do carimbo. |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |
| `created_by` | uuid | Nao | NULL | FK -> `auth.users.id`. |
| `deleted_at` | timestamptz | Nao | NULL | Soft delete. |

Regras de provider:

- Interface unica `TimestampProvider`.
- SERPRO e o provedor oficial.

### 7.6 `public.document_secure_links`

Links seguros para acesso ao original.

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `document_id` | uuid | Sim | — | FK -> `patient_documents.id`. |
| `token_hash` | text | Sim | — | Hash do token (nao armazenar o token puro). |
| `expires_at` | timestamptz | Sim | — | Expiracao do link. |
| `max_downloads` | integer | Sim | `1` | Download unico. |
| `downloads_count` | integer | Sim | `0` | Contador de downloads. |
| `requested_by` | uuid | Nao | NULL | Usuario solicitante. |
| `requested_at` | timestamptz | Nao | NULL | Data da solicitacao. |
| `issued_by` | uuid | Nao | NULL | Usuario que liberou. |
| `issued_at` | timestamptz | Nao | NULL | Data de emissao. |
| `last_accessed_at` | timestamptz | Nao | NULL | Ultimo acesso. |
| `consumed_at` | timestamptz | Nao | NULL | Consumo do download unico. |
| `consumed_by` | uuid | Nao | NULL | Usuario que consumiu. |
| `revoked_at` | timestamptz | Nao | NULL | Revogacao. |
| `revoked_by` | uuid | Nao | NULL | Usuario que revogou. |
| `metadata` | jsonb | Nao | NULL | IP, user_agent, session_id (request/consume). |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |
| `deleted_at` | timestamptz | Nao | NULL | Soft delete. |

### 7.7 `public.ged_original_requests`

Requisicoes mae de originais (em massa ou single).

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `patient_id` | uuid | Sim | — | FK -> `patients.id`. |
| `requested_by_user_id` | uuid | Sim | — | FK -> `auth.users.id`. |
| `status` | text | Sim | `open` | open/in_progress/completed/expired/revoked. |
| `notes` | text | Nao | NULL | Observacoes internas. |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |
| `updated_at` | timestamptz | Sim | `now()` | Auditoria. |
| `deleted_at` | timestamptz | Nao | NULL | Soft delete. |

### 7.8 `public.ged_original_request_items`

Itens da requisicao mae.

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `request_id` | uuid | Sim | — | FK -> `ged_original_requests.id`. |
| `document_id` | uuid | Sim | — | FK -> `patient_documents.id`. |
| `secure_link_id` | uuid | Nao | NULL | FK -> `document_secure_links.id`. |
| `status` | text | Sim | `open` | open/issued/consumed/expired/revoked. |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |
| `updated_at` | timestamptz | Sim | `now()` | Auditoria. |
| `deleted_at` | timestamptz | Nao | NULL | Soft delete. |

### 7.9 `public.document_import_jobs`

Jobs de importacao em massa (ZIP/onboarding).

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `patient_id` | uuid | Sim | — | Sempre definido no GED do paciente. |
| `status` | text | Sim | `queued` | queued/processing/completed/completed_with_errors/failed. |
| `source` | text | Sim | `bulk_import` | Origem do job. |
| `manifest_type` | text | Nao | NULL | json/csv/none. |
| `manifest_path` | text | Nao | NULL | Caminho do manifest no ZIP. |
| `zip_storage_path` | text | Sim | — | Path do ZIP no storage privado. |
| `total_items` | integer | Sim | `0` | Total de arquivos detectados. |
| `processed_items` | integer | Sim | `0` | Itens processados. |
| `failed_items` | integer | Sim | `0` | Itens com falha. |
| `needs_review_items` | integer | Sim | `0` | Itens sem taxonomia valida. |
| `started_at` | timestamptz | Nao | NULL | Inicio do processamento. |
| `finished_at` | timestamptz | Nao | NULL | Fim do processamento. |
| `created_by` | uuid | Nao | NULL | FK -> `auth.users.id`. |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |
| `metadata` | jsonb | Nao | NULL | Configuracoes (limites/override). |
| `deleted_at` | timestamptz | Nao | NULL | Soft delete. |

### 7.10 `public.document_import_job_items`

Itens individuais do job (1 arquivo = 1 item).

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `job_id` | uuid | Sim | — | FK -> `document_import_jobs.id`. |
| `patient_id` | uuid | Nao | NULL | Deve coincidir com o paciente do job. |
| `file_path` | text | Sim | — | Caminho no ZIP (relativo). |
| `original_file_name` | text | Nao | NULL | Nome original do arquivo. |
| `file_size_bytes` | bigint | Nao | NULL | Tamanho. |
| `mime_type` | text | Nao | NULL | MIME detectado. |
| `checksum_sha256` | text | Nao | NULL | Hash do arquivo. |
| `status` | text | Sim | `queued` | queued/processing/imported/needs_review/failed. |
| `document_id` | uuid | Nao | NULL | FK -> `patient_documents.id` quando criado. |
| `attempts` | integer | Sim | `0` | Tentativas de processamento. |
| `error_code` | text | Nao | NULL | Codigo curto do erro. |
| `error_detail` | text | Nao | NULL | Descricao do erro. |
| `manifest_payload` | jsonb | Nao | NULL | Linha original do manifest. |
| `inferred_taxonomy` | jsonb | Nao | NULL | Taxonomia inferida no fallback. |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |
| `processed_at` | timestamptz | Nao | NULL | Timestamp final do item. |
| `deleted_at` | timestamptz | Nao | NULL | Soft delete. |

### 7.11 Storage (infra)

- `storage.buckets` e `storage.objects` (Supabase Storage).
- Bucket privado (GED) com limites por categoria e MIME.

### 7.12 Indices e constraints

- `patient_documents`: unique `(tenant_id, patient_id, id)`; index em `folder_id`, `category`, `document_status`, `origin_module`, `uploaded_at`.
- `patient_ged_folders`: unique `(tenant_id, patient_id, parent_id, name_norm)`; index em `(tenant_id, patient_id, path)` e `(tenant_id, patient_id, deleted_at)`.
- `patient_document_logs`: index em `(document_id, happened_at)`.
- `document_artifacts`: unique `(document_log_id)`; index em `(document_id, created_at)`.
- `document_time_stamps`: unique `(document_id)`.
- `document_secure_links`: unique `(token_hash)`; index em `(document_id, expires_at)`.
- `ged_original_requests`: index em `(tenant_id, patient_id, status, created_at)`.
- `ged_original_request_items`: index em `(request_id, status)`.
- `document_import_jobs`: index em `(tenant_id, patient_id, status)`; unique `(tenant_id, id)`.
- `document_import_job_items`: index em `(job_id, status)`; index em `(tenant_id, patient_id)`.

### 7.13 Funcoes / RPCs

- `move_ged_folder(folder_id, new_parent_id)` → atualiza `parent_id`, `path` e `depth` da subarvore.
- `create_ged_document_bundle(...)` → transacao unica para `patient_documents` + `document_time_stamps` + `patient_document_logs`.
- `create_ged_artifact_bundle(...)` → transacao unica para `document_artifacts` + `patient_document_logs`.

## 8) Operacoes / Actions do App

- `ensurePatientGedFolders(patientId)` -> garante pastas sistema.
- `createGedFolder(parentId, name)` -> cria pasta.
- `renameGedFolder(folderId, name)` -> renomeia (nao-sistema).
- `moveGedFolder(folderId, newParentId)` -> move subarvore.
- `deleteGedFolder(folderId)` -> soft delete (nao-sistema, vazio).
- `listGedDocuments(patientId, folderId, filters, searchScope)` -> lista por pasta/subpastas ou GED inteiro.
- `archiveGedDocuments(documentIds)` -> arquiva em massa.
- `createOriginalRequest(patientId, documentIds)` -> cria requisicao mae + itens.
- `listOriginalRequests(patientId, filters)` -> centro de custodia.
- `uploadGedDocument(patientId, payload, file)` -> storage original + bundle (hash + TSA + log).
- `printGedDocument(documentId)` -> gera artifact + log.
- `downloadGedArtifact(artifactId)` -> endpoint server-side com log IP/UA + redirect.
- `createSecureLink(documentId)` / `consumeSecureLink(token)` / `revokeSecureLink(linkId)`.
- `startBulkImport(patientId, zipFile, manifest)` -> cria job e registra eventos.
- `getBulkImportJob(jobId)` -> status e metricas do job.
- `listBulkImportItems(jobId, filters)` -> itens com status/erros.
- `retryBulkImportItem(itemId)` -> reprocessa item.

## 9) Seguranca (RLS / Policies)

- RLS habilitado em `patient_documents`, `patient_ged_folders`, `patient_document_logs`, `document_artifacts`, `document_time_stamps`, `document_secure_links`, `ged_original_requests`, `ged_original_request_items`, `document_import_jobs`, `document_import_job_items`.
- SELECT padrao: `tenant_id = app_private.current_tenant_id()`.
- UPDATE/INSERT: restrito ao tenant, respeitando `min_access_role` e `is_confidential` conforme as regras atuais do modulo.
- Acesso ao original: qualquer usuario autenticado do tenant com acesso ao paciente (mesma guarda das demais abas).
- Download do original sempre via `document_secure_links` (stream controlado e contagem de downloads).
- Download de artefato passa por endpoint autenticado para logar IP/UA.

## 10) Storage e chaves (Supabase)

- Bucket privado GED (sem PHI na key).
- `storage_path` por IDs (sem pastas GED):
  - `tenant/{tenant_id}/patient/{patient_id}/doc/{document_id}/original/{file_id}`
- Artefatos:
  - `tenant/{tenant_id}/patient/{patient_id}/doc/{document_id}/artifacts/{artifact_id}`
- Imports:
  - `tenant/{tenant_id}/imports/{job_id}/source/{zip_object_id}`
  - `tenant/{tenant_id}/imports/{job_id}/items/{item_id}/{file_id}`
- Acesso a arquivos sempre via signed URL/stream autenticado, com auditoria em `patient_document_logs`.
- Criptografia em repouso: Supabase (SSE gerenciada).
- Interface `StorageProvider` para migracao de provedor sem alterar schema.

## 11) Mascaras e validacoes

- `file_hash`: SHA-256 obrigatorio.
- `token_hash`: SHA-256 do token + pepper do servidor.
- TTL padrao: Producao 72h (configuravel por tenant); DEV 7 dias.
- Formatos (viewer protegido):
  - PDF, JPG, PNG (max 25 MB por arquivo).
- Formatos (download-only):
  - DICOM `.dcm` nivel 1 (custodia apenas, max 250 MB por arquivo).
  - DOCX, XLSX, CSV, TXT (max 25 MB por arquivo).
- ZIP (somente importacao em massa):
  - Max 2 GB por ZIP e 10.000 arquivos por job (configuravel por tenant).
  - Cada arquivo respeita o limite individual; falhas viram `failed` no item.
- DICOM nivel 1: custodiar e permitir download; se houver PDF/laudo, tratar como documento separado com `doc_type` `laudo`.
- `doc_type` deve seguir a lista canonica da secao 3.2.

### 11.1 Manifest de importacao (JSON/CSV)

Regras gerais:

- GED do paciente opera sempre em contexto single-paciente (`patient_id` do job obrigatorio).
- `manifest.json` ou `manifest.csv` na raiz e opcional.
- `file_path` deve apontar para um arquivo dentro do ZIP.
- `patient_id` no manifest, quando presente, deve coincidir com o paciente do job.
- Campos ausentes ou invalidos vao para `needs_review`.

Campos obrigatorios (por item):

- `file_path`
- `title`
- `category` (identity/legal/financial/clinical/consent/other)
- `doc_type` (valores canonicos de `subcategory`)
- `doc_domain` (Administrativo/Clinico/Misto)
- `doc_source` (Ficha/Prontuario/Portal/Importacao/Email)
- `doc_origin` (Ficha_Documentos/Ficha_Administrativo/Ficha_Financeiro/Prontuario/PortalPaciente/Importacao/Outro)

Campos opcionais:

- `description`
- `tags`

### 11.2 Fallback por estrutura de pastas (ZIP)

- Se nao houver manifest, o sistema infere `doc_domain/doc_type` a partir do caminho dentro do ZIP.
- Esta estrutura e somente do ZIP (nao confundir com pastas GED persistidas).

## 12) Retencao

- Retencao default: 20 anos por tenant (configuravel).
- Excecoes por categoria quando definido em politica do tenant.

## 13) Observabilidade e auditoria

Eventos minimos (logs em `patient_document_logs`):

- `upload`, `view`, `print`, `download_artifact`.
- `request_original`, `grant_original`, `access_original`, `consume_original`, `revoke_link`.
- `archive`.

Campos minimos em `details`:

- `file_hash`, `storage_path`, `artifact_id`, `secure_link_id`, `request_id`.
- `ip` e `user_agent` nos eventos de consumo (server-side).

## 14) Definicao de pronto (DoD)

- GED disponivel como pagina dedicada (`/pacientes/{id}/ged`) e CTA na aba antiga.
- Pastas persistidas e operaveis (create/rename/move/delete) com pastas sistema protegidas.
- Busca por pasta + subpastas e busca global com coluna Caminho.
- Selecoes em massa com barra de acoes (Arquivar, Solicitar originais).
- Centro de Custodia com contadores e requisicoes mae auditaveis.
- Impressao e download sempre via artefato derivado com cabecalho + watermark.
- Original somente via secure link autenticado e auditado.

## 15) Referencias externas (nao implementadas)

- Snapshot legado (Conecta Care 2025-11-29) e schema antigo sao referencia externa.
- Importacao multi-paciente e orquestracao cross-tenant sao escopos externos ao GED do paciente.
