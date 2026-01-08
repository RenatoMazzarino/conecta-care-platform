# Módulo de Pacientes V1 — Análise + Plano de Implementação (Canônico)

**Documento:** PACIENTES_V1_ANALISE_E_PLANO  
**Status:** Draft (pronto para revisão)  
**Versão:** 1.0.0  
**Última atualização:** 2026-01-07  
**Escopo:** Abas 01–05 + Aba 07 (Histórico & Auditoria). Aba 06 (Clínico) fora do V1.

---

## 1) Visão geral

O **Módulo de Pacientes V1** consolida o cadastro e operação “não-clínica” do paciente (Abas 01–04), finaliza o **GED** como experiência dedicada (Aba 05) e introduz uma trilha completa de **Histórico & Auditoria** (Aba 07) para garantir rastreabilidade e governança.

**Objetivo do V1:** entregar um módulo “production-ready” com multi-tenant/RLS consistente, soft delete, custódia documental e auditoria unificada, sem placeholders.

---

## 2) Estado atual (Análise)

### 2.1 O que já existe (premissas do repositório)

- Abas **01–04** implementadas conforme contratos já aprovados, com integração ao Supabase via actions e validação (Zod).
- **GED (Aba 05)**: existe base/placeholder de componentes (ex.: tab antiga / início de página dedicada), mas falta finalizar a experiência completa (Explorer + custódia + operações).
- **Histórico & Auditoria (Aba 07)**: ainda não está entregue (placeholder ou “a definir”).

> Observação: o V1 precisa revisar e “amarra” as abas 01–04 ao mecanismo de auditoria (eventos).

### 2.2 Gaps típicos a validar/fechar

- Campos de auditoria no “root” do paciente: `created_at/created_by`, `updated_at/updated_by`, `deleted_at` (existência e preenchimento real).
- Consistência de `tenant_id` + RLS nas tabelas do módulo.
- GED: persistência de pastas, vínculo de documentos à pasta, custódia (hash, carimbo de tempo/TSA), logs e links seguros.
- Auditoria: taxonomia de eventos + tabela append-only + UI de timeline.

---

## 3) Escopo do V1

### 3.1 Dentro do escopo

- **Aba 01 — Dados Pessoais** (revisão/integração com auditoria)
- **Aba 02 — Endereço & Logística** (revisão/integração com auditoria)
- **Aba 03 — Rede de Apoio** (revisão/integração com auditoria)
- **Aba 04 — Admin/Financeiro** (revisão/integração com auditoria)
- **Aba 05 — GED (Documentos)**
  - Página dedicada `/pacientes/[id]/ged`
  - Pastas persistidas no banco
  - Custódia documental (hash, TSA, logs)
  - Viewer protegido com watermark
  - Links seguros para originais + auditoria de acesso
  - Importação em massa (se já estiver prevista no contrato do GED do projeto)
- **Aba 07 — Histórico & Auditoria**
  - Timeline consolidada de eventos do paciente (inclui eventos de GED)
  - Card com “criado por / atualizado por” e timestamps

### 3.2 Fora do escopo (V1)

- **Aba 06 — Clínico** (sem contrato definido)
- Prontuário/integrações clínicas
- Importações multi-paciente complexas e fluxos administrativos fora do contexto do paciente (se não estiverem no escopo contratual do V1)

---

## 4) Princípios e decisões (Governança)

1. **Contract-driven:** nenhuma feature nova sem contrato correspondente (ABA07 precisa existir formalmente).
2. **Multi-tenant obrigatório:** toda tabela do módulo com `tenant_id` e RLS efetivo.
3. **Soft delete:** `deleted_at` (sem apagar dados críticos).
4. **Auditoria append-only:** eventos não podem ser alterados/removidos (RLS sem UPDATE/DELETE + (opcional) trigger defensiva).
5. **GED é custódia:** originais nunca são sobrescritos; qualquer ação relevante gera log.
6. **LGPD:** evitar registrar dados sensíveis em texto aberto em logs (ex.: não logar CPF completo, nem PHI em payloads).

---

## 5) Taxonomia mínima de eventos (Aba 07)

Padrão: `contexto.acao` (string), por exemplo:

- `patient.create`
- `patient.update`
- `patient.status.change` (quando aplicável)
- `document.upload`
- `document.archive`
- `document.request_original`
- `document.grant_original`
- `document.access_original`
- `document.consume_original`
- `system.action` (tarefas automáticas)

**Campos mínimos por evento:**

- `tenant_id`
- `actor_id` (nullable se sistema)
- `event`
- `entity` (ex.: `patient`, `patient_document`)
- `entity_id` (id do paciente ou documento)
- `origin` (ex.: `web`, `api`)
- `payload` (jsonb enxuto e seguro)
- `created_at`

> Recomendação prática: em eventos de documento, incluir `patient_id` no `payload` para facilitar timeline por paciente sem joins caros.

---

## 6) Plano de execução (Fases)

### Fase 1 — Levantamento e fechamento de requisitos

