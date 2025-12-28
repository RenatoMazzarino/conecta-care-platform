# Plano de Implementacao: Aba 05 (GED)

## 0) Baseline

- Status: Aprovado
- `git status -sb` → `## feat/pacientes-aba05-ged` (com alteracoes locais)
- `git rev-parse --abbrev-ref HEAD` → `feat/pacientes-aba05-ged`
- `git rev-parse HEAD` → `ee7ad1183078496bc36a1998d02af8f2f3786b36`
- `npm run docs:links` → OK (relatorio em [docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_LINK_CHECK.md](analise-governanca-estrutura-2025-12-19/DOCS_LINK_CHECK.md))
- `npm run docs:lint` → OK

Premissas de greenfield:

- Nao existe backfill legado; constraints (hash/time stamp) valem desde o primeiro insert.
- `file_hash` e calculado no pipeline de upload/import antes da gravacao.

## 1) Objetivo

- Implementar a Aba 05 (GED) end-to-end com custodia, watermark, TSA SERPRO, impressao derivada, artifacts, link seguro e retencao.
- Consolidar taxonomia enterprise e viewer protegido usando [html/ged-viewer-dynamics.html](../../html/ged-viewer-dynamics.html) como referencia.
- Entregar onboarding enterprise com importacao em massa (ZIP + manifest + fallback) e fila `needs_review`.

## 2) Escopo

**IN:**

- Migrations com `patient_documents`, `patient_document_logs`, `document_artifacts`, `document_time_stamps`, `document_secure_links`.
- Migrations com `document_import_jobs` e `document_import_job_items`.
- Storage privado com naming por IDs e validacoes por categoria.
- Actions completas (upload, TSA, artifacts, secure links, logs).
- Actions de bulk import (job + itens + retry + relatorio).
- UI GED (lista, upload, viewer, print, auditoria, solicitacao de original).
- UI de importacao em massa (status do job, erros e fila `needs_review`).
- Testes unitarios/integracao para hash, TSA mock/real, artifacts e link seguro.

**OUT:**

- Validacoes/aprovacoes de dominio (CPF, laudos) em outras abas.
- Portal de pacientes ou funcionalidades de terceiros nao previstas no contrato.

## 3) Referencias obrigatorias

