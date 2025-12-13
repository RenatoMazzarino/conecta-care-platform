# Runbook — Branch protection (main)

Este runbook descreve como ativar proteções no GitHub para garantir enforcement do fluxo via PR + CI.

## Objetivo
- Exigir PR para mudanças na `main`
- Exigir CI passando antes de merge
- Bloquear force-push na `main`

## Passo a passo (GitHub)
1) Acesse o repositório no GitHub
2) Vá em **Settings → Branches**
3) Em **Branch protection rules**, clique em **Add rule**
4) Em **Branch name pattern**, use: `main`

## Configurações recomendadas (P0)
- **Require a pull request before merging**
  - (opcional) Require approvals: 1+
  - (opcional) Require review from Code Owners
- **Require status checks to pass before merging**
  - Marcar: **Require branches to be up to date before merging**
  - Selecionar o check do workflow de CI (ex.: `CI / ci`)
- **Require conversation resolution before merging**
- **Do not allow bypassing the above settings**
- **Block force pushes**

## Observações
- O workflow de CI está em: `.github/workflows/ci.yml`
- Se o nome do check mudar, atualize a seleção em **Require status checks**.

