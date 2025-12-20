# Runbook — Branch protection (main)

## Objetivo / quando usar

Ativar proteções na `main` para garantir merge via PR com checks obrigatórios.

## Pré-requisitos

- Acesso de admin ao repositório no GitHub.
- Jobs do CI com nomes estáveis (ver `.github/workflows/ci.yml`).

## Passo a passo (GitHub)

1) Acesse o repositório no GitHub.
2) Vá em **Settings → Branches**.
3) Em **Branch protection rules**, clique em **Add rule**.
4) Em **Branch name pattern**, use: `main`.
5) Configure as opções abaixo.

## Configurações recomendadas (P0)

- **Require a pull request before merging**
  - Require approvals: **1**
  - Require review from Code Owners: **on**
- **Require status checks to pass before merging**
  - Require branches to be up to date before merging: **on**
  - Checks obrigatórios (nomes exatos):
    - **CI**
    - **Docs Link Check**
    - **Docs Markdown Lint**
    - **Secrets Scan**
- **Require conversation resolution before merging**: **on**
- **Do not allow bypassing the above settings**: **on**
- **Require linear history**: **on**
- **Block force pushes**: **on**
- **Restrict deletions**: **on**

## Como validar sucesso

- Abra um PR de teste e verifique que os 4 checks aparecem como “Required”.
- Tente merge sem approval e confirme que o GitHub bloqueia.

## Evidência (print‑instructions)

- Faça um print da tela **Settings → Branches** mostrando a regra `main`.
- Faça um print da seção **Required status checks** com os nomes dos jobs.
- Anexe as imagens ou descreva a validação no arquivo `docs/reviews/analise-governanca-estrutura-2025-12-19/BRANCH_PROTECTION_CHECKLIST.md`.

## Rollback / mitigação

- Em caso de bloqueio emergencial, desative temporariamente apenas o check necessário e reative após o incidente.
- Nunca remova a regra inteira sem registro e justificativa.

## Troubleshooting

- **Job não aparece**: rode um workflow na `main` para registrar o check.
- **Nome do check mudou**: atualize a regra para o nome novo e registre a mudança.

## Segurança e compliance (o que NÃO fazer)

- Não habilite bypass para administradores sem justificativa formal.
- Não permita merge direto na `main`.
