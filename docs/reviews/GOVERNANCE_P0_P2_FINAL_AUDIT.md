# Auditoria Inicial — Governança P0–P2 (Baseline antes do polimento final)

Data: 2025-12-17
Branch: `chore/governance-p0-p2-finalize`
Fonte do plano: [`docs/reviews/PLANO_GOVERNANCA_REPO_P0-P3.md`](./PLANO_GOVERNANCA_REPO_P0-P3.md)

## Sumário executivo
- Build base OK: `npm ci` • `npm run lint` • `npm run typecheck` • `npm run build` • `npm run docs:links` (0 links quebrados).
- Higiene corrigida: removido leftover não versionado `scripts/docs-link-check.cjs` que quebrava o lint.
- Gates atuais: Link-check (hard) OK; Markdownlint (soft) — precisa elevar; Secret scanning — inexistente (precisa adicionar como gate forte).
- Runbooks “esqueleto”: segurança (2), auditoria endpoint, storage fotos ABA01 — precisam virar 100% acionáveis.

## Tabela por item do plano (P0–P2)

| Item | Implementado? | Qualidade | Ações necessárias |
|---|---|---|---|
| P0.1 Segurança/Segredos | Parcial | Precisa elevar | Adicionar secret scanning no CI (gitleaks), runbook de secrets scanning, varredura local agressiva, elevar SECRETS_ROTATION com checklists por provedor |
| P0.2 CI/CD e qualidade | Parcial | Precisa elevar | Adicionar concurrency, nomes de jobs estáveis, artefatos; revisar caching; runbook de Branch Protection com nomes exatos + checklist de evidência |
| P0.3 ADRs formais | Sim | OK | Revisar formatação/estrutura conforme STYLE_GUIDE; criar tabela-índice decisions/README.md |
| P1.4 Consolidação de docs | Sim | OK | Consolidar quaisquer sobras em `docs/archive/` se ainda houver duplicidades marginalmente úteis; evidência final |
| P1.5 Índices/Contratos | Sim | OK | Criar template `MODULE_INDEX_TEMPLATE.md`; verificar módulos sem índice e atualizar hub |
| P1.6 OPEN_TODO alinhado | Sim | OK | Adicionar seção “GitHub Issues Mapping” com títulos/labels sugeridos |
| P1.7 Runbooks (lacunas) | Parcial | Precisa elevar | Completar os 4 runbooks (objetivo, pré-req, passo a passo, validação, rollback, logs, troubleshooting, compliance) |
| P1.8 Scripts npm | Sim | OK | Manter `docs:links` e agregar `docs:lint` quando endurecermos o markdownlint |
| P1.9 README/CONTRIBUTING | Sim | OK | Sem ações |
| P2.10 HTML protótipos | Sim | OK | Sem ações |
| P2.11 Migrações/rastreio | Sim | OK | Sem ações |
| P2.12 Código vs contratos | Sim | OK | Sem ações (ABA01 auditada) |
| P2.13 STYLE_GUIDE | Sim | OK | Sem ações |
| P2.14 Templates/CODEOWNERS | Sim | OK | Sem ações |
| P2.15 Higiene | Parcial | Precisa elevar | Reauditar órfãos/duplicados; mover histórico p/ `docs/archive/` quando aplicável; confirmar .gitattributes completa |
| P2.16 MODULE_STATUS/roadmap | Sim | OK | Sem ações |
| P2.17 Automação de docs | Parcial | Precisa elevar | Transformar markdownlint em gate forte após zerar ruído e definir regras realistas |
| P2.18 Segurança operacional | Parcial | Precisa elevar | Completar conteúdo operacional dos dois runbooks de segurança |

Legenda “Qualidade”: OK = pronto para produção; Precisa elevar = faltar gate forte, conteúdo acionável, ou checklist de validação.

## Arquivos envolvidos por item

