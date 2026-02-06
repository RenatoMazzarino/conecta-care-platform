# PACIENTES_V1_CANONICO

Status: Canonico (baseado no repo + decisoes finais de auditoria)
Escopo: Abas 01-05 + GED (submodulo) + Aba 07 (Historico & Auditoria)

## 1. Resumo executivo da V1
- Abas 01-04 estao implementadas na ficha do paciente com UI e actions em Supabase, mas sem auditoria unificada; base em `src/app/pacientes/[id]/PatientPageClient.tsx`, `src/components/patient/DadosPessoaisTab.tsx`, `src/components/patient/EnderecoLogisticaTab.tsx`, `src/components/patient/RedeApoioTab.tsx`, `src/components/patient/AdminFinancialTab.tsx`.
- Aba 05 (GED) esta implementada como pagina dedicada com pastas, busca, upload, custodia e importacao em massa; base em `src/app/pacientes/[id]/ged/PatientGedPageClient.tsx`, `src/components/patient/ged/GedExplorerPage.tsx`, `supabase/migrations/202512281200_pacientes_aba05_ged.sql`, `supabase/migrations/202601021430_pacientes_aba05_ged_folders.sql`.
- Aba 07 (Historico & Auditoria) ainda e placeholder; apenas eventos de Aba04 gravam `patient_timeline_events` e sao exibidos no card de integracoes da aba; ver `src/features/pacientes/actions/aba04/recordPatientTimelineEvent.ts`, `src/components/patient/AdminFinancialTab.tsx`.
- Decisao final: ledger unico (um dado so) para auditoria forense e eventos operacionais, usando `patient_timeline_events` como storage fisico e view semantica `event_ledger_events`.
- Decisao final: retencao definida por severidade (high/critical 20 anos, medium 10 anos, low 8 anos) com base legal e purge rolling por job service role.
- Decisao final: GED usa `display_name` sanitizado + `original_filename_enc` e `original_filename_hash` com envelope encryption (KMS/KEK + DEK) em producao.

## 2. Inventario do que existe hoje no repo
### Aba 01 - Dados Pessoais
- Rotas/arquivos principais: `src/app/pacientes/[id]/page.tsx`, `src/app/pacientes/[id]/PatientPageClient.tsx`.
- Componentes-chave: `src/components/patient/DadosPessoaisTab.tsx`, `src/features/pacientes/ui/onboarding/DadosPessoaisOnboardingForm.tsx`.
- Actions/servicos: `src/features/pacientes/actions/getPatientById.ts`, `src/features/pacientes/actions/updatePatientDadosPessoais.ts`.
- Schemas/tipos: `src/features/pacientes/schemas/aba01DadosPessoais.ts`, `src/types/supabase.ts`, `src/types/patient.ts` (legacy).
- Tabelas/migrations/policies: `supabase/migrations/202512130452_base.sql`, `supabase/migrations/202512130453_pacientes_aba01_dados_pessoais.sql`, `supabase/migrations/202512130704_pacientes_aba01_dados_pessoais_extend_legado.sql`, `supabase/migrations/202512131716_pacientes_aba01_align_final.sql`, `supabase/migrations/202512141854_pacientes_email_check_relax.sql`.
- Status: Implementado para edicao; gaps de auditoria e upload de foto (apenas `photo_path` manual).

### Aba 02 - Endereco & Logistica
- Rotas/arquivos principais: `src/app/pacientes/[id]/PatientPageClient.tsx`, `src/app/api/pacientes/aba02/geocode/route.ts`, `src/app/api/pacientes/aba02/risk/route.ts`.
- Componentes-chave: `src/components/patient/EnderecoLogisticaTab.tsx`.
- Actions/servicos: `src/features/pacientes/actions/aba02/getPatientAddresses.ts`, `src/features/pacientes/actions/aba02/savePatientAddress.ts`, `src/features/pacientes/actions/aba02/lookupCepBrasilApi.ts`, `src/features/pacientes/actions/aba02/refreshAddressGeocode.ts`, `src/features/pacientes/actions/aba02/refreshAddressRisk.ts`, `src/features/pacientes/services/geocode/provider.ts`, `src/features/pacientes/services/risk/provider.ts`.
- Schemas/tipos: `src/features/pacientes/schemas/aba02EnderecoLogistica.schema.ts`, `src/types/supabase.ts`.
- Tabelas/migrations/policies: `supabase/migrations/202512201726_pacientes_aba02_integracoes_cep_geocode_risk.sql`.
- Status: Implementado com CEP/geocode/risco; gaps de auditoria unificada e `created_by/updated_by` nao setados nas actions.

