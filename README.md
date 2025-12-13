# conecta-care-platform
Plataforma Conecta Care para gestão de home care: cadastro e prontuário de pacientes, escalas, inventário, financeiro e integrações. Layout inspirado em produtos Microsoft, banco de dados em português e regras empresariais fortes (RLS, multi-tenant e auditoria completa).

## Requisitos
- Node.js >= 20.9.0 (Next.js 16).

## Setup rápido
1) Crie seu arquivo local de env:
   - `cp .env.example .env.local`
   - Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2) Instale dependências e rode o lint:
   - `bash scripts/setup.sh`
3) Rode em dev:
   - `npm run dev`

## Verificações
- `npm run verify` (lint + typecheck + build)
- `npm run typecheck` (tsc --noEmit)
- `bash scripts/verify.sh` (lint + typecheck + build)
- `bash scripts/typecheck.sh` (tsc --noEmit)
- `bash scripts/test.sh` (quando houver testes)

## Codex (campo "Script de configuração")
- `bash scripts/setup.sh`

## Codex (campo "Script de manutenção")
- `bash scripts/maintenance.sh`

## CI (entrypoint)
- `bash scripts/ci.sh`
