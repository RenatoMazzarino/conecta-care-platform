# Governança P0–P2 — Relatório Final

Data: 2025-12-18
Branch: `chore/governance-p0-p2-finalize`

-## Resumo do que mudou

- CI endurecido com concurrency, jobs estáveis, artefatos e gates (Docs Link Check, Docs Markdown Lint, Secrets Scan).
- Secret scanning (gitleaks) configurado com runbook e plano de rotação operacional.
- Runbooks finalizados (sem esqueleto) e revisão registrada.
- Índices de contratos por módulo + template e `OPEN_TODO.md` com owners + issues mapping.
- Consolidação/higiene de docs com `docs/archive/` e relatório de consolidação.

-## Commits

- Nenhum commit criado nesta branch (alterações locais).

-## Como validar

1) `npm run verify`
2) Conferir relatórios:
   - `docs/reviews/DOCS_LINK_CHECK.md`
   - `docs/reviews/DOCS_MARKDOWN_LINT.md`
3) No CI, validar jobs: **CI**, **Docs Link Check**, **Docs Markdown Lint**, **Secrets Scan**.

-## Pendências fora do repo (ação manual)

- Ativar proteção de branch conforme `docs/runbooks/branch-protection.md`.
- Preencher evidências em `docs/reviews/BRANCH_PROTECTION_CHECKLIST.md`.

-## Evidências principais

- `docs/reviews/PLANO_GOVERNANCA_REPO_P0-P3.md`
- `docs/reviews/DOCS_CONSOLIDATION_FINAL.md`
- `docs/reviews/RUNBOOKS_FINAL_REVIEW.md`
- `docs/reviews/SECRETS_ROTATION.md`
- `docs/reviews/DOCS_LINK_CHECK.md`
- `docs/reviews/DOCS_MARKDOWN_LINT.md`