### Aba 03 - Rede de Apoio
- Rotas/arquivos principais: `src/app/pacientes/[id]/PatientPageClient.tsx`.
- Componentes-chave: `src/components/patient/RedeApoioTab.tsx`, `src/components/patient/aba03/LegalGuardianWizardModal.tsx`.
- Actions/servicos: `src/features/pacientes/actions/aba03/getRedeApoioSummary.ts`, `src/features/pacientes/actions/aba03/upsertRelatedPerson.ts`, `src/features/pacientes/actions/aba03/upsertCareTeamMember.ts`, `src/features/pacientes/actions/aba03/deleteRelatedPerson.ts`, `src/features/pacientes/actions/aba03/setLegalGuardian.ts`, `src/features/pacientes/actions/aba03/uploadLegalDocument.ts`, `src/features/pacientes/actions/aba03/requestLegalDocAiCheck.ts`, `src/features/pacientes/actions/aba03/approveLegalDocumentAi.ts`, `src/features/pacientes/actions/aba03/approveLegalDocumentManual.ts`, `src/features/pacientes/actions/aba03/saveLegalDocumentManualDraft.ts`, `src/features/pacientes/actions/aba03/createPortalInvite.ts`, `src/features/pacientes/actions/aba03/revokePortalInvite.ts`, `src/features/pacientes/actions/aba03/setPortalAccessLevel.ts`.
- Schemas/tipos: `src/features/pacientes/schemas/aba03RedeApoio.schema.ts`, `src/types/supabase.ts`.
- Tabelas/migrations/policies: `supabase/migrations/202512211507_pacientes_aba03_rede_apoio.sql`, `supabase/migrations/202512211945_storage_patient_documents_bucket.sql`.
- Status: Implementado (rede de apoio, equipe, docs legais, portal access); eventos ficam em `patient_document_logs` (nao no ledger).

### Aba 04 - Admin & Financeiro
- Rotas/arquivos principais: `src/app/pacientes/[id]/PatientPageClient.tsx`.
- Componentes-chave: `src/components/patient/AdminFinancialTab.tsx`.
- Actions/servicos: `src/features/pacientes/actions/aba04/getAdminFinancialData.ts`, `src/features/pacientes/actions/aba04/updateAdminInfo.ts`, `src/features/pacientes/actions/aba04/updateFinancialProfile.ts`, `src/features/pacientes/actions/aba04/updateOnboardingChecklist.ts`, `src/features/pacientes/actions/aba04/setPrimaryPayerEntity.ts`, `src/features/pacientes/actions/aba04/setPolicyProfile.ts`, `src/features/pacientes/actions/aba04/upsertBillingEntity.ts`, `src/features/pacientes/actions/aba04/sendContractForSignature.ts`, `src/features/pacientes/actions/aba04/requestChecklistDocumentIngestion.ts`, `src/features/pacientes/actions/aba04/sendBillingExport.ts`, `src/features/pacientes/actions/aba04/reconcileBillingStatus.ts`, `src/features/pacientes/actions/aba04/recordPatientTimelineEvent.ts`, `src/features/pacientes/actions/getPatientTimelineEvents.ts`.
- Schemas/tipos: `src/features/pacientes/schemas/aba04AdminFinanceiro.schema.ts`, `src/types/supabase.ts`.
- Tabelas/migrations/policies: `supabase/migrations/202512221400_pacientes_aba04_admin_financeiro.sql`.
- Status: Implementado; timeline parcial (eventos gravados em `patient_timeline_events` apenas para fluxos de integracao).

