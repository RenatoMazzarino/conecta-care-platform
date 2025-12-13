# Workflow de migrations (Contrato → Migration → Types → UI → Actions)

## Regra do fluxo
Antes de qualquer migration, o contrato da aba deve existir e estar em revisão/aprovado:
- Contratos: `docs/contracts/<modulo>/...`
- Template: `docs/contracts/_templates/CONTRACT_TEMPLATE.md`

Fluxo canônico (obrigatório): **migrations aplicadas no local → typegen → commit**.
Ou seja: primeiro garantimos que o schema local está correto, depois regeneramos os tipos, e só então seguimos para UI/Actions.

## Onde ficam as migrations
- `supabase/migrations/`

## Criar migration
- Padrão de nome (regra do projeto):
  - `YYYYMMDDHHMM_pacientes_abaXX_<slug_da_aba>`
  - Exemplo: `202512131030_pacientes_aba01_dados_pessoais`
- Criar um arquivo novo (CLI):
  - `supabase migration new pacientes_aba01_dados_pessoais`
  - Observação: a CLI adiciona o timestamp automaticamente ao nome do arquivo.
- Implementar o SQL da mudança na migration gerada.

Regra de rastreabilidade (obrigatória):
- Toda migration deve conter no topo um comentário com o path do contrato:
  - `-- CONTRATO: docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`

## Aplicar no Supabase local
- Aplicar/resetar e validar: `supabase db reset`
- Confirmar stack: `supabase status`

## “No futuro”: aplicar no remoto
- Linkar projeto: `supabase link --project-ref <project_ref>`
- Enviar migrations para o remoto: `supabase db push`

## Regenerar types
- Arquivo canônico (único) de types gerados: `src/types/supabase.ts`
- Após aplicar no local, regenerar e versionar:
  - `supabase gen types typescript --local > src/types/supabase.ts`