- [AGENT.md](../../AGENT.md)
- [docs/contracts/pacientes/ABA05_GED.md](../contracts/pacientes/ABA05_GED.md)
- [docs/architecture/decisions/ADR-007-ged-custodia-watermark-time-stamp.md](../architecture/decisions/ADR-007-ged-custodia-watermark-time-stamp.md)
- [html/ged-viewer-dynamics.html](../../html/ged-viewer-dynamics.html)
- [html/modelo_final_aparencia_pagina_do_paciente.htm](../../html/modelo_final_aparencia_pagina_do_paciente.htm)
- [db/snapshots_legado/conectacare-2025-11-29.sql](../../db/snapshots_legado/conectacare-2025-11-29.sql) (referencia externa)
- [SERPRO (ACT ICP-Brasil)](https://www.serpro.gov.br/)

## 4) Estado atual / inventario

- Referencia externa: `patient_documents` e `patient_document_logs` aparecem no schema de referencia (sem backfill).
- Viewer de referencia: [html/ged-viewer-dynamics.html](../../html/ged-viewer-dynamics.html).
- Aba Documentos (GED) hoje e placeholder na UI principal.
- Importacao em massa ainda nao existe no runtime; sera implementada via jobs.

## 5) Fases de implementacao

### Fase 1 — Dados (Migrations)

1. Ajustar `patient_documents`:
   - `file_hash` NOT NULL e calculado antes da gravacao; constraint valida desde o primeiro insert.
   - `subcategory` como `doc_type` canonico.
   - indices por `category`, `document_status`, `origin_module`, `uploaded_at`.
2. Criar `document_artifacts` com unique `(document_log_id)`.
3. Criar `document_time_stamps` com unique `(document_id)` (tabela canonica unica).
4. Criar `document_secure_links` com unique `(token_hash)` e campos de consumo (`consumed_at/consumed_by`).
5. Criar `document_import_jobs` e `document_import_job_items` (jobs + itens de ZIP).
6. RLS em todas as tabelas (`tenant_id` + soft delete), incluindo jobs/itens.
7. Storage policies (bucket privado, sem PHI, limites por categoria e MIME).

### Fase 2 — Types

1. Gerar types Supabase.
2. Adicionar schemas Zod para:
   - Documentos, logs, artifacts, time stamps, secure links.

### Fase 3 — Actions

1. Upload/ingestao (hash + storage + TSA + log).
2. Viewer protegido (log `view`).
3. Impressao derivada (artifact + log).
4. Secure links (request/grant/access/consume/revoke/renew).
5. Integracao SERPRO (TimestampProvider) com mock DEV quando nao houver sandbox.
6. Secure links com TTL padrao 72h em producao e 7 dias no DEV.
7. Download-only para DICOM nivel 1 (custodia sem viewer).
8. Bulk import actions: criar job, upload ZIP, parse manifest, criar itens, marcar `needs_review`, commit itens aprovados.

### Fase 4 — Bulk Import (Jobs)

1. Criar pipeline de importacao: upload ZIP -> criar job -> processar itens.
2. Validar manifest (JSON/CSV) e aplicar taxonomia; fallback por pastas.
3. Gerar `needs_review` quando faltar taxonomia ou houver conflito (sem bloquear custodia).
4. Garantir hash + TSA + log por arquivo importado (inclusive `needs_review`).
5. Permitir aprovar/commit de itens revisados para criar `patient_documents`.
6. Relatorio final por job (total/importados/needs_review/falhas).

### Fase 5 — UI

1. Lista GED com filtros de taxonomia.
2. Modal de upload com validacoes por categoria.
3. Viewer protegido baseado em [html/ged-viewer-dynamics.html](../../html/ged-viewer-dynamics.html).
4. Impressao derivada + historico de artifacts.
5. Fluxo "Solicitar original" e estado do link seguro.
6. Tela de importacao em massa (jobs, progresso, erros, needs_review).

### Fase 6 — Testes

1. Unit: hash SHA-256, validacoes de MIME/size, TTL de links.
2. Integracao: TSA SERPRO (mock/real), artifacts gerados, download unico.
3. Integracao: bulk import (manifest JSON/CSV, fallback, needs_review, idempotencia do manifest).
4. RLS: tenant isolation + acesso ao original por usuario autenticado do tenant.

### Fase 7 — Validacao final

- `npm run docs:links`
- `npm run docs:lint`
- Checklist de seguranca (watermark, download unico, logs completos).

## 6) Inventario de artefatos

**Novos arquivos (previstos):**
- `supabase/migrations/202512XX_aba05_ged.sql`
- `src/features/pacientes/actions/aba05/`
- `src/features/pacientes/schemas/aba05Ged.schema.ts`
- `src/components/patient/GedTab.tsx`

**Alteracoes previstas:**
- `src/app/pacientes/[id]/PatientPageClient.tsx`
- `src/types/supabase.ts`

## 7) Criterios de aceite (DoD)

- [ ] Migrations aplicadas com RLS e indices.
- [ ] Actions completas (upload/view/print/secure links).
- [ ] Viewer protegido e watermark overlay ativos (com toggle DEV).
- [ ] Artefatos de impressao salvos e auditados.
- [ ] TSA SERPRO funcionando (mock/real no DEV).
- [ ] Secure links com expiracao e download unico.
- [ ] Bulk import com manifest + fallback e fila `needs_review`.
- [ ] `npm run docs:links` e `npm run docs:lint` OK.

## 8) Decisoes fechadas

- Custodia com hash SHA-256 e original imutavel.
- Watermark overlay + banner de custodia.
- Impressao derivada com artifacts (sem virar versao).
- TSA SERPRO com tabela unica.
- Secure links autenticados com expiracao e download unico (TTL prod 72h; DEV 7 dias).
- Retencao default 20 anos, com excecoes por categoria.
- Taxonomia enterprise e pastas virtuais definidas.
- MIME/size por categoria definidos no contrato.
- Politica de acesso ao original: usuario autenticado do tenant com acesso ao paciente.
- Bulk import via ZIP (manifest JSON/CSV + fallback por pastas).
- DICOM nivel 1: custodia e download-only.