- P0.1 Segurança/Segredos: `.github/workflows/ci.yml`, `docs/reviews/SECRETS_ROTATION.md`, (a criar) `docs/runbooks/security-secrets-scanning.md`, (a criar) `.gitleaks.toml`.
- P0.2 CI/CD: `.github/workflows/ci.yml`, `README.md`, `docs/runbooks/branch-protection.md`, (a criar) `docs/reviews/BRANCH_PROTECTION_CHECKLIST.md`.
- P0.3 ADRs: `docs/architecture/decisions/*`, (a aprimorar) `docs/architecture/decisions/README.md` (índice em tabela).
- P1.4 Consolidação: `docs/README.md`, `docs/architecture/SYSTEM_ARCHITECTURE.md`, `docs/process/ai/CODEX_GUIDE.md`, `docs/architecture/{ARCHITECTURE_REAL.md,REPO_MAP.md}`, (a criar) `docs/reviews/DOCS_CONSOLIDATION_FINAL.md`, `docs/archive/`.
- P1.5 Índices/Contratos: `docs/contracts/pacientes/INDEX.md`, (a criar) `docs/contracts/_templates/MODULE_INDEX_TEMPLATE.md`, `docs/MODULE_STATUS.md`, `docs/README.md`.
- P1.6 OPEN_TODO: `docs/architecture/OPEN_TODO.md` (acrescentar “GitHub Issues Mapping”).
- P1.7 Runbooks lacunas: `docs/runbooks/{auditoria-endpoint.md,storage-photos-aba01.md}`.
- P1.8 Scripts npm: `package.json`, `scripts/docs-link-check.ps1` (OK), (a criar) `scripts/docs-markdown-lint.*` (opcional), `.markdownlint.jsonc`.
- P1.9 README/CONTRIBUTING: `README.md`, `docs/README.md`, `CONTRIBUTING.md`.
- P2.10 HTML: `html/README.md`.
- P2.11 Migrações: `docs/runbooks/migrations-workflow.md`.
- P2.12 Código vs contratos: `src/types/supabase.ts`, `src/features/pacientes/**`, `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`.
- P2.13 STYLE_GUIDE: `docs/STYLE_GUIDE.md`.
- P2.14 Templates/CODEOWNERS: `.github/ISSUE_TEMPLATE/*`, `.github/CODEOWNERS`, `.github/pull_request_template.md`.
- P2.15 Higiene: `.gitattributes`, `docs/architecture/database/README.md`, `docs/repo_antigo/snapshots/README.md`, `src/features/pacientes/mappers/README.md`, (removido) `scripts/docs-link-check.cjs`.
- P2.16 MODULE_STATUS: `docs/MODULE_STATUS.md`.
- P2.17 Automação docs: `.github/workflows/ci.yml` (job markdownlint), `.markdownlint.jsonc`.
- P2.18 Segurança operacional: `docs/runbooks/{security-incident-response.md,security-backups-access-rotation.md}`.

## Achados de gaps, redundâncias e “soft/esqueleto”

- Secret scanning inexistente (gap P0.1). Ação: adicionar job “Secrets Scan” (gitleaks) em CI com falha em achados e artefato de relatório.
- Markdownlint soft (gap P2.17). Ação: reduzir ruído (ajustar regras e/ou corrigir docs) e tornar gate forte; incluir script local `docs:lint` e integrar ao `verify`.
- Runbooks com “(esqueleto)” no ONBOARDING (P1.7/P2.18): auditoria endpoint, storage fotos ABA01, segurança (2). Ação: completar conteúdo com seções obrigatórias e validação.
- Higiene residual (P2.15): revisar se há arquivos órfãos restantes; mover histórico para `docs/archive/` quando aplicável.

## Riscos e plano de correção (checklist executável)

1) Secret scanning (gate forte)
- [ ] Adicionar job “Secrets Scan” no CI (gitleaks), rodando em push/PR, com upload de `gitleaks.sarif`/`json`.
- [ ] Adicionar `.gitleaks.toml` com allowlist mínimo (evitar falsos positivos óbvios) e documentar baseline quando necessário.
- [ ] Criar `docs/runbooks/security-secrets-scanning.md` com: rodar local, atualizar baseline, agir em vazamento.
- [ ] Rodar varredura local agressiva e registrar evidência em `SECRETS_ROTATION.md`.

2) CI hardening
- [ ] Adicionar `concurrency` (cancel in-progress do mesmo PR) no workflow principal.
- [ ] Fixar Node 20.x documentado e manter cache npm.
- [ ] Padronizar nomes dos jobs: "CI", "Docs Link Check", "Docs Markdown Lint", "Secrets Scan".
- [ ] Upload de artefatos (relatórios) para link-check, markdownlint e secrets.
- [ ] Atualizar `docs/runbooks/branch-protection.md` com nomes exatos e passo-a-passo + `docs/reviews/BRANCH_PROTECTION_CHECKLIST.md`.

3) Markdownlint → hard gate
- [ ] Rodar markdownlint localmente; ajustar `.markdownlint.jsonc` para regras realistas (desabilitar MD013/MD033 se necessário, manter MD024/MD025/MD012 etc.).
- [ ] Corrigir violações triviais em `docs/` ou justificar em config.
- [ ] Tornar job do CI hard (remover `continue-on-error`).
- [ ] Adicionar script `docs:lint` e integrar ao `verify`.

4) Runbooks 100% acionáveis
- [ ] Completar 4 runbooks (segurança x2, auditoria endpoint, storage fotos ABA01) com: objetivo, pré-requisitos, passo-a-passo, validação, rollback, logs, troubleshooting, compliance.
- [ ] Criar `docs/reviews/RUNBOOKS_FINAL_REVIEW.md` com checklist de completude.

5) Consolidação final & higiene
- [ ] Rodar varredura de duplicidades/restos; mover para `docs/archive/` quando histórico.
- [ ] Atualizar links; rodar link-check e publicar snapshot.

6) ADRs qualidade
- [ ] Revisar ADR-001..006 e decisions/README.md (tabela sumarizada), seguindo `docs/STYLE_GUIDE.md`.

---

### Evidências desta auditoria
- Execução local: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run docs:links` — OK.
- Correção de higiene: remoção de `scripts/docs-link-check.cjs` (não versionado) para destravar `eslint`.
- Relatório de links regenerado: [`docs/reviews/DOCS_LINK_CHECK.md`](./DOCS_LINK_CHECK.md) — 0 quebrados.
