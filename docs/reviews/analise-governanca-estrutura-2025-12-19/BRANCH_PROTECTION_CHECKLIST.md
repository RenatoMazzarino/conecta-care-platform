# Branch Protection — Checklist de Configuração (main)

Data: 2025-12-19
Status: OK (configurado no GitHub)

Este checklist documenta o que deve ser configurado manualmente no GitHub para a branch `main`.

## Regras principais

| Item | Status | Evidência |
| --- | --- | --- |
| Require a pull request before merging | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Require approvals (1+) | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Require review from Code Owners | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Require status checks to pass before merging | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Require branches to be up to date | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Required checks: CI | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Required checks: Docs Link Check | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Required checks: Docs Markdown Lint | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Required checks: Secrets Scan | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Require conversation resolution before merging | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Do not allow bypassing the above settings | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Require linear history | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Block force pushes | OK | Confirmado em 2025-12-19 (GitHub UI) |
| Restrict deletions | OK | Confirmado em 2025-12-19 (GitHub UI) |

## Como preencher

1) Siga o runbook em `docs/runbooks/branch-protection.md`.
2) Observação: os checks só aparecem no dropdown depois de rodarem pelo menos 1x em PR ou push na branch alvo.
3) Após configurar, atualize o status para “OK” e adicione a evidência (print ou descrição do PR de teste).