### Aba 05 - GED (Documentos)
- Rotas/arquivos principais: `src/app/pacientes/[id]/ged/page.tsx`, `src/app/pacientes/[id]/ged/PatientGedPageClient.tsx`, `src/app/ged/original/page.tsx`, `src/app/ged/original/GedOriginalClient.tsx`, `src/app/api/pacientes/aba05/secure-links/route.ts`, `src/app/api/pacientes/aba05/secure-links/consume/route.ts`, `src/app/api/ged/artifacts/[id]/download/route.ts`.
- Componentes-chave: `src/components/patient/ged/GedExplorerPage.tsx`, `src/components/patient/ged/GedFolderTree.tsx`, `src/components/patient/ged/GedSearchBar.tsx`, `src/components/patient/ged/GedFileTable.tsx`, `src/components/patient/ged/GedCommandBar.tsx`, `src/components/patient/ged/GedFolderModal.tsx`, `src/components/patient/ged/GedMoveDocumentsModal.tsx`, `src/components/patient/aba05/GedQuickUploadModal.tsx`, `src/components/patient/aba05/GedDocumentViewerModal.tsx`, `src/components/patient/aba05/GedCustodyCenterModal.tsx`, `src/components/patient/aba05/GedBulkImportModal.tsx`.
- Actions/servicos: `src/features/pacientes/actions/aba05/uploadGedDocument.ts`, `src/features/pacientes/actions/aba05/listGedDocuments.ts`, `src/features/pacientes/actions/aba05/getGedDocumentPreview.ts`, `src/features/pacientes/actions/aba05/getGedDocumentDetails.ts`, `src/features/pacientes/actions/aba05/printGedDocument.ts`, `src/features/pacientes/actions/aba05/archiveGedDocuments.ts`, `src/features/pacientes/actions/aba05/unarchiveGedDocuments.ts`, `src/features/pacientes/actions/aba05/moveGedDocuments.ts`, `src/features/pacientes/actions/aba05/bulkImport.ts`, `src/features/pacientes/actions/aba05/listGedImportPaths.ts`, `src/features/pacientes/actions/aba05/listGedCustodyOverview.ts`, `src/features/pacientes/actions/aba05/gedFolders.ts`, `src/features/pacientes/actions/aba05/gedOriginalRequests.ts`, `src/features/pacientes/actions/aba05/createGedSecureLink.ts`, `src/features/pacientes/actions/aba05/consumeGedSecureLink.ts`, `src/features/pacientes/actions/aba05/revokeGedSecureLink.ts`, `src/features/pacientes/actions/aba05/getGedArtifactDownloadLink.ts`, `src/features/pacientes/actions/aba05/getGedArtifactDownloadUrl.ts`, `src/features/pacientes/services/aba05/timestampProvider.ts`, `src/features/pacientes/services/aba05/artifactGenerator.ts`.
- Schemas/tipos: `src/features/pacientes/schemas/aba05Ged.schema.ts`, `src/types/supabase.ts`.
- Tabelas/migrations/policies: `supabase/migrations/202512211507_pacientes_aba03_rede_apoio.sql` (patient_documents/logs base), `supabase/migrations/202512281200_pacientes_aba05_ged.sql`, `supabase/migrations/202601021430_pacientes_aba05_ged_folders.sql`.
- Status: Implementado com custodia, pastas, busca, secure links, artifacts e importacao em massa; eventos hoje ficam em `patient_document_logs` (nao no ledger).

### Aba 07 - Historico & Auditoria
- Rotas/arquivos principais: `src/app/pacientes/[id]/PatientPageClient.tsx`.
- Componentes-chave: placeholder interno em `renderHistorico` (sem componente dedicado).
- Actions/servicos: `src/features/pacientes/actions/getPatientTimelineEvents.ts` (usado apenas na Aba04), `src/features/pacientes/actions/aba04/recordPatientTimelineEvent.ts`.
- Tabelas/migrations/policies: `supabase/migrations/202512221400_pacientes_aba04_admin_financeiro.sql` (`patient_timeline_events`).
- Status: Ausente na UI e sem ledger unico; runbook de auditoria referencia `audit_events` mas nao existe migration/rota; ver `docs/runbooks/auditoria-endpoint.md`.

