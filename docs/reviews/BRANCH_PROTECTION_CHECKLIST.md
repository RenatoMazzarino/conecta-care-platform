# Branch Protection — Checklist de Configuração (main)

Data: 2025-12-18
Status: PENDENTE (ação manual no GitHub)

Este checklist documenta o que deve ser configurado manualmente no GitHub para a branch `main`.

## Regras principais

| Item | Status | Evidência |
| --- | --- | --- |
| Require a pull request before merging | PENDENTE | Print da regra `main` |
| Require approvals (1+) | PENDENTE | Print da regra `main` |
| Require review from Code Owners | PENDENTE | Print da regra `main` |
| Require status checks to pass before merging | PENDENTE | Print da regra `main` |
| Require branches to be up to date | PENDENTE | Print da regra `main` |
| Required checks: CI | PENDENTE | Print da lista de checks |
| Required checks: Docs Link Check | PENDENTE | Print da lista de checks |
| Required checks: Docs Markdown Lint | PENDENTE | Print da lista de checks |
| Required checks: Secrets Scan | PENDENTE | Print da lista de checks |
| Require conversation resolution before merging | PENDENTE | Print da regra `main` |
| Do not allow bypassing the above settings | PENDENTE | Print da regra `main` |
| Require linear history | PENDENTE | Print da regra `main` |
| Block force pushes | PENDENTE | Print da regra `main` |
| Restrict deletions | PENDENTE | Print da regra `main` |

## Como preencher

1) Siga o runbook em `docs/runbooks/branch-protection.md`.
2) Observação: os checks só aparecem no dropdown depois de rodarem pelo menos 1x em PR ou push na branch alvo.
3) Após configurar, atualize o status para “OK” e adicione a evidência (print ou descrição do PR de teste).
