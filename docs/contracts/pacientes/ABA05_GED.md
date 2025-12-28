# Contrato da Aba: GED (Gestao Eletronica de Documentos)

## 0) Metadados

- Modulo: Pacientes
- Aba: ABA05 — GED (Gestao Eletronica de Documentos)
- Versao: 1.0.0
- Status: Aprovado
- Ultima atualizacao: 2025-12-27
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

- Centralizar a custodia de arquivos do paciente (GED) com hash, carimbo do tempo, logs e controle de acesso.
- Exibir documentos via viewer protegido (watermark overlay) e imprimir apenas derivados com evidencias.
- Suportar acesso ao original somente via link seguro, autenticado, com expiracao e download unico.
- Garantir onboarding enterprise com importacao em massa (ZIP + manifest + fallback) sem bloquear o fluxo.

## 2) Escopo

**IN (GED):**

- Armazenamento do original imutavel com SHA-256, timestamp de entrada e trilha completa de eventos.
- Taxonomia enterprise (doc_domain, doc_type, doc_source, doc_origin, doc_status) + pastas virtuais.
- Viewer protegido (overlay), impressao derivada, artifacts, TSA SERPRO e links seguros.
- Importacao em massa (onboarding) via ZIP com manifest + fallback e fila "Needs review".
- RLS, soft delete e auditoria detalhada.

**OUT:**

- Validacoes/aprovacoes de dominio (CPF, laudos, etc.) — ficam nas abas especificas.
- Geracao clinica (receitas, laudos) — origem nos modulos de prontuario.

## 3) Taxonomia enterprise (classificacao + views)

Taxonomia = classificacao canonica + pastas virtuais (views) derivadas.

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

### 3.3 Pastas virtuais (views)

- Clinico: Receitas, Exames, Laudos, Evolucao
- Administrativo: Contratos, Autorizacoes
- Financeiro: Faturas, Comprovantes
- Identidade
- Consentimentos
- Juridico/Operadora
- Nao classificado (pendente de taxonomia)
- Importados em massa (entrada via ZIP/onboarding)
- Outros

### 3.4 Naming e labels (sem PHI)

- `storage_path` e `artifact_path` nunca devem conter nomes ou dados sensiveis.
- Naming padrao por IDs (ver secao 10).
- Nome exibido (UI): `patient_documents.title` (curado, sem PHI quando possivel).
- Nome original: `patient_documents.original_file_name` preservado apenas para referencia.

## 4) Estrutura de UI (Cards e Campos)

Referencia visual obrigatoria: [html/ged-viewer-dynamics.html](../../../html/ged-viewer-dynamics.html).

### Cards principais

1. **Biblioteca GED**: lista por taxonomia, busca, filtros e status.
2. **Detalhes do Documento**: metadados, taxonomia, status e origem.
3. **Viewer protegido**: banner + watermark overlay + controles de zoom/paginacao.
4. **Impressao & Artefatos**: historico de impressoes e evidencias.
5. **Link seguro do original**: solicitar, liberar, revogar e acompanhar consumo.
6. **Auditoria**: timeline completa de eventos.
7. **Importacao em massa**: jobs, progresso, erros e fila "Needs review".

Tabela de campos essenciais (visivel na UI):

| Card | Campo (label UI) | Coluna | Tipo PG | Obrigatorio | Observacoes |
| --- | --- | --- | --- | --- | --- |
| Biblioteca GED | Titulo | `patient_documents.title` | text | Sim | Nome amigavel do documento. |
| Biblioteca GED | Categoria | `patient_documents.category` | text | Sim | Lista minima (identity/legal/financial/clinical/consent/other). |
| Biblioteca GED | Tipo (doc_type) | `patient_documents.subcategory` | text | Sim | Valores canonicos da secao 3.2. |
| Biblioteca GED | Status | `patient_documents.document_status` | doc_status_enum | Sim | Status preferencial para filtros. |
| Detalhes | Origem (doc_origin) | `patient_documents.origin_module` | doc_origin_enum | Sim | Origem do documento. |
| Detalhes | Fonte (doc_source) | `patient_documents.source_module` | doc_source | Sim | Canal de entrada. |
| Detalhes | Hash original | `patient_documents.file_hash` | text | Sim | SHA-256 do binario original. |
| Viewer | Banner de custodia | N/A | N/A | Sim | Texto: "Documento em custodia Conecta Care". |
| Viewer | Watermark overlay | N/A | N/A | Sim | user_name, user_role, viewed_at, tenant_id, patient_id. |
| Impressao | Artefato gerado | `document_artifacts.*` | N/A | Sim | Copia exata do impresso. |
| Original | Link seguro | `document_secure_links.*` | N/A | Sim | Expiracao + download unico. |