## 3. Modelo de dados e relacionamentos (V1)
- Multi-tenant: `app_private.current_tenant_id()` define `tenant_id` via JWT ou `app.tenant_id` e usado por default em tabelas; ver `supabase/migrations/202512130452_base.sql`.
- Soft delete: tabelas principais incluem `deleted_at` e policies filtram `deleted_at is null`.

| Entidade (tabela/view) | Relacoes e chaves (V1) | Evidencia |
| --- | --- | --- |
| `patients` | PK `id`, `tenant_id`; campos de status/auditoria; 1:N com enderecos, rede de apoio, documentos e admin financeiro | `supabase/migrations/202512130453_pacientes_aba01_dados_pessoais.sql`, `supabase/migrations/202512130704_pacientes_aba01_dados_pessoais_extend_legado.sql`, `supabase/migrations/202512131716_pacientes_aba01_align_final.sql` |
| `patient_addresses` + `patient_address_logistics` | `patient_addresses.patient_id` -> `patients.id`; `patient_address_logistics.address_id` -> `patient_addresses.id` (1:1) | `supabase/migrations/202512201726_pacientes_aba02_integracoes_cep_geocode_risk.sql` |
| `patient_related_persons`, `patient_household_members`, `care_team_members`, `patient_portal_access`, `view_patient_legal_guardian_summary` | Rede de apoio/equipe (1:N); `patient_portal_access.related_person_id` -> `patient_related_persons.id` | `supabase/migrations/202512211507_pacientes_aba03_rede_apoio.sql` |
| `patient_admin_financial_profile`, `billing_entities`, `care_policy_profiles`, `patient_onboarding_checklist` | Perfil admin/financeiro por paciente e cadastros de pagador/politica | `supabase/migrations/202512221400_pacientes_aba04_admin_financeiro.sql` |
| Ledger (nome fisico `patient_timeline_events`) | Fonte unica de eventos; view semantica `event_ledger_events` (sem duplicidade) | `supabase/migrations/202512221400_pacientes_aba04_admin_financeiro.sql` |
| `patient_documents` + `patient_document_logs` | Documentos legais e GED; logs tecnicos por documento (nao auditoria forense). Novas colunas GED: `display_name`, `original_filename_enc`, `original_filename_hash`, `original_filename_key_id`, `original_filename_alg` | `supabase/migrations/202512211507_pacientes_aba03_rede_apoio.sql`, `supabase/migrations/202601021430_pacientes_aba05_ged_folders.sql` |
| `patient_ged_folders` | Pastas persistidas do GED com `path` e `depth` | `supabase/migrations/202601021430_pacientes_aba05_ged_folders.sql` |
| `document_time_stamps`, `document_artifacts`, `document_secure_links` | TSA por documento, artifacts e links seguros | `supabase/migrations/202512281200_pacientes_aba05_ged.sql` |
| `ged_original_requests`, `ged_original_request_items` | Solicitacoes de original e itens vinculados | `supabase/migrations/202601021430_pacientes_aba05_ged_folders.sql` |
| `document_import_jobs`, `document_import_job_items` | Importacao em massa (ZIP/manifest) | `supabase/migrations/202512281200_pacientes_aba05_ged.sql` |
| Storage | Bucket `patient-documents` (docs legais) e `ged-documents` (GED com prefixo `tenant_id`) | `supabase/migrations/202512211945_storage_patient_documents_bucket.sql`, `supabase/migrations/202512281200_pacientes_aba05_ged.sql` |

