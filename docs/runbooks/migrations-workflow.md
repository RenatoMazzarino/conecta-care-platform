# Workflow de migrations (Contrato → Migration → Types → UI → Actions)

## Regra do fluxo
Antes de qualquer migration, o contrato da aba deve existir e estar em revisão/aprovado:
- Contratos: `docs/contracts/<modulo>/...`
- Template: `docs/contracts/_templates/CONTRACT_TEMPLATE.md`

Fluxo canônico (obrigatório): **migrations aplicadas no local → typegen → commit**.
Ou seja: primeiro garantimos que o schema local está correto, depois regeneramos os tipos, e só então seguimos para UI/Actions.

> Rastreabilidade é obrigatória de ponta a ponta. Cada migration deve apontar para o contrato e cada contrato (ou índice do módulo) deve listar as migrations relacionadas.

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

### Cabeçalho padrão da migration (template)

```
-- CONTRATO: docs/contracts/<modulo>/ABAxx_<NOME>.md
-- PR: https://github.com/<org>/<repo>/pull/<id>
-- EVIDÊNCIA: docs/contracts/<modulo>/README.md (linha "Migrations relacionadas")
-- DESCRIÇÃO: <resumo curto da alteração>
```

Checklist de rastreabilidade (faça no mesmo PR):
- [ ] Migration com cabeçalho padrão preenchido (Contrato/PR/Evidência/Descrição).
- [ ] Atualizar `docs/contracts/<modulo>/README.md` (coluna “Migrations relacionadas” da ABA).
- [ ] Se houver índice por módulo (ex.: `docs/contracts/pacientes/INDEX.md`), manter status/links coerentes.
- [ ] Atualizar `docs/architecture/OPEN_TODO.md` (mover item para “Concluídos” com link de evidência quando aplicável).
- [ ] Referenciar o contrato no corpo do PR e marcar o item do backlog (quando existir issue vinculada).

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

Checklist pós-typegen:
- [ ] Conferir diff de `src/types/supabase.ts` (se a migration não alterou tipos, revise a migration).
- [ ] Se o contrato descreve colunas/campos específicos, valide aderência com os tipos gerados.
- [ ] Atualizar documentação/evidências se necessário.