## 5) Fluxos end-to-end

### 5.1 Upload/ingestao

1. Validar MIME/size por categoria e taxonomia obrigatoria.
2. Se for DICOM (nivel 1), registrar como download-only e custodiar o binario sem viewer.
3. Persistir o binario original em storage privado (imutavel).
4. Calcular `file_hash` (SHA-256) do binario original.
5. Registrar `uploaded_at` e metadados em `patient_documents`.
6. Solicitar carimbo do tempo SERPRO e registrar receipt em `document_time_stamps`.
   - DEV sem sandbox SERPRO: gravar receipt mockado no mesmo schema (fonte `server-time`).
   - DEV com sandbox SERPRO: usar provider real.
7. Registrar evento `upload` em `patient_document_logs`.

### 5.2 Visualizacao protegida

1. Viewer exibe banner "Documento em custodia Conecta Care".
2. Watermark overlay discreta (sem alterar binario e sem prejudicar leitura): user_name, user_role, viewed_at, tenant_id, patient_id.
3. Toggle DEV "Habilitar captura/print (DEV)" pode desativar overlay apenas em ambiente DEV.
4. Registrar evento `view` em `patient_document_logs`.

### 5.3 Impressao derivada

1. Gerar derivado de impressao (PDF render) com watermark/rodape.
2. Registrar evento `print` em `patient_document_logs`.
3. Criar registro em `document_artifacts` e armazenar copia exata do impresso.
4. Derivado nunca vira versao em `patient_documents`.

### 5.4 Ver/Solicitar original

1. Usuario solicita original (acao `request_original`).
2. Sistema cria `document_secure_links` com `token_hash`, `expires_at`, `max_downloads=1`.
3. Link seguro exige autenticacao, expiracao e streaming controlado (download unico).
4. Ao consumir: incrementar `downloads_count`, registrar `consumed_at/consumed_by` e revogar.
5. Registrar eventos `request_original`, `grant_original`, `access_original`, `consume_original`, `revoke_link`.
6. TTL padrao: Producao 72h (configuravel por tenant); DEV 7 dias.

### 5.5 Importacao em massa (onboarding ZIP)

1. Usuario inicia importacao criando `document_import_jobs` para um paciente (ou lote multi-paciente).
2. Upload de ZIP para bucket privado (namespace `imports/{job_id}/`).
3. Sistema valida manifest na raiz:
   - Job multi-paciente (sem `patient_id`): `manifest.json` obrigatorio.
   - Sem `manifest.json` em job multi-paciente, o job falha com erro registrado.
   - Job com `patient_id`: `manifest.json` ou `manifest.csv` opcional; se ausente/invalido, ativa fallback por estrutura de pastas.
4. Para cada arquivo:
   - Validar formato/tamanho.
   - Gerar SHA-256 + carimbo do tempo SERPRO.
   - Criar `patient_documents` (append-only) e `patient_document_logs`.
5. Classificacao:
   - Manifest: usa taxonomia fornecida.
   - Fallback: infere `doc_domain/doc_type` pelo caminho (ver secao 11).
   - Falhas de classificacao vao para status `needs_review`.
   - Mesmo em `needs_review`, registrar ingestao + hash + TSA + log.
6. Job conclui com relatorio: total, importados, needs_review, falhas e erros por item.

## 6) Regras duras (nao negociaveis)

- Nunca sobrescrever binarios originais.
- Derivados (impressao/export) nunca viram versoes.
- Toda acao gera log com usuario e timestamp.
- Original so via link seguro autenticado com expiracao e download unico.
- Todo arquivo importado (inclusive em massa) passa por hash + TSA + log.

## 7) Modelo de Dados (Banco)

### 7.1 `public.patient_documents`

Tabela canonica de documentos do paciente.