## 4. Ledger unico: estrutura e visoes
### 4.1 Regra "um dado so"
- Todo evento (audit/forense e operacional/dominio) nasce no ledger unico.
- A UI apenas renderiza visoes diferentes sobre o mesmo ledger:
  - Central de Auditoria do Paciente (forense).
  - Aba Historico & Auditoria da ficha (por blocos/abas).
  - Auditoria do GED (mais restrita).
  - Timeline Operacional do Paciente (dominio + forenses relevantes).
- Regra dura: nenhum evento pode ser persistido em dois lugares diferentes. Logs tecnicos (ex.: storage) nao sao auditoria paralela.

### 4.2 Storage fisico e alias semantico (decisao final)
- Storage fisico: `patient_timeline_events` permanece como tabela real do ledger (evita refactor com risco).
- Alias semantico: view `public.event_ledger_events AS SELECT * FROM patient_timeline_events`.
- No documento, o termo "Ledger" sempre significa a fonte da verdade, independente do nome fisico.

### 4.3 Estrutura minima do ledger (a implementar)
- Campos adicionais minimos:
  - `class` (audit | domain)
  - `category` (patient | address | support | admin | document | security | system | navigation)
  - `event_code` (ex.: `edit.save`, `doc.print`)
  - `severity` (low | medium | high | critical)
  - `block_code` (aba01/aba02/aba03/aba04/ged)
  - `edit_session_id` (obrigatorio em edit.*)
  - `changed_sections[]` (sempre em edit.save)
  - `changed_fields[]` (apenas campos nao sensiveis)
  - `before` / `after` (apenas enums/status/booleanos autorizados)
- `payload` continua suportando metadados nao sensiveis.

### 4.4 Relacao com logs tecnicos
- `patient_document_logs` e telemetria tecnica (apoio a GED) e nao auditoria oficial.
- Se um log tecnico for relevante para auditoria, deve gerar um evento no ledger (ex.: `doc.print`, `secure_link.consume`).

## 5. Auditoria por blocos + sessoes
- Cada aba da ficha (01-04) e um bloco auditavel.
- Sessao de edicao:
  - `edit.start` -> `edit.save` ou `edit.cancel`.
  - `edit_session_id` obrigatorio para correlacao e extrato por sessao.
- Eventos minimos para a ficha:
  - `tab.view` (audit).
  - `tab.change` (audit, bufferizado).
  - `edit.start`, `edit.save`, `edit.cancel` (audit).
  - `button.click` apenas para botoes relevantes (mudanca de estado, custodia, export).
- Regra: qualquer alteracao de dados que resulte em `edit.save` gera evento (nao apenas campos "relevantes").

### 5.1 changed_sections vs changed_fields (decisao final)
- `changed_sections[]`: sempre preenchido no `edit.save`.
- `changed_fields[]`: somente campos nao sensiveis.
- Para campos sensiveis: nao incluir `changed_fields`, apenas secao/agrupamento.

### 5.2 Before/After (decisao final)
- Permitido apenas para enums/status/booleanos operacionais (ex.: status administrativo/financeiro, flags de consentimento).
- Proibido para texto livre, campos sensiveis e dados de saude (V1).
- Excecoes futuras exigem mascaramento + permissao "critical/admin".

### 5.3 Navegacao bufferizada (decisao final)
- Eventos volumosos de navegacao (tab.view/tab.change) sao batched.
- Flush do buffer quando:
  1. saida da ficha do paciente, OU
  2. idle 5 min, OU
  3. a cada 20 eventos.
- Registro no ledger como `patient.navigation.batch` com payload resumido (sequencia, tempo total, contagem).

## 6. GED: custodia + nomes de arquivo (decisao final)
- GED permanece com custodia, TSA, artifacts e links seguros; ver `supabase/migrations/202512281200_pacientes_aba05_ged.sql` e `src/features/pacientes/actions/aba05/uploadGedDocument.ts`.
- Regra final para nome de arquivo:
  - `display_name`: nome sanitizado para UI e logs comuns.
  - `original_filename_enc`: nome original criptografado (apenas auditoria/admin GED).
  - `original_filename_hash`: hash para correlacao sem expor texto.
  - `original_filename_key_id`: identificador da chave usada.
  - `original_filename_alg`: algoritmo (ex.: aes-256-gcm).
