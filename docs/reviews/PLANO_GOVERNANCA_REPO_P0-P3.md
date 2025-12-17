# Plano de Governança e Saneamento do Repositório (P0–P3)

Atualizado em: 2025-12-17

Este documento é a fonte canônica do planejamento de saneamento e governança do repositório. Deve ser mantido sempre atualizado conforme a execução avança. Novos itens identificados durante a execução devem ser incluídos retroativamente no nível correto (P0–P3). Se algo executado exigir reclassificação (ex.: algo que era P1 mas mostra-se P0), este plano deve ser atualizado imediatamente e a execução registrada.

- Branch de trabalho: `chore/repo-governance-docs-p0-p3`
- PR guarda-chuva (Draft): PR #6 — “Repo governance and docs consolidation P0–P3 (DRAFT)”
  - Link: https://github.com/RenatoMazzarino/conecta-care-platform/pull/6

## Sumário
- [Checklist macro (21 passos)](#checklist-macro-21-passos)
- [P0 — Detalhamento e status](#p0-—-detalhamento-e-status)
- [P1 — Detalhamento planejado](#p1-—-detalhamento-planejado)
- [P2/P3 — Visão geral (mantido do plano original)](#p2p3-—-visão-geral-mantido-do-plano-original)
- [Evidências e referências](#evidências-e-referências)
- [Histórico de atualizações deste plano](#histórico-de-atualizações-deste-plano)
- [Governança deste documento](#governança-deste-documento)

---

## Checklist macro (21 passos)

- [x] 1. Segurança e segredos (P0)
- [x] 2. CI/CD e qualidade (P0)
- [x] 3. ADRs formais (P0)
- [x] 4. Consolidação de documentação (P1)
- [x] 5. Índices/contratos por módulo/aba (P1)
- [x] 6. Backlog OPEN_TODO alinhado (P1)
- [x] 7. Runbooks (lacunas) (P1)
- [x] 8. Scripts npm (P1)
- [x] 9. README/CONTRIBUTING (P1)
- [x] 10. HTML protótipos (P2)
- [x] 11. Migrações e rastreabilidade (P2)
- [x] 12. Código vs contratos (P2)
- [x] 13. STYLE_GUIDE de documentação (P2)
- [x] 14. Templates PR/Issue e CODEOWNERS (P2)
- [x] 15. Higiene do repositório (P2)
- [x] 16. MODULE_STATUS e roadmap (P2)
- [x] 17. Automação de consistência documental (P2)
- [x] 18. Segurança operacional (P2)
- [ ] 19. Internacionalização/terminologia (P3)
- [ ] 20. Validação contínua (P3)
- [ ] 21. Submeter solução (✓ final)

Observação: o item 21 só será marcado quando todo o escopo planejado estiver concluído e validado.

---

## P0 — Detalhamento e status

### 1) Segurança e segredos (P0) — Status: CONCLUÍDO (com pendências acompanhadas)
Objetivo: eliminar risco de segredos versionados e definir processo de rotação/boas práticas.

Subitens e linha-a-linha:
- [x] Confirmar política de ignorar `.env*` no VCS via `.gitignore` (já presente) — Evidência: `.gitignore` existente.
- [x] Verificar existência de `.env*` versionados para remoção do índice do Git — Resultado: nenhum arquivo `.env*` versionado; tentativa de `git rm --cached` confirmou ausência.
- [x] Criar/atualizar plano formal de rotação de chaves Supabase (ANON, SERVICE ROLE), escopo e instruções — Documento: [`docs/reviews/SECRETS_ROTATION.md`](../reviews/SECRETS_ROTATION.md).
- [x] Documentar higienização local e exemplos — Exemplos existentes confirmados: `*.example` para ambientes locais/online.
- [ ] Adotar varredura automatizada de segredos em PRs (ex.: `gitleaks`/`trufflehog`) — PLANEJADO (P1→P2, acompanhar em CI/CD). Racional: boa prática contínua.

Entregas P0 ligadas a este item:
- Plano de rotação: [`SECRETS_ROTATION.md`](../reviews/SECRETS_ROTATION.md).

---

### 2) CI/CD e qualidade (P0) — Status: CONCLUÍDO
Objetivo: garantir que PRs não quebrem o build nem a documentação.

Subitens e linha-a-linha:
- [x] Adicionar job de verificação de links de documentação (quebra PR se houver links relativos quebrados) — Arquivo: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).
- [x] Validar localmente `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` — Todos passaram (ver seção Evidências).
- [ ] Tornar jobs obrigatórios na proteção de branch (config UI do GitHub) — A FAZER (ação manual no GitHub). Runbook: [`docs/runbooks/branch-protection.md`](../runbooks/branch-protection.md) (já existente).
- [ ] Adicionar varredura de segredos como etapa de CI (ver item 1) — PLANEJADO (depende de escolha de ferramenta).

Entregas P0 ligadas a este item:
- Workflow de CI com “Docs Link Check”: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).
- Relatório recente de links: [`docs/reviews/DOCS_LINK_CHECK.md`](../reviews/DOCS_LINK_CHECK.md).

---

### 3) ADRs formais (P0) — Status: CONCLUÍDO
Objetivo: institucionalizar decisões arquiteturais canônicas.

Subitens e linha-a-linha:
- [x] Criar estrutura `docs/architecture/decisions/` com índice e template — Entregue.
- [x] Redigir ADRs base (001–006):
  - [x] ADR-001: Contract-Driven Development — [`ADR-001-contract-driven-development.md`](../architecture/decisions/ADR-001-contract-driven-development.md)
  - [x] ADR-002: Multi-tenant + RLS — [`ADR-002-multi-tenant-rls.md`](../architecture/decisions/ADR-002-multi-tenant-rls.md)
  - [x] ADR-003: Soft delete — [`ADR-003-soft-delete.md`](../architecture/decisions/ADR-003-soft-delete.md)
  - [x] ADR-004: UI padrão Dynamics — [`ADR-004-ui-dynamics-standard.md`](../architecture/decisions/ADR-004-ui-dynamics-standard.md)
  - [x] ADR-005: Tenancy via `app_metadata` no JWT — [`ADR-005-tenancy-app-metadata-jwt.md`](../architecture/decisions/ADR-005-tenancy-app-metadata-jwt.md)
  - [x] ADR-006: Política de e-mail no DB (check simples; validação forte no app) — [`ADR-006-email-validation-db-policy.md`](../architecture/decisions/ADR-006-email-validation-db-policy.md)
- [x] Incluir apontador para ADRs no hub `docs/README.md` — CONCLUÍDO em P1 (item 4). Link adicionado para `./architecture/decisions/`.

Entregas P0 ligadas a este item:
- Pasta e ADRs: [`docs/architecture/decisions/`](../architecture/decisions/)

---

## P1 — Detalhamento (CONCLUÍDO)

Nota: P1 concluído. Abaixo, os itens e suas marcações de execução/evidências.

### 4) Consolidação de documentação (P1)
Objetivo: reduzir redundância, consolidar fontes canônicas e arquivar cópias históricas.

Subitens e linha-a-linha:
- [x] Revisar todos os “satélites” e garantir apontamento para docs canônicos (ex.: `SYSTEM_ARCHITECTURE.md`). Status: verificado — `ARCHITECTURE_REAL.md` e `REPO_MAP.md` já são satélites mínimos; `CODEX_GUIDE.md` contém aviso de canonicidade e seção de notas arquivadas.
- [x] Marcar e mover conteúdo histórico para seções “Arquivado/Histórico” sem apagar fatos (manter links). Status: verificado — conteúdo já consolidado/arquivado anteriormente; sem novas mudanças nesta etapa.
- [x] Centralizar políticas/processos em `docs/process/` e evitar duplicação em `runbooks/` e `architecture/`. Status: verificado — sem duplicações novas após revisão.
- [x] Reexecutar link-check e atualizar [`DOCS_LINK_CHECK.md`](../reviews/DOCS_LINK_CHECK.md). Status: executado — sem links relativos quebrados; relatório atualizado.

Critérios de aceite:
- Nenhuma seção com duplicação pesada do conteúdo canônico.
- Links relativos íntegros em toda `docs/`.

---

### 5) Índices/contratos por módulo/aba (P1)
Objetivo: cobertura clara de contratos por módulo e por aba, com status.

Subitens e linha-a-linha:
- [x] Expandir [`docs/MODULE_STATUS.md`](../MODULE_STATUS.md) com colunas: Módulo, Abas, Contratos, Runbooks, Status, Evidência (PR/migration). — CONCLUÍDO
- [x] Criar/atualizar índices por módulo (ex.: `docs/contracts/pacientes/INDEX.md`) listando ABAs e contratos relevantes. — CONCLUÍDO para Pacientes
- [x] Relacionar gaps de contratos no [`OPEN_TODO.md`](../architecture/OPEN_TODO.md) com prioridade P1 e link de evidência. — CONCLUÍDO (seção "Gaps de contratos (P1)")

Critérios de aceite:
- Todo módulo visível no produto tem pelo menos um índice e referência de contrato ou gap explícito.

---

### 6) Backlog OPEN_TODO alinhado (P1)
Objetivo: `OPEN_TODO.md` como backlog real (P0/P1/P2) com evidências de done.

Subitens e linha-a-linha:
- [x] Revisar e alinhar prioridades (P0/P1/P2), garantindo itens concluídos em “Concluídos (com evidência)”. — CONCLUÍDO (incluídas entregas P0: ADRs 001–006, Docs Link Check, Segredos/rotação)
- [x] Para cada item concluído, incluir link de evidência (PR, commit, migration, contrato, runbook). — CONCLUÍDO (links para pastas/PR #6)
- [ ] Opcional: abrir Issues no GitHub para itens P1 e linkar do `OPEN_TODO.md` (sincronização leve). — EM ABERTO

---

### 7) Runbooks (lacunas) (P1)
Objetivo: eliminar lacunas operacionais e alinhar com canônicos.

Subitens e linha-a-linha:
- [x] Identificar runbooks faltantes (exemplos do diagnóstico anterior: políticas de Storage para fotos em ABA01; endpoint unificado de Auditoria).
- [x] Criar esqueleto mínimo dos runbooks faltantes com links canônicos. — Criados: [`runbooks/auditoria-endpoint.md`](../runbooks/auditoria-endpoint.md) e [`runbooks/storage-photos-aba01.md`](../runbooks/storage-photos-aba01.md)
- [x] Validar que `docs/runbooks/ONBOARDING.md` aponta para os novos runbooks quando aplicável. — Linkados na seção "Runbooks específicos"

---

### 8) Scripts npm (P1)
Objetivo: padronizar comandos e facilitar verificação local.

Subitens e linha-a-linha:
- [x] Garantir script `verify` agregando: `lint`, `typecheck`, `build` e `docs:links`. — CONCLUÍDO
  - Implementado `scripts/docs-link-check.ps1` (PowerShell) e agregado ao `verify` via `package.json`.
- [x] Documentar scripts no `README.md` e em `docs/runbooks/`. — CONCLUÍDO (READMEs já mencionam `verify`; ONBOARDING cobre verificação)
- [x] Validar execução em CI e local. — CONCLUÍDO (CI + rodadas locais bem-sucedidas)

---

### 9) README/CONTRIBUTING (P1)
Objetivo: governança clara para contribuidores.

Subitens e linha-a-linha:
- [x] Atualizar `CONTRIBUTING.md` com: política de docs no mesmo PR, convenção de commits, exigência de link-check. — CONCLUÍDO
- [x] Garantir que `README.md` (raiz) e `docs/README.md` mencionem o gate de links do CI e apontem para hubs canônicos. — CONCLUÍDO

---

## P2/P3 — Visão geral (atualizado)

- 10) HTML protótipos (P2): alinhar protótipos com contratos e rotular como “não canônico”. — CONCLUÍDO (README em `html/` criado com avisos e links canônicos)
- 11) Migrações e rastreabilidade (P2): fluxo Contrato→Migration→Types→Actions→UI com rastreabilidade (links de evidência). — CONCLUÍDO (runbook reforçado com checklist de rastreio e template de cabeçalho)
- 12) Código vs contratos (P2): auditoria de aderência; abrir issues para desvios. — CONCLUÍDO (ABA01 verificado; sem desvios críticos)
  - Notas de verificação (fontes: `src/components/patient/DadosPessoaisTab.tsx`, `src/app/pacientes/[id]/PatientPageClient.tsx`, `src/types/supabase.ts`, contrato `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`):
    - `doc_validation_method`/`doc_validation_source`: nomes aderentes ao contrato (evitar `document_validation_method`).
    - `cpf_status`: enum (`valid`/`invalid`/`unknown`) aderente ao contrato; default tratado no DB/contrato; schema aceita valores válidos.
    - E-mail: normalização + regex simples no app (alinhado ao ADR‑006: check simples no DB, validação forte no app).
  - Observação: manter auditoria contínua conforme novas ABAs/ações forem implementadas.
- 13) STYLE_GUIDE de documentação (P2): guias de título, links, seções, status. — CONCLUÍDO (criado `docs/STYLE_GUIDE.md`)
- 14) Templates PR/Issue e CODEOWNERS (P2): padronizar governança de contribuição e revisão. — CONCLUÍDO: adicionados templates de Issue (bug/feature), `CODEOWNERS` (owner padrão @RenatoMazzarino) e reforçado PR template com checklist de rastreabilidade/Docs Link Check
- 15) Higiene do repositório (P2): remover arquivos órfãos, normalizar EOL, pastas vazias só com `.gitkeep` quando necessário. — CONCLUÍDO: ampliado `.gitattributes` para normalização de EOL (LF em fontes/docs; CRLF para scripts Windows) + READMEs criados para pastas vazias:
  - `docs/architecture/database/README.md` (propósito dos diagramas/ERDs; links canônicos)
  - `docs/repo_antigo/snapshots/README.md` (histórico não canônico; apontar canônicos)
  - `src/features/pacientes/mappers/README.md` (diretrizes de mapeadores DB↔DTO/UI)
