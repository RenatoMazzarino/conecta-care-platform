# conecta-care-platform
Plataforma Conecta Care para gestão de home care: cadastro e prontuário de pacientes, escalas, inventário, financeiro e integrações. Layout inspirado em produtos Microsoft, banco de dados em português e regras empresariais fortes (RLS, multi-tenant e auditoria completa).

## Requisitos
- Node.js 20.11.x (LTS).

## Setup rápido
1) Crie seu arquivo local de env:
   - `cp .env.example .env.local`
   - Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2) Instale dependências e rode o lint:
   - `bash scripts/setup.sh`
3) Rode em dev:
   - `npm run dev`

## Verificações
- `npm run verify` (lint + typecheck + build + docs:links + docs:lint)
- `npm run typecheck` (tsc --noEmit)
- `npm run docs:links` (verifica links relativos em `docs/`)
- `npm run docs:lint` (markdownlint em `docs/`)
- `bash scripts/verify.sh` (lint + typecheck + build)
- `bash scripts/typecheck.sh` (tsc --noEmit)
- `bash scripts/test.sh` (quando houver testes)

### CI
- O pipeline executa verificação automática de links relativos e lint em `docs/`, além de secret scanning. PRs falham em violações.

## Codex (campo "Script de configuração")
- `bash scripts/setup.sh`

## Codex (campo "Script de manutenção")
- `bash scripts/maintenance.sh`

## CI (entrypoint)
- `bash scripts/ci.sh`
