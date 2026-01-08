# Plano de Implementacao: Aba 05 (GED)

## 0) Baseline

- Status: Aprovado
- `git status -sb` → `## feat/pacientes-aba05-ged...` (com alteracoes locais)
- `git rev-parse --abbrev-ref HEAD` → `feat/pacientes-aba05-ged`
- `git rev-parse HEAD` → `ed75f06cafec42845ea5e26366b068c3fc2a8b30`
- `npm run docs:links` → Pendente (nao executado nesta revisao)
- `npm run docs:lint` → Pendente (nao executado nesta revisao)

Premissas de greenfield:

- Nao existe backfill legado; constraints (hash/time stamp) valem desde o primeiro insert.
- `file_hash` e calculado no pipeline de upload/import antes da gravacao.
- Pastas sao persistidas no banco; storage sempre por `doc_id` (sem refletir estrutura de pastas).

## 1) Objetivo

- Implementar o GED vNext como pagina dedicada do paciente (Explorer/OneDrive).
- Persistir pastas no banco e permitir create/rename/move com pastas sistema protegidas.
- Garantir custodia completa (hash + TSA SERPRO + logs), viewer protegido e impressao/baixa derivada.
- Centralizar auditoria no Centro de Custodia (requisicoes mae + itens + IP/UA).
- Suportar importacao em massa (ZIP) em contexto single-paciente.

## 2) Escopo

**IN:**

- Rota dedicada `/pacientes/[id]/ged` com CTA na aba antiga.
- Migrations para `patient_ged_folders`, `ged_original_requests`, `ged_original_request_items`.
- `folder_id` em `patient_documents`.
- RPCs atomicas: `create_ged_document_bundle` e `create_ged_artifact_bundle`.
- RPC `move_ged_folder` para atualizar subarvore.
- Actions completas para pastas, busca por escopo, arquivamento e requisicoes de original.
- Endpoint server-side para download de artefato com log IP/UA.
- UI Explorer (arvore, breadcrumbs, busca com toggle) + Centro de Custodia.

**OUT:**

- Importacao multi-paciente (escopo de outro modulo/admin).
- Validacoes de dominio (CPF, laudos) em outras abas.
- Storage refletindo estrutura de pastas.

## 3) Referencias obrigatorias

- [AGENT.md](../../AGENT.md)
- [docs/contracts/pacientes/ABA05_GED.md](../contracts/pacientes/ABA05_GED.md)
- [docs/architecture/decisions/ADR-007-ged-custodia-watermark-time-stamp.md](../architecture/decisions/ADR-007-ged-custodia-watermark-time-stamp.md)
- [html/ged-viewer-dynamics.html](../../html/ged-viewer-dynamics.html)
- [html/modelo_final_aparencia_pagina_do_paciente.htm](../../html/modelo_final_aparencia_pagina_do_paciente.htm)

## 4) Estado atual / inventario

- GED hoje existe como aba dentro do paciente; pagina dedicada ainda nao existe.
- Pastas sao apenas virtuais; nao ha persistencia em DB.
- Custodia (secure links, artifacts, TSA) ja esta especificada e precisa ser expandida para requisicoes mae.

## 5) Fases de implementacao

### Fase 1 — Dados (Migrations)

1. Criar `patient_ged_folders` (path materializado + depth + is_system).
2. Adicionar `folder_id` em `patient_documents` (FK).
3. Criar `ged_original_requests` e `ged_original_request_items`.
4. Criar RPC `move_ged_folder` (move + atualizar subarvore).
5. Criar RPCs atomicas:
   - `create_ged_document_bundle` (document + TSA + log)
   - `create_ged_artifact_bundle` (artifact + log)
6. Indices e constraints (unicidade de nomes por pasta, path, status).
7. RLS em todas as tabelas novas.

### Fase 2 — Types

1. Gerar types Supabase atualizados.
2. Zod schemas para:
   - pastas (`patient_ged_folders`)
   - requisicoes mae/itens (`ged_original_requests` / `ged_original_request_items`)
   - filtros de busca com escopo (pasta vs GED global)

### Fase 3 — Actions / Services

