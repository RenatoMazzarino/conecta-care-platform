# Workflow de migrations (Contrato → Migration → Types → UI → Actions)

## Regra do fluxo
Antes de qualquer migration, o contrato da aba deve existir e estar em revisão/aprovado:
- Contratos: `docs/contracts/<modulo>/...`
- Template: `docs/contracts/_templates/CONTRACT_TEMPLATE.md`

## Onde ficam as migrations
- `supabase/migrations/`

## Criar migration
- Criar um arquivo novo (CLI): `supabase migration new <slug>`
- Implementar o SQL da mudança na migration gerada.

## Aplicar no Supabase local
- Aplicar/resetar e validar: `supabase db reset`
- Confirmar stack: `supabase status`

## “No futuro”: aplicar no remoto
- Linkar projeto: `supabase link --project-ref <project_ref>`
- Enviar migrations para o remoto: `supabase db push`

## Regenerar types
- Após aplicar no local, regenerar e versionar os types:
  - `supabase gen types typescript --local --schema public > src/types/supabase.public.ts`
  - `supabase gen types typescript --local > src/types/supabase.ts`