- Producao: envelope encryption (KMS/KEK) + DEK (por tenant ou por documento), com key_id armazenado e rotacao suportada.
- Dev/local: chave simetrica em env `AUDIT_GED_FILENAME_KEY`.
- Regra dura: nunca expor `original_filename_enc` na UI, apenas `display_name`.

## 7. Severidade e retencao
### 7.1 Severity explicita (decisao final)
- Ledger inclui `severity` com valores: low | medium | high | critical.
- Severity e preenchida por regra/mapeamento de `event_code`.

Tabela minima de mapeamento:
| event_code | severity |
| --- | --- |
| secure_link.consume | critical |
| doc.print | high |
| doc.download_artifact | high |
| edit.save | medium |
| tab.view | low |
| doc.open | low |
| doc.close | low |

### 7.2 Retencao (decisao final)
- Base legal: Lei 13.787/2018 e diretrizes CFM (prontuarios e custodia); LGPD (obrigacao legal/regulatoria) e Marco Civil da Internet como referencia minima de logs.
- Retencao longa justificada por obrigacao legal/regulatoria e seguranca/custodia; acesso restrito via RBAC.
- Retencao por severidade (rolling por `event_time`):
  - High/Critical (forense/custodia): 20 anos.
  - Medium (mudancas operacionais relevantes / edit.save): 10 anos.
  - Low (volumosos: navegacao/view/open/close): 8 anos.
- Purge/arquivamento executado por job privilegiado (service role). Dentro da janela de retencao, o ledger permanece append-only.

## 8. Permissoes e visibilidade (decisao final)
- Restricao aplicada no endpoint e preparada via RLS (V1 pode iniciar com enforcement no endpoint).
- Matriz minima de acesso:

| Visao | V1 dev | Producao | Observacoes |
| --- | --- | --- | --- |
| Central de Auditoria (paciente) | tenant_member | feature flag + tenant_admin (ou auditor) | Visao forense completa |
| Auditoria GED | tenant_admin | tenant_admin + feature flag | Mais restrita que ficha |
| Eventos severity critical | tenant_owner / conecta_audit_superuser | tenant_owner / conecta_audit_superuser | Acesso supervisionado |

## 9. Central de Auditoria (UI/UX)
- Paginacao obrigatoria (cursor/limit).
- Ferramentas obrigatorias:
  - Exportar CSV.
  - Exportar JSON assinado.
  - Exportar PDF com: capa + sumario + extrato por sessao + timeline paginada.
- Extrato por sessao:
  - Agrupar por `edit_session_id`.
  - Exibir bloco (aba), autor, timestamps, `changed_sections`, `changed_fields` nao sensiveis, before/after quando permitido.

## 10. Fluxos e regras por aba (com ledger unico)
### Aba 01 - Dados Pessoais
- `tab.view`, `edit.start`, `edit.save`, `edit.cancel` geram eventos no ledger.
- `edit.save` inclui `changed_sections` (sempre) e `changed_fields` nao sensiveis.
- `updatePatientDadosPessoais.ts` deve preencher `updated_by` e gerar evento.

### Aba 02 - Endereco & Logistica
- `savePatientAddress.ts` gera `edit.save` com `block_code=aba02`.
- Refresh de geocode/risco registra evento de sistema (se relevante) sem dados sensiveis.
- `patient_address_logistics` segue `edit_session_id` da aba.

### Aba 03 - Rede de Apoio
- CRUD de contatos/equipe e definicao de responsavel legal geram eventos no ledger.
- Upload/aprovacao de documentos legais gera `doc.upload`, `doc.approve`.
- Convites de portal geram evento `portal.invite` (com payload minimo).

### Aba 04 - Admin & Financeiro
- Eventos ja registrados em `recordPatientTimelineEvent.ts` migram para ledger unico com `severity` e `event_code` padronizado.
- `edit.save` para alteracoes do perfil deve incluir `changed_sections`.