1. `ensurePatientGedFolders(patientId)` para seed on-demand.
2. CRUD de pastas + move via RPC.
3. Listagem de documentos por pasta + subpastas.
4. Busca global (ignora pasta) com coluna Caminho.
5. Arquivar em massa (status -> Arquivado).
6. Requisicoes de original (mae + itens) e integracao com secure links.
7. Secure links: capturar IP/UA no consumo server-side.
8. Upload e print via RPCs atomicas (evitar docs fantasmas).
9. Endpoint `/api/ged/artifacts/[id]/download` com log IP/UA e redirect.

### Fase 4 — UI (Pagina GED)

1. Rota `/pacientes/[id]/ged` com layout do paciente.
2. Botao/icone "GED" no header do paciente.
3. Aba antiga GED vira CTA para abrir a pagina.
4. UI Explorer:
   - arvore de pastas (estavel)
   - breadcrumbs
   - command bar
   - busca + toggle "Buscar em todo GED"
   - tabela estilo OneDrive
   - selecao em massa + barra de acoes
5. Viewer modal protegido (banner + watermark overlay).

### Fase 5 — Centro de Custodia

1. Subview/modal com contadores.
2. Lista de requisicoes mae com accordion por item.
3. Mini auditoria por item (solicitado, link gerado, acesso, download, expiracao, IP/UA).

### Fase 6 — Testes

1. Unit: RPC bundles (document + artifact), hash SHA-256.
2. Unit: move de pasta (path/ depth atualizados).
3. Integracao: busca por pasta vs global.
4. Integracao: requisicao mae + secure link + consumo unico.
5. Integracao: download de artefato via endpoint (log IP/UA).
6. RLS: tenant isolation e acesso por paciente.

### Fase 7 — Validacao final

- `npm run verify`
- Checklist de seguranca (watermark, download unico, logs completos).

## 6) Inventario de artefatos

**Novos arquivos (previstos):**

- `supabase/migrations/2026XXXX_pacientes_aba05_ged_folders.sql`
- `src/app/pacientes/[id]/ged/page.tsx`
- `src/components/patient/ged/` (Explorer layout, FolderTree, SearchBar, FileList)
- `src/components/patient/ged/CustodyCenter.tsx`
- `src/features/pacientes/actions/aba05/gedFolders.ts`
- `src/features/pacientes/actions/aba05/gedOriginalRequests.ts`
- `src/app/api/ged/artifacts/[id]/download/route.ts`

**Alteracoes previstas:**

- `supabase/migrations/202512281200_pacientes_aba05_ged.sql` (ajustes de colunas/indices)
- `src/components/patient/GedTab.tsx` (virar CTA)
- `src/app/pacientes/[id]/PatientPageClient.tsx` (botao GED)
- `src/features/pacientes/actions/aba05/uploadGedDocument.ts` (RPC bundle)
- `src/features/pacientes/actions/aba05/printGedDocument.ts` (RPC bundle)

## 7) Criterios de aceite (DoD)

- [ ] GED abre como pagina dedicada via botao no header do paciente.
- [ ] Pastas persistidas e operaveis (create/rename/move/delete) com pastas sistema protegidas.
- [ ] Busca por pasta + subpastas e busca global com coluna Caminho.
- [ ] Selecoes em massa exibem barra de acoes (Arquivar, Solicitar originais).
- [ ] Centro de Custodia com contadores + requisicoes mae + auditoria por item (IP/UA).
- [ ] Impressao e download sempre via artefato derivado com cabecalho + watermark.
- [ ] Original apenas via secure link autenticado e auditado.
- [ ] `npm run verify` OK.

## 8) Decisoes fechadas

- GED sai da aba e vira pagina dedicada do paciente.
- Pastas sao persistidas no banco; storage nao reflete estrutura.
- Busca padrao respeita pasta atual + subpastas; toggle para busca global.
- Arquivar = muda status; documento permanece na pasta e aparece em "Arquivados".
- Impressao/download publico apenas por artefato derivado.
- Originais apenas via secure link com auditoria completa.
- Requisicoes de original em massa usam requisicao mae + itens.
- Importacao ZIP no GED do paciente e sempre single-paciente.
