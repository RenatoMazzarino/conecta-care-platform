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
- npm run lint
- npm run typecheck
- npm run build (quando aplicável)

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

