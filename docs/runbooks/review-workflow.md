# Runbook — Fluxo de Branch, Commits e PR (com revisões automáticas)

## Estratégia recomendada

- 1 branch por unidade de trabalho (ex.: por aba do módulo Pacientes).
- Commits pequenos e frequentes dentro da branch.
- Abrir PR cedo como **Draft** para ativar revisões automáticas enquanto você desenvolve.
- No final, marcar como **Ready for review**, ajustar apontamentos e fazer merge.

## Padrão de branches

- main: estável (sempre pronta para deploy)
- feat/*: funcionalidades
- fix/*: correções
- chore/*: manutenção/infra/docs

Exemplos:

- feat/pacientes-aba01-dados-pessoais
- chore/docs-ai-tooling
- fix/pacientes-mascara-cpf

## Passo a passo

1) Criar branch a partir da main
2) Fazer commits pequenos (ex.: layout, validações, integração supabase, etc.)
3) Abrir PR como **Draft** (o quanto antes)
4) A cada entrega relevante:
   - rodar checks locais (lint/typecheck/build quando aplicável)
   - push para atualizar o PR
5) Avaliar feedback dos revisores automáticos (Codex Web / Vercel Agent)
6) Ajustar e marcar PR como **Ready for review**
7) Merge:
   - preferencial: **Squash merge** para manter a main limpa
   - alternativa: Rebase merge para histórico linear

## Checks mínimos antes de marcar “Ready for review”

- npm run verify (lint + typecheck + build + docs:links + docs:lint)
- supabase start/status (quando houver alterações de migrations/DB)

## Convenção sugerida de commits

- feat: ...
- fix: ...
- chore: ...
- docs: ...

Exemplos:

- feat(pacientes): estrutura da aba 01
- fix(pacientes): máscara de telefone
- chore(supabase): criar estrutura de migrations
- docs: adicionar workflow de review