- 16) MODULE_STATUS e roadmap (P2): roadmap por módulo com marcos e evidências. — CONCLUÍDO (seção "Roadmap por módulo (P2)" adicionada em `docs/MODULE_STATUS.md`)
- 17) Automação de consistência documental (P2): lint de Markdown, checagem de âncoras, verificação de TOCs. — CONCLUÍDO: adicionado job "Docs Markdown Lint (soft)" no CI (markdownlint-cli2) com config inicial `.markdownlint.jsonc`; gate forte permanece o Link Check
- 18) Segurança operacional (P2): runbooks de incidentes, backups, acesso e rotação programada. — CONCLUÍDO: criados `docs/runbooks/security-incident-response.md` e `docs/runbooks/security-backups-access-rotation.md` (esqueletos) e referenciados no ONBOARDING
- 19) Internacionalização/terminologia (P3): glossário e política de idioma, termos médicos/legais.
- 20) Validação contínua (P3): cadência de revisão mensal com checklist e owners.
- 21) Submeter solução (✓ final): fechar PR guarda-chuva e gerar release notes.

---

## Evidências e referências

- CI (Docs Link Check): [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- Relatório de links: [`docs/reviews/DOCS_LINK_CHECK.md`](../reviews/DOCS_LINK_CHECK.md)
- Plano de rotação de segredos: [`docs/reviews/SECRETS_ROTATION.md`](../reviews/SECRETS_ROTATION.md)
- ADRs 001–006 e índice/template: [`docs/architecture/decisions/`](../architecture/decisions/)
- Sistema de arquitetura (canônico): [`docs/architecture/SYSTEM_ARCHITECTURE.md`](../architecture/SYSTEM_ARCHITECTURE.md)
- Backlog técnico: [`docs/architecture/OPEN_TODO.md`](../architecture/OPEN_TODO.md)
- Hub de documentação: [`docs/README.md`](../README.md)
- Onboarding: [`docs/runbooks/ONBOARDING.md`](../runbooks/ONBOARDING.md)
- Status de módulos: [`docs/MODULE_STATUS.md`](../MODULE_STATUS.md)
- Protótipos HTML (não canônicos): [`html/README.md`](../../html/README.md)
- Workflow de migrations (rastreabilidade): [`docs/runbooks/migrations-workflow.md`](../runbooks/migrations-workflow.md)
 - STYLE GUIDE: [`docs/STYLE_GUIDE.md`](../STYLE_GUIDE.md)
 - Templates de Issue: [`.github/ISSUE_TEMPLATE/`](../../.github/ISSUE_TEMPLATE/)
 - CODEOWNERS: [`.github/CODEOWNERS`](../../.github/CODEOWNERS)
 - PR template: [`.github/pull_request_template.md`](../../.github/pull_request_template.md)
 - Normalização de EOL: [`.gitattributes`](../../.gitattributes)
 - READMEs de higiene: [`docs/architecture/database/README.md`](../architecture/database/README.md), [`docs/repo_antigo/snapshots/README.md`](../repo_antigo/snapshots/README.md), `src/features/pacientes/mappers/README.md`
 - Lint de Markdown (soft): CI job `docs_markdown_lint` em [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) + configuração [`.markdownlint.jsonc`](../../.markdownlint.jsonc)
 - Script local de link-check: [`scripts/docs-link-check.ps1`](../../scripts/docs-link-check.ps1)
 - Scripts npm (package): [`package.json`](../../package.json) — scripts `verify` e `docs:links`
 - Segurança operacional (runbooks): [`docs/runbooks/security-incident-response.md`](../runbooks/security-incident-response.md), [`docs/runbooks/security-backups-access-rotation.md`](../runbooks/security-backups-access-rotation.md)

---

## Histórico de atualizações deste plano

- 2025-12-17: criação inicial do plano unificado; P0 marcado como concluído; inclusão de branch `chore/repo-governance-docs-p0-p3` e referência ao PR #6 (Draft) como guarda-chuva; detalhamento de P1 planejado.
- 2025-12-17: P1.4 (Consolidação) — adicionado link explícito para ADRs no hub `docs/README.md`; subitem marcado como concluído.
- 2025-12-17: P1.5 (parcial) — criado `contracts/pacientes/INDEX.md` e expandido `MODULE_STATUS.md`; link-check atualizado.
- 2025-12-17: P1.6 — `OPEN_TODO.md` alinhado com P0 concluído e P1 atualizado; adicionadas evidências; pendente abrir issues para alguns itens.
- 2025-12-17: P1.7 — adicionados runbooks (auditoria endpoint; storage fotos ABA01) e referenciados no ONBOARDING; link-check atualizado.
- 2025-12-17: P1.8 — scripts npm concluídos: adicionado `docs:links` (PowerShell) e agregado ao `verify` em `package.json`.
- 2025-12-17: P1.9 — atualizados CONTRIBUTING.md (governança, convenção de commits, link-check) e READMEs (raiz/docs) com menção ao gate de links do CI.
- 2025-12-17: P1.5 — gaps de contratos adicionados ao `OPEN_TODO.md` com DoD e evidências (INDEX de Pacientes, MODULE_STATUS, CODEX_GUIDE, SYSTEM_ARCHITECTURE).
- 2025-12-17: P2.10 — criado `html/README.md` rotulando protótipos como “não canônico” e apontando para fontes canônicas.
- 2025-12-17: P2.11 — reforçado `migrations-workflow.md` com template de cabeçalho e checklist de rastreabilidade ponta a ponta.
 - 2025-12-17: P2.13 — criado `docs/STYLE_GUIDE.md` (padrões de títulos, links, status, seções por tipo de doc e governança de rastreabilidade).
 - 2025-12-17: P2.12 — auditoria código↔contratos (ABA01) concluída sem desvios críticos; manter verificação contínua em novas ABAs.
 - 2025-12-17: P2.14 — adicionados templates de Issue (bug_report/feature_request), `CODEOWNERS` (owner padrão @RenatoMazzarino) e reforçado `pull_request_template.md` com checklist de rastreabilidade e Docs Link Check.
 - 2025-12-17: P2.15 — higiene concluída: ampliado `.gitattributes` (EOL), criados READMEs (architecture/database, repo_antigo/snapshots, pacientes/mappers) e diagnóstico finalizado (sem deleções).
 - 2025-12-17: P2.16 — adicionado roadmap por módulo em `docs/MODULE_STATUS.md` com marcos P1/P2.
 - 2025-12-17: P2.17 — automação de docs ativa: job de lint de Markdown (soft) com markdownlint-cli2 e config conservadora; Link Check segue como gate forte.
 - 2025-12-17: P2.18 — segurança operacional: criados runbooks (incident-response, backups/access/rotation) e ONBOARDING atualizado.

---

## Governança deste documento

- Este arquivo é o ponto único de verdade do planejamento P0–P3.
- Toda execução deve:
  - Atualizar status dos itens e subitens (com data e links de evidência).
  - Incluir novos subitens quando descobertos; se forem críticos, reclassificar como P0 com justificativa.
  - Remover/arquivar itens obsoletos com justificativa e link de evidência.
- Os links devem ser relativos quando apontarem para este repositório; links externos apenas quando necessário (ex.: PR no GitHub).
