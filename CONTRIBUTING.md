# Contribuindo com o repositório

## Princípios
Este repo segue um fluxo rigoroso para manter consistência e rastreabilidade:
Contrato → Migration → Types → UI → Actions

Regra: não criar tabela/coluna sem contrato aprovado.

## Branches e PR
- Não fazer commit direto na `main`.
- Todo trabalho deve passar por PR.
- Sugestão: abrir PR cedo como Draft para receber revisões automáticas durante o desenvolvimento.

Padrão de branches:
- feat/*, fix/*, chore/*

## Checks mínimos
Antes de marcar PR como “Ready for review”, rode:
- npm run verify (lint + typecheck + build + docs:links + docs:lint)
- (CI) Docs Link Check: o PR falhará se houver links relativos quebrados em `docs/`
- (CI) Docs Markdown Lint: o PR falhará se houver violações em `docs/`
- (CI) Secrets Scan: o PR falhará se houver segredos detectados

## Governança de documentação
- Toda mudança de comportamento deve atualizar a documentação correspondente no mesmo PR (Contratos, Runbooks, Arquitetura, Onboarding). PRs com docs desatualizadas podem ser bloqueados.
- Evite duplicação de conteúdo: a arquitetura canônica está em `docs/architecture/SYSTEM_ARCHITECTURE.md`; decisões em `docs/architecture/decisions/`.
- Para dúvidas de arquitetura/processo use `AGENT.md` (Apendice: Perguntas e decisoes) e depois mova para “Respondidas” quando houver cobertura canônica.

## Convenção de commits
- Use prefixos: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `ci:`.
- Commits devem ser atômicos e descritivos; evite “misc changes”.

## Proteção de branch
- Habilite “Require status checks to pass” para `main` e marque os jobs `CI` e `Docs Link Check` como obrigatórios (ver `docs/runbooks/branch-protection.md`).

## Secrets (.env)
- Nunca commitar arquivos `.env` ou `.env.*`.
- O repo mantém apenas exemplos:
  - `.env.local.local.example`
  - `.env.local.online.example`

## Banco e migrations
- Migrations ficam em `supabase/migrations/`
- Nome sugerido:
  YYYYMMDDHHMM_pacientes_abaXX_<slug>
- Toda migration deve iniciar com:
  -- CONTRATO: docs/contracts/pacientes/ABAxx_....md
