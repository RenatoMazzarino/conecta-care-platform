# PR Draft — Finalizar P0–P2 (Governança do Repositório)

Base: `chore/repo-governance-docs-p0-p3`  
Head: `chore/governance-p0-p2-finalize`

## Objetivo

Concluir P0–P2 de governança com gates fortes (CI, docs, segredos), runbooks operacionais e documentação consolidada, prontos para revisão séria e adoção como padrão do repositório.

## Commits

- 6a456f3 ci: harden pipeline (concurrency, stable jobs, artifacts, docs/links, markdownlint, secrets)
- a4d5d03 chore(docs): add docs tooling (link-check node, docs:lint) and update verify
- 63fcac7 docs(security): finalize secrets rotation and security runbooks
- 8e9fe5e docs(runbooks): finalize operational runbooks and validation steps
- 2227ac4 docs(adr): strengthen ADRs (owners, alternatives, references)
- 15b3930 docs: consolidate documentation, archive legacy, and align module indexes
- 10407ca docs(reviews): add final audit/report and update governance plan
- 6c70d68 docs: align contribution workflow and PR standards
- 4a416bb chore: cleanup remaining governance tweaks

## Validação local

- `npm ci`
- `npm run verify`
- `npm run docs:links` (relatório: `docs/reviews/DOCS_LINK_CHECK.md`)
- `npm run docs:lint` (relatório: `docs/reviews/DOCS_MARKDOWN_LINT.md`)
- `gitleaks detect --config .gitleaks.toml --report-format json --report-path docs/reviews/GITLEAKS_REPORT.json`

## Checks de CI esperados (para branch protection)

- CI
- Docs Link Check
- Docs Markdown Lint
- Secrets Scan

## Evidências

- Plano e auditorias: `docs/reviews/PLANO_GOVERNANCA_REPO_P0-P3.md`, `docs/reviews/GOVERNANCE_P0_P2_FINAL_AUDIT.md`, `docs/reviews/GOVERNANCE_P0_P2_FINAL_REPORT.md`
- Segurança: `.gitleaks.toml`, `docs/runbooks/security-secrets-scanning.md`, `docs/reviews/SECRETS_ROTATION.md`, `docs/reviews/GITLEAKS_REPORT.json`
- Docs/Runbooks: `docs/reviews/DOCS_LINK_CHECK.md`, `docs/reviews/DOCS_MARKDOWN_LINT.md`, `docs/reviews/DOCS_CONSOLIDATION_FINAL.md`, `docs/reviews/RUNBOOKS_FINAL_REVIEW.md`

## Pendências manuais

- Ativar proteção de branch conforme `docs/runbooks/branch-protection.md` e registrar em `docs/reviews/BRANCH_PROTECTION_CHECKLIST.md`.
