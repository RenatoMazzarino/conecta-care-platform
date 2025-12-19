# Auditoria Inicial — Governança P0–P2 (baseline antes do polimento final)

Data: 2025-12-18
Branch: `chore/governance-p0-p2-finalize`
Fonte do plano: [`docs/reviews/PLANO_GOVERNANCA_REPO_P0-P3.md`](./PLANO_GOVERNANCA_REPO_P0-P3.md)

## Sumário executivo

- Build base OK: `npm ci` • `npm run lint` • `npm run typecheck` • `npm run build` • `npm run verify`.
- Gate atual: Link-check (hard) OK; Markdownlint (soft) precisa virar gate forte; Secret scanning inexistente.
- Runbooks com esqueleto/rascunho: segurança (2), auditoria endpoint, storage fotos ABA01.
- Consolidação/higiene: há documentos históricos fora de `docs/archive/` e índices de contratos incompletos para módulos não-Pacientes.

## Tabela por item do plano (P0–P2)

| Item | Implementado? | Qualidade | Ações necessárias |
| --- | --- | --- | --- |
| P0.1 Segurança/Segredos | Parcial | Precisa elevar | Adicionar secret scanning no CI (gate forte) + runbook; varredura local agressiva; elevar `SECRETS_ROTATION.md` com checklists por provedor e fluxo de incidente |
| P0.2 CI/CD e qualidade | Parcial | Precisa elevar | Adicionar `concurrency`, nomes de jobs estáveis, artefatos de relatórios; runbook de Branch Protection com passo-a-passo + checklist de evidência |
| P0.3 ADRs formais | Sim | Precisa elevar | Padronizar conteúdo (status, contexto, decisão, alternativas, consequências, referências); índice em tabela em `decisions/README.md` |
| P1.4 Consolidação de docs | Parcial | Precisa elevar | Revisar duplicidades e mover histórico para `docs/archive/`; atualizar links e registrar evidência |
| P1.5 Índices/Contratos | Parcial | Precisa elevar | Criar template `MODULE_INDEX_TEMPLATE.md` e índices mínimos para todos os módulos do `MODULE_STATUS.md`; atualizar hubs |
| P1.6 OPEN_TODO alinhado | Parcial | Precisa elevar | Garantir DoD objetivo, owners e evidências; adicionar seção “GitHub Issues Mapping” |
| P1.7 Runbooks (lacunas) | Parcial | Precisa elevar | Completar 4 runbooks com seções obrigatórias (objetivo, pré-req, passo a passo, validação, rollback, logs, troubleshooting, compliance) |
| P1.8 Scripts npm | Parcial | Precisa elevar | Documentar `docs:links` e adicionar `docs:lint` após endurecer markdownlint; garantir cross-plataforma |
| P1.9 README/CONTRIBUTING | Sim | OK | Sem ações |
| P2.10 HTML protótipos | Sim | OK | Sem ações |
| P2.11 Migrações/rastreio | Sim | OK | Sem ações |
| P2.12 Código vs contratos | Sim | OK | Sem ações |
| P2.13 STYLE_GUIDE | Sim | OK | Sem ações |
| P2.14 Templates/CODEOWNERS | Parcial | Precisa elevar | Incluir checks novos (secret scan, markdownlint) no PR template; revisar templates de issues |
| P2.15 Higiene | Parcial | Precisa elevar | Reauditar órfãos/duplicados; mover histórico para `docs/archive/`; revisar `.gitattributes` |
| P2.16 MODULE_STATUS/roadmap | Sim | OK | Sem ações |
| P2.17 Automação docs | Parcial | Precisa elevar | Tornar markdownlint hard gate após zerar ruído e definir regras realistas |
| P2.18 Segurança operacional | Parcial | Precisa elevar | Completar conteúdo operacional dos runbooks de segurança |

Legenda “Qualidade”: OK = pronto para produção; Precisa elevar = falta gate forte, conteúdo acionável, ou checklist de validação.

## Arquivos envolvidos por item