#### Identificacao e arquivo

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id` (RLS). |
| `patient_id` | uuid | Sim | — | FK -> `patients.id`. |
| `title` | text | Sim | — | Titulo exibido. |
| `description` | text | Nao | NULL | Descricao livre. |
| `file_name` | text | Sim | — | Nome interno. |
| `file_path` | text | Nao | NULL | Caminho externo (importacao). |
| `storage_path` | text | Sim | — | Path em storage privado. |
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

### 7.2 `public.patient_document_logs`

Auditoria de eventos do GED.

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `document_id` | uuid | Sim | — | FK -> `patient_documents.id`. |
| `action` | text | Sim | — | upload/view/print/request_original/grant_original/access_original/revoke_link. |
| `happened_at` | timestamptz | Sim | `now()` | Timestamp do evento. |
| `user_id` | uuid | Nao | NULL | FK -> `auth.users.id`. |
| `details` | jsonb | Nao | NULL | Payload minimo (ver secao 13). |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |

### 7.3 `public.document_artifacts`

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

### 7.4 `public.document_time_stamps`

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

### 7.5 `public.document_secure_links`

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
| `metadata` | jsonb | Nao | NULL | IP, user_agent, session_id. |
| `created_at` | timestamptz | Sim | `now()` | Auditoria. |
| `deleted_at` | timestamptz | Nao | NULL | Soft delete. |

### 7.6 `public.document_import_jobs`

Jobs de importacao em massa (ZIP/onboarding).

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `patient_id` | uuid | Nao | NULL | Quando importacao for por paciente. |
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

### 7.7 `public.document_import_job_items`

Itens individuais do job (1 arquivo = 1 item).

| Coluna | Tipo | Obrigatorio | Default | Observacoes |
| --- | --- | --- | --- | --- |
| `id` | uuid | Sim | `gen_random_uuid()` | PK. |
| `tenant_id` | uuid | Sim | — | FK -> `tenants.id`. |
| `job_id` | uuid | Sim | — | FK -> `document_import_jobs.id`. |
| `patient_id` | uuid | Nao | NULL | Quando importacao for multi-paciente. |
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

### 7.8 Storage (infra)

- `storage.buckets` e `storage.objects` (Supabase Storage).
- Bucket privado (GED) com limites por categoria e MIME.

### 7.9 Indices e constraints

- `patient_documents`: unique `(tenant_id, patient_id, id)`; index em `category`, `document_status`, `origin_module`, `uploaded_at`.
- `patient_document_logs`: index em `(document_id, happened_at)`.
- `document_artifacts`: unique `(document_log_id)`; index em `(document_id, created_at)`.
- `document_time_stamps`: unique `(document_id)`.
- `document_secure_links`: unique `(token_hash)`; index em `(document_id, expires_at)`.
- `document_import_jobs`: index em `(tenant_id, patient_id, status)`; unique `(tenant_id, id)`.
- `document_import_job_items`: index em `(job_id, status)`; index em `(tenant_id, patient_id)`.

## 8) Operacoes / Actions do App

- `uploadPatientDocument(patientId, payload, file)` -> storage original + hash + TSA + log.
- `getPatientDocuments(patientId, filters)` -> lista por taxonomia e status.
- `getPatientDocumentById(documentId)` -> detalhes + viewer protegido.
- `logDocumentEvent(documentId, action, details)` -> auditoria canonica.
- `printDocument(documentId)` -> gera artifact + log.
- `getDocumentArtifacts(documentId)` -> lista de artifacts.
- `requestOriginalAccess(documentId)` -> cria secure link + log.
- `grantOriginalAccess(documentId)` -> libera link + log.
- `consumeOriginalAccess(documentId)` -> download unico + log.
- `revokeOriginalAccess(documentId)` -> revoga link + log.
- `renewOriginalAccess(documentId)` -> gera novo link + log.
- `stampDocumentTime(documentId)` -> TSA SERPRO + log.
- `startBulkImport(patientId, zipFile, manifest)` -> cria job e registra eventos.
- `getBulkImportJob(jobId)` -> status e metricas do job.
- `listBulkImportItems(jobId, filters)` -> itens com status/erros.
- `retryBulkImportItem(itemId)` -> reprocessa item.

## 9) Seguranca (RLS / Policies)

- RLS habilitado em `patient_documents`, `patient_document_logs`, `document_artifacts`, `document_time_stamps`, `document_secure_links`, `document_import_jobs`, `document_import_job_items`.
- SELECT padrao: `tenant_id = app_private.current_tenant_id()`.
- UPDATE/INSERT: restrito ao tenant, respeitando `min_access_role` e `is_confidential` conforme as regras atuais do modulo.
- Acesso ao original: qualquer usuario autenticado do tenant com acesso ao paciente (mesma guarda das demais abas).
- Download do original sempre via `document_secure_links` (stream controlado e contagem de downloads).

## 10) Storage e chaves (Supabase)

- Bucket privado GED (sem PHI na key).
- `storage_path`: `tenant_id/patient_id/document_id/version_id`.
- Artefatos: `artifacts/{artifact_id}`.
- Imports: `imports/{job_id}/` (ZIP + manifest + itens processados).
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

- Job multi-paciente (sem `patient_id`): `manifest.json` obrigatorio na raiz do ZIP.
- Job com `patient_id`: manifest opcional; quando presente, pode ser `manifest.json` ou `manifest.csv`.
- `file_path` deve apontar para um arquivo dentro do ZIP.
- Para multi-paciente, `patient_id` e obrigatorio em cada item.
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

- `patient_id` (para import multi-paciente)
- `document_status` (Ativo/Substituido/Arquivado/Rascunho/ExcluidoLogicamente)
- `tags` (lista)
- `description`
- `external_ref`
- `issued_at`
- `checksum_sha256` (para validacao previa)

Exemplo JSON:

```json
{
  "items": [
    {
      "file_path": "Clinico/receita_2024-01-10.pdf",
      "title": "Receita — Antibioticoterapia",
      "category": "clinical",
      "doc_type": "receita",
      "doc_domain": "Clinico",
      "doc_source": "Importacao",
      "doc_origin": "Importacao",
      "document_status": "Ativo",
      "tags": ["onboarding", "receita"]
    }
  ]
}
```

Exemplo CSV:

```csv
file_path,title,category,doc_type,doc_domain,doc_source,doc_origin,document_status,patient_id
Clinico/receita_2024-01-10.pdf,Receita — Antibioticoterapia,clinical,receita,Clinico,Importacao,Importacao,Ativo,
```

### 11.2 Fallback por estrutura de pastas (sem manifest)

Quando o manifest nao existe ou falha, o GED tenta inferir:

- `/{doc_domain}/{doc_type}/{yyyy-mm-dd}/arquivo.ext`
- `/{doc_domain}/{doc_type}/arquivo.ext`

Itens que nao encaixarem vao para `needs_review` com `inferred_taxonomy` vazio.

## 12) Retencao

- Retencao default: 20 anos (configuravel por tenant).
- Excecoes por categoria (padrao):
  - clinical/legal/identity/consent: 20 anos
  - financial: 10 anos
  - other: 5 anos

## 13) Observabilidade e auditoria

Eventos obrigatorios em `patient_document_logs`:

- `upload`, `view`, `print`, `request_original`, `grant_original`, `access_original`, `consume_original`, `revoke_link`.
- `bulk_import_job_created`, `bulk_import_started`, `bulk_import_item_imported`, `bulk_import_item_failed`, `bulk_import_item_needs_review`, `bulk_import_completed`.

Campos minimos em `details`:

- `actor_role`, `origin_module`, `source_module`, `session_id`, `ip`, `user_agent`, `document_hash`.
- Para `print`: `artifact_id`, `artifact_hash`.
- Para links: `secure_link_id`, `expires_at`, `downloads_count`.
- Para importacao: `import_job_id`, `import_item_id`, `error_code`, `error_detail`.

## 14) Definicao de pronto (DoD)

- [ ] Contrato revisado e aprovado.
- [ ] Plano e ADR alinhados ao contrato (sem drift).
- [ ] Indices/READMEs marcando ABA05 como Aprovado.
- [ ] Migrations com tabelas e indices descritos.
- [ ] RLS e policies validadas.
- [ ] Actions e UI conforme fluxos definidos.
- [ ] Viewer protegido e impressao derivada funcionando.
- [ ] TSA SERPRO integrado (mock no DEV sem sandbox).
- [ ] Tests cobrindo hash, TSA, artifacts, secure links.
- [ ] Bulk import com manifest + fallback, fila `needs_review` e relatorio final.

## 15) Referencias externas (nao implementadas)

Esta secao registra apenas referencias externas consultadas; nao ha migracao/backfill neste ciclo.

- `docs/repo_antigo/schema_current.sql` e `db/snapshots_legado/conectacare-2025-11-29.sql` sao referencia externa.
- Estruturas citadas no schema de referencia (`patient_documents`, `patient_document_logs`, `patient_admin_info.chk_*_doc_id`, `patient_addresses.facade_image_url`, `storage.*`) servem apenas para compatibilidade conceitual.
- A importacao em massa (secao 11) cobre onboarding externo sem exigir migracoes ad hoc.
