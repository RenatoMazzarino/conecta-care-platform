# Documentação (`/docs`)

Esta pasta é a **fonte canônica** de documentação do projeto (processo, contratos de abas e referências técnicas).

## Estrutura
- `docs/repo_antigo/`: referência técnica do banco antigo (snapshot) para consulta.
  - `docs/repo_antigo/schema_current.sql`: snapshot do schema do banco antigo.
  - `docs/repo_antigo/snapshots/`: dumps históricos adicionais (quando existirem).
- `docs/architecture/`: visão do repositório e decisões de arquitetura.
  - `docs/architecture/AI_TOOLING.md`: esteira de ferramentas de IA e papéis.
  - `docs/architecture/decisions/`: ADRs curtos (opcional).
  - `docs/architecture/database/`: notas gerais do banco (padrões, convenções, decisões).
- `docs/contracts/`: **contratos canônicos** por módulo/aba (o que a UI precisa e como isso vira schema, types e ações).
  - `docs/contracts/_templates/`: templates de contrato para copiar.
  - `docs/contracts/pacientes/`: contratos do módulo de Pacientes, **uma aba = um contrato**.
  - Índice do módulo Pacientes: `docs/contracts/pacientes/README.md`
- `docs/runbooks/`: guias operacionais (Supabase local, workflow de migrations, geração de types, etc.).
  - `docs/runbooks/review-workflow.md`: fluxo de branches/PR e checks mínimos.

## Snapshots (antigo vs novo)
- **Banco antigo (referência histórica):** `docs/repo_antigo/`
- **Banco novo (ao longo do tempo):** `db/snapshots/`
- Regra: não misturar dumps/snapshots do banco novo dentro de `docs/repo_antigo/`.

## Fluxo oficial de trabalho
Ordem obrigatória: **Contrato (MD) → Migrations → Types → UI → Actions**.

1) **Contrato (MD)**: escrever/atualizar o contrato canônico em `docs/contracts/<modulo>/...`.
2) **Migrations**: criar migrations SQL e aplicar no Supabase local.
3) **Types**: regenerar e versionar os tipos TypeScript a partir do schema local.
4) **UI**: implementar a aba usando dados reais (sem inventar campos).
5) **Actions**: implementar queries/mutations e validar RLS/policies.

## Regra de ouro (obrigatória)
Não criar/alterar **tabela/coluna/constraint “na mão”** (ou por conveniência) sem **contrato aprovado**.
Se o contrato não existir ou não estiver aprovado, o próximo passo é **criar/atualizar o contrato** — não a migration.