- P0.1 Segurança/Segredos: `.github/workflows/ci.yml`, `docs/reviews/SECRETS_ROTATION.md`, (a criar) `docs/runbooks/security-secrets-scanning.md`, (a criar) `.gitleaks.toml`.
- P0.2 CI/CD: `.github/workflows/ci.yml`, `README.md`, `docs/runbooks/branch-protection.md`, (a criar) `docs/reviews/BRANCH_PROTECTION_CHECKLIST.md`.
- P0.3 ADRs: `docs/architecture/decisions/*`, (a aprimorar) `docs/architecture/decisions/README.md`.
- P1.4 Consolidação: `docs/README.md`, `docs/architecture/SYSTEM_ARCHITECTURE.md`, `docs/process/ai/CODEX_GUIDE.md`, `docs/architecture/{ARCHITECTURE_REAL.md,REPO_MAP.md}`, `docs/research/PROJECT_IMMERSION_REPORT.md`, `docs/code-review.md`, (a criar) `docs/reviews/DOCS_CONSOLIDATION_FINAL.md`, `docs/archive/`.
- P1.5 Índices/Contratos: `docs/contracts/pacientes/INDEX.md`, (a criar) `docs/contracts/_templates/MODULE_INDEX_TEMPLATE.md`, (a criar) `docs/contracts/{escalas,financeiro,prontuarios,agendamentos,home-care-ops,inventario,configuracoes}/INDEX.md`, `docs/MODULE_STATUS.md`, `docs/README.md`.
- P1.6 OPEN_TODO: `docs/architecture/OPEN_TODO.md`.
- P1.7 Runbooks lacunas: `docs/runbooks/{auditoria-endpoint.md,storage-photos-aba01.md}`.
- P1.8 Scripts npm: `package.json`, `scripts/docs-link-check.ps1`, (a criar) `scripts/docs-markdown-lint.*`.
- P1.9 README/CONTRIBUTING: `README.md`, `docs/README.md`, `CONTRIBUTING.md`.
- P2.10 HTML: `html/README.md`.
- P2.11 Migrações: `docs/runbooks/migrations-workflow.md`.
- P2.12 Código vs contratos: `src/types/supabase.ts`, `src/features/pacientes/**`, `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`.
- P2.13 STYLE_GUIDE: `docs/STYLE_GUIDE.md`.
- P2.14 Templates/CODEOWNERS: `.github/ISSUE_TEMPLATE/*`, `.github/CODEOWNERS`, `.github/pull_request_template.md`.
- P2.15 Higiene: `.gitattributes`, `docs/architecture/database/README.md`, `docs/repo_antigo/snapshots/README.md`, `src/features/pacientes/mappers/README.md`.
- P2.16 MODULE_STATUS: `docs/MODULE_STATUS.md`.
- P2.17 Automação docs: `.github/workflows/ci.yml` (job markdownlint), `.markdownlint.jsonc`.
- P2.18 Segurança operacional: `docs/runbooks/{security-incident-response.md,security-backups-access-rotation.md}`.

## Achados de gaps, redundâncias e itens “soft/esqueleto”

- Secret scanning inexistente (gap P0.1). Ação: adicionar job “Secrets Scan” (gitleaks) em CI com falha em achados e artefato de relatório.
- Markdownlint soft (gap P2.17). Ação: reduzir ruído (ajustar regras e/ou corrigir docs) e tornar gate forte; incluir script local `docs:lint`.
- Runbooks com “(rascunho)” (P1.7/P2.18): auditoria endpoint, storage fotos ABA01, segurança (2). Ação: completar conteúdo com seções obrigatórias e validação.
- Índices de contratos incompletos para módulos fora de Pacientes (P1.5). Ação: criar índices mínimos e template por módulo.
- Docs históricos fora de `docs/archive/` (P1.4/P2.15): `docs/code-review.md`, `docs/research/PROJECT_IMMERSION_REPORT.md`.

## Riscos e plano de correção (checklist executável)

1) Secret scanning (gate forte)

- [ ] Adicionar job “Secrets Scan” no CI (gitleaks), rodando em push/PR, com upload de relatório.
- [ ] Adicionar `.gitleaks.toml` com allowlist mínimo e documentação do baseline.
- [ ] Criar `docs/runbooks/security-secrets-scanning.md` (rodar local, atualizar allowlist/baseline, resposta a vazamento).
- [ ] Rodar varredura local agressiva e registrar evidência em `SECRETS_ROTATION.md`.

1) CI hardening

- [ ] Adicionar `concurrency` (cancelar execuções antigas do mesmo PR).
- [ ] Fixar Node 20.x documentado e manter cache npm.
- [ ] Padronizar nomes dos jobs: “CI”, “Docs Link Check”, “Docs Markdown Lint”, “Secrets Scan”.
- [ ] Upload de artefatos para link-check, markdownlint e secrets.
- [ ] Atualizar `docs/runbooks/branch-protection.md` com nomes exatos e checklist + `docs/reviews/BRANCH_PROTECTION_CHECKLIST.md`.

1) Markdownlint → hard gate

- [ ] Rodar markdownlint localmente; ajustar `.markdownlint.jsonc` para regras realistas.
- [ ] Corrigir violações em `docs/`.
- [ ] Tornar job do CI hard (remover `continue-on-error`).
- [ ] Adicionar script `docs:lint` e integrar ao `verify`.

1) Runbooks 100% acionáveis

- [ ] Completar 4 runbooks (segurança x2, auditoria endpoint, storage fotos ABA01) com: objetivo, pré-requisitos, passo a passo, validação, rollback, logs, troubleshooting, compliance.
- [ ] Criar `docs/reviews/RUNBOOKS_FINAL_REVIEW.md` com checklist de completude.

1) Consolidação final & higiene

- [ ] Varredura de duplicidades/restos; mover histórico para `docs/archive/` quando aplicável.
- [ ] Atualizar links; rodar link-check e publicar snapshot.

1) ADRs qualidade

- [ ] Revisar ADR-001..006 e `decisions/README.md` (tabela sumarizada), seguindo `docs/STYLE_GUIDE.md`.

1) Contratos por módulo

- [ ] Criar template `MODULE_INDEX_TEMPLATE.md`.
- [ ] Criar índices mínimos por módulo e atualizar `docs/README.md` + `docs/MODULE_STATUS.md`.

1) OPEN_TODO alinhado

- [ ] Incluir owners e seção “GitHub Issues Mapping” com títulos/labels sugeridos.

---

### Evidências desta auditoria

- Execução local: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run verify` — OK.
- Relatório de links regenerado: [`docs/reviews/DOCS_LINK_CHECK.md`](./DOCS_LINK_CHECK.md) — 0 quebrados.