### Aba 05 - GED
- Upload, view, print, archive, secure link, consume link e bulk import geram eventos no ledger.
- `patient_document_logs` permanece tecnico, mas nao substitui ledger.
- Auditoria GED consome apenas eventos `document.*` e `secure_link.*`.

## 11. Plano de finalizacao (roadmap tecnico)
1. Contratos (Contrato -> Migrations)
   - Criar contrato ABA07 com ledger unico, severidade, retencao e exportacoes.
   - Atualizar contrato ABA05 com `display_name`, `original_filename_enc`, `original_filename_hash`, `original_filename_key_id`, `original_filename_alg`.
   - Arquivos: `docs/contracts/pacientes/ABA07_HISTORICO_AUDITORIA.md`, `docs/contracts/pacientes/ABA05_GED.md`, `docs/contracts/pacientes/INDEX.md`.
2. Migrations (Migrations)
   - Evoluir `patient_timeline_events` para ledger unico (novas colunas + indices + append-only).
   - Criar view `event_ledger_events` (alias semantico).
   - Adicionar colunas GED em `patient_documents` (nome de arquivo, key_id, alg).
   - Ajustar RLS/append-only para ledger e logs tecnicos.
3. Types (Types)
   - Regenerar `src/types/supabase.ts` com novas colunas.
4. Actions (Actions)
   - Implementar writer do ledger com `event_code`, `severity`, `edit_session_id` e batch de navegacao.
   - Instrumentar Aba01-04 e GED para emitir eventos unificados.
   - Implementar criptografia/decriptografia de `original_filename_enc` apenas no server-side.
   - Garantir que falha ao registrar evento nao bloqueia operacao principal.
5. UI (UI)
   - Implementar Aba07 consumindo ledger com filtros/paginacao.
   - Central de Auditoria com exportacoes (CSV/JSON assinado/PDF).
   - Ajustar GED para exibir `display_name` e restringir auditoria GED a admin.
6. Docs/Runbooks (Docs)
   - Atualizar `docs/runbooks/auditoria-endpoint.md` para refletir ledger unico.
   - Atualizar `docs/plans/pacientes/PACIENTES_V1_CANONICO.md` (este arquivo) ao final.

## 12. Riscos, dependencias e decisoes tecnicas
- Ledger unico exige migracao de eventos hoje espalhados entre `patient_timeline_events` e `patient_document_logs`; risco de perda de eventos se nao houver backfill.
- Append-only precisa ser garantido via policy/trigger; risco de compliance se houver UPDATE/DELETE no ledger.
- Bufferizacao de navegacao pode perder detalhes se o flush falhar; exigir resiliencia no writer.
- Criptografia de `original_filename_enc` exige KMS e gestao de chaves; risco operacional se houver falha de rotacao.
- Exportacoes assinadas (JSON/PDF) exigem padrao de assinatura e armazenamento seguro.

## 13. Pendencias reais
- Definir estrategia de backfill para historico pre-ledger (patient_document_logs e eventos existentes).
- Definir padrao tecnico de assinatura para export JSON/PDF (algoritmo, armazenamento e verificacao).

## 14. Definition of Done (V1)
- Ledger unico ativo e sem duplicidade; todas as visoes consomem o ledger via `patient_timeline_events`/`event_ledger_events`.
- Aba01-04 geram `edit.start/save/cancel` com `edit_session_id`, `changed_sections` e `severity`.
- GED emite eventos no ledger para upload/view/print/secure_link/consume, e `display_name` e usado na UI.
- Aba07 implementada com paginacao, filtros e extrato por sessao (`edit_session_id`).
- Central de Auditoria entrega exportacoes CSV/JSON assinado/PDF.
- Retencao aplicada por severidade (20y/10y/8y) e documentada com base legal.
- RLS e append-only aplicados ao ledger, com RBAC minimo ativo (GED admin-only).
- Documentacao e runbooks atualizados (sem drift).
