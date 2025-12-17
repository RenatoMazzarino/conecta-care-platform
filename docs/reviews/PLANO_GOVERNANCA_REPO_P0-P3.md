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
- [ ] 4. Consolidação de documentação (P1)
- [ ] 5. Índices/contratos por módulo/aba (P1)
- [ ] 6. Backlog OPEN_TODO alinhado (P1)
- [ ] 7. Runbooks (lacunas) (P1)
- [ ] 8. Scripts npm (P1)
- [ ] 9. README/CONTRIBUTING (P1)
- [ ] 10. HTML protótipos (P2)
- [ ] 11. Migrações e rastreabilidade (P2)
- [ ] 12. Código vs contratos (P2)
- [ ] 13. STYLE_GUIDE de documentação (P2)
- [ ] 14. Templates PR/Issue e CODEOWNERS (P2)
- [ ] 15. Higiene do repositório (P2)
- [ ] 16. MODULE_STATUS e roadmap (P2)
- [ ] 17. Automação de consistência documental (P2)
- [ ] 18. Segurança operacional (P2)
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
  - [x] ADR-004: UI padrão Dynamics — [`ADR-004-ui-dynamics.md`](../architecture/decisions/ADR-004-ui-dynamics.md)
  - [x] ADR-005: Tenancy via `app_metadata` no JWT — [`ADR-005-tenancy-app-metadata-jwt.md`](../architecture/decisions/ADR-005-tenancy-app-metadata-jwt.md)
  - [x] ADR-006: Política de e-mail no DB (check simples; validação forte no app) — [`ADR-006-email-policy.md`](../architecture/decisions/ADR-006-email-policy.md)
- [ ] Incluir apontador para ADRs no hub `docs/README.md` (se ainda não presente) — A VERIFICAR/FAZER em P1.

Entregas P0 ligadas a este item:
- Pasta e ADRs: [`docs/architecture/decisions/`](../architecture/decisions/)

---

## P1 — Detalhamento planejado

Nota: P1 ainda não executado. Abaixo, o plano linha-a-linha para cada item P1.

### 4) Consolidação de documentação (P1)
Objetivo: reduzir redundância, consolidar fontes canônicas e arquivar cópias históricas.

Subitens e linha-a-linha:
- [ ] Revisar todos os “satélites” e garantir apontamento para docs canônicos (ex.: `SYSTEM_ARCHITECTURE.md`).
- [ ] Marcar e mover conteúdo histórico para seções “Arquivado/Histórico” sem apagar fatos (manter links).
- [ ] Centralizar políticas/processos em `docs/process/` e evitar duplicação em `runbooks/` e `architecture/`.
- [ ] Reexecutar link-check e atualizar [`DOCS_LINK_CHECK.md`](../reviews/DOCS_LINK_CHECK.md).

Critérios de aceite:
- Nenhuma seção com duplicação pesada do conteúdo canônico.
- Links relativos íntegros em toda `docs/`.

---

### 5) Índices/contratos por módulo/aba (P1)
Objetivo: cobertura clara de contratos por módulo e por aba, com status.

Subitens e linha-a-linha:
- [ ] Expandir [`docs/MODULE_STATUS.md`](../MODULE_STATUS.md) com colunas: Módulo, Abas, Contratos, Runbooks, Status, Evidência (PR/migration).
- [ ] Criar/atualizar índices por módulo (ex.: `docs/contracts/pacientes/INDEX.md`) listando ABAs e contratos relevantes.
- [ ] Relacionar gaps de contratos no [`OPEN_TODO.md`](../architecture/OPEN_TODO.md) com prioridade P1 e link de evidência.

Critérios de aceite:
- Todo módulo visível no produto tem pelo menos um índice e referência de contrato ou gap explícito.

---

### 6) Backlog OPEN_TODO alinhado (P1)
Objetivo: `OPEN_TODO.md` como backlog real (P0/P1/P2) com evidências de done.

Subitens e linha-a-linha:
- [ ] Revisar e alinhar prioridades (P0/P1/P2), garantindo itens concluídos em “Concluídos (com evidência)”.
- [ ] Para cada item, incluir link de evidência (PR, commit, migration, contrato, runbook).
- [ ] Opcional: abrir Issues no GitHub para itens P1 e linkar do `OPEN_TODO.md` (sincronização leve).

---

### 7) Runbooks (lacunas) (P1)
Objetivo: eliminar lacunas operacionais e alinhar com canônicos.

Subitens e linha-a-linha:
- [ ] Identificar runbooks faltantes (exemplos do diagnóstico anterior: políticas de Storage para fotos em ABA01; endpoint unificado de Auditoria).
- [ ] Criar esqueleto mínimo dos runbooks faltantes com links canônicos.
- [ ] Validar que `docs/runbooks/ONBOARDING.md` aponta para os novos runbooks quando aplicável.

---

### 8) Scripts npm (P1)
Objetivo: padronizar comandos e facilitar verificação local.

Subitens e linha-a-linha:
- [ ] Garantir script `verify` agregando: `lint`, `typecheck`, `build` e `docs:links`.
- [ ] Documentar scripts no `README.md` e em `docs/runbooks/`.
- [ ] Validar execução em CI e local.

---

### 9) README/CONTRIBUTING (P1)
Objetivo: governança clara para contribuidores.

Subitens e linha-a-linha:
- [ ] Atualizar `CONTRIBUTING.md` com: política de docs no mesmo PR, convenção de commits, exigência de link-check.
- [ ] Garantir que `README.md` (raiz) e `docs/README.md` sejam hubs consistentes com links para ADRs, architecture, runbooks, contracts e reviews.

---

## P2/P3 — Visão geral (mantido do plano original)

- 10) HTML protótipos (P2): alinhar protótipos com contratos e rotular como “não canônico”.
- 11) Migrações e rastreabilidade (P2): fluxo Contrato→Migration→Types→Actions→UI com rastreabilidade (links de evidência).
- 12) Código vs contratos (P2): auditoria de aderência; abrir issues para desvios.
- 13) STYLE_GUIDE de documentação (P2): guias de título, links, seções, status.
- 14) Templates PR/Issue e CODEOWNERS (P2): padronizar governança de contribuição e revisão.
- 15) Higiene do repositório (P2): remover arquivos órfãos, normalizar EOL, pastas vazias só com `.gitkeep` quando necessário.
- 16) MODULE_STATUS e roadmap (P2): roadmap por módulo com marcos e evidências.
- 17) Automação de consistência documental (P2): lint de Markdown, checagem de âncoras, verificação de TOCs.
- 18) Segurança operacional (P2): runbooks de incidentes, backups, acesso e rotação programada.
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

---

## Histórico de atualizações deste plano

- 2025-12-17: criação inicial do plano unificado; P0 marcado como concluído; inclusão de branch `chore/repo-governance-docs-p0-p3` e referência ao PR #6 (Draft) como guarda-chuva; detalhamento de P1 planejado.

---

## Governança deste documento

- Este arquivo é o ponto único de verdade do planejamento P0–P3.
- Toda execução deve:
  - Atualizar status dos itens e subitens (com data e links de evidência).
  - Incluir novos subitens quando descobertos; se forem críticos, reclassificar como P0 com justificativa.
  - Remover/arquivar itens obsoletos com justificativa e link de evidência.
- Os links devem ser relativos quando apontarem para este repositório; links externos apenas quando necessário (ex.: PR no GitHub).
