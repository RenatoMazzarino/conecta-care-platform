# AI Tooling do Projeto

Este repositório utiliza uma esteira de desenvolvimento com múltiplas ferramentas de IA, com papéis bem definidos para evitar confusão e retrabalho.

## Ferramentas e papéis

### 1) Codex (VS Code) — Implementação
**Uso:** executar mudanças no código, criar arquivos, refatorar, aplicar padrões definidos, preparar migrations e integrar UI com backend.
**Regra:** o Codex implementa; decisões de produto/arquitetura devem estar documentadas (contratos/ADRs).

### 2) ChatGPT — Decisão e direção técnica
**Uso:** discutir arquitetura, criar contratos de abas, definir padrões, gerar prompts para o Codex, revisar decisões e manter consistência do sistema.
**Regra:** ChatGPT não altera o repo diretamente; ele define o plano e os comandos.

### 3) Codex Web — Revisão de Pull Request (PR)
**Uso:** revisor automático de PR. Só atua em PR (não revisa commit isolado).
**Regra:** abrir PR (de preferência Draft) cedo para receber feedback contínuo.

### 4) Vercel Agent — Revisão automática
**Uso:** revisor automático integrado ao fluxo do Vercel/GitHub, focado em qualidade e prevenção de bugs.
**Regra:** considerar o agente como um “revisor adicional”; a decisão final é do mantenedor.

## Fluxo oficial (resumo)
Contrato → Migration → Types → UI → Actions

- Nada de criar tabela/coluna “na mão” sem contrato aprovado.
- Cada aba tem um contrato canônico em: docs/contracts/pacientes/
- Migrations em: supabase/migrations/
- Types são regenerados após migrations e versionados no repo.

## Regras de segurança (secrets)
- Arquivos .env.* nunca devem ser commitados.
- O repo mantém apenas arquivos de exemplo (.example) com placeholders.