**Entregas:**

- Checklist do estado atual (abas 01–05; 07)
- Lista de gaps e decisões pendentes
- Contrato **ABA07** rascunhado (mínimo: objetivo, escopo, UI, modelo de dados, eventos, DoD)

### Fase 2 — Design técnico + atualização documental (antes do código)

**GED**

- Modelo de dados: pastas persistidas (`patient_ged_folders`), vínculo em `patient_documents.folder_id`
- Requests de originais + items
- RPCs: mover pasta; bundles (upload/artifact) se forem padrão do projeto
- Estratégia de logs e integração com auditoria unificada

**Auditoria**

- Tabela `audit_events` + políticas
- Endpoint interno `/api/audit/events` (schema validado)
- Convenções de payload + proteção (ignorar `tenant_id` do client; forçar actor/tenant do contexto)

**Entregas:**

- ABA07 finalizado para aprovação
- Ajustes no contrato do GED se necessário (adendo de versão, se houver)

### Fase 3 — Banco de dados (migrations)

**GED**

- `patient_ged_folders` (path/depth/is_system, índices, triggers)
- `patient_documents.folder_id` + índices
- `ged_original_requests` e `ged_original_request_items`
- RPC `move_ged_folder(...)`
- (Opcional conforme padrão do repo) RPCs “bundle” para consistência transacional e logs

**Auditoria**

- `audit_events` (append-only)
- RLS: SELECT/INSERT por tenant; sem UPDATE/DELETE
- Índices por (tenant, created_at) e (entity, entity_id, created_at)

**Entregas:**

- Migrations aplicadas e versionadas
- Evidências referenciáveis (IDs de migrations)

### Fase 4 — Tipos e schemas

- Regenerar tipos Supabase
- Zod schemas:
  - GED: pasta, documento, request de original
  - Auditoria: payload do endpoint
- Ajustar tipos compostos de timeline (se necessário)

### Fase 5 — Actions/Services e endpoint

**GED**

- `ensurePatientGedFolders(patientId)` (seed on-demand)
- CRUD pastas (create/rename/move/delete com restrições)
- Upload coordenado (storage + hash + registro + logs)
- Busca (pasta vs global)
- Arquivamento em lote
- Fluxo de original: request, links seguros, consumo via endpoint com IP/UA e log

**Auditoria**

- Implementar `/api/audit/events`
- Instrumentar actions das abas 01–04 e GED para emitir eventos
- Helper para mapear `event -> descrição` (server-side preferencial)

### Fase 6 — UI (Frontend)

**GED**

- Página `/pacientes/[id]/ged` (Explorer: árvore, breadcrumbs, command bar, lista)
- Viewer protegido com watermark
- Centro de custódia (stats + requests + status)
- Aba “Documentos (GED)” vira atalho/CTA para a página dedicada

**Histórico & Auditoria**

- Aba 07 no paciente
- Card “criado/atualizado por”
- Timeline com filtros simples (se couber) e paginação/lazy-load (se necessário)

### Fase 7 — Testes e verificação

- Unit: schemas, helpers, hashing, geração de payload
- Integração: fluxos GED + auditoria
- Segurança: RLS multi-tenant; rotas protegidas; links de originais
- Checklist LGPD e custódia (watermark + logs)

### Fase 8 — Fechamento (documentação + release)

- ABA07 marcado como concluído + evidências
- Atualização de índices (contratos e planos)
- Notas de versão do Módulo Pacientes V1 (1.0.0)
- Go-live/staging checklist + rollback básico

---

## 7) Definition of Done (DoD) — Pacientes V1

- Abas **01–05** operacionais e sem placeholders (GED em página dedicada).
- Aba **07** entregue com timeline consumindo `audit_events`.
- Eventos mínimos emitidos por: create/update paciente, mudanças relevantes, upload/ações essenciais do GED.
- Multi-tenant/RLS validado (inclusive auditoria e GED).
- Watermark e logs essenciais funcionando (incluindo IP/UA em consumo de link de original).
- Docs atualizados (contratos, planos, índices) e com evidências.

---

## 8) Riscos e mitigação (curto e objetivo)

- **Poluição de timeline** (eventos demais) → granularidade controlada (um evento por “salvamento” por aba; eventos dedicados só para status e GED).
- **Payload com dados sensíveis** → payload enxuto e mascarado; sem PHI/CPF integral.
- **Performance (muitos eventos)** → paginação/lazy-load; índices adequados; filtro por patient_id no payload para eventos de docs.
- **Drift documental** → arquivo canônico + stubs DEPRECATED + lint de docs no CI.

---

## 9) Pendências que precisam de “sim/não” no V1 (para travar o escopo)

1. Timeline terá paginação já no V1?
2. Busca global no GED entra no V1?
3. Importação em massa (ZIP) entra no V1 (se já prevista)?
4. `created_by/updated_by` será preenchido via actions (preferível) ou trigger?

> Se a decisão não for tomada agora, o padrão é: **entregar simples no V1**, deixando hooks para evoluir.
