# Contrato da Aba: <NOME_DA_ABA>

## 0) Metadados

- Módulo: Pacientes
- Aba: <ABA_XX>
- Versão: 0.1
- Status: Draft | Em revisão | Aprovado | Implementado
- Última atualização: <YYYY-MM-DD>
- Referências:
  - `docs/repo_antigo/schema_current.sql` (snapshot do banco antigo)
  - `db/snapshots/` (dumps históricos, se existirem)
  - Telas/Componentes relacionados (ex.: `src/app/...`, `src/components/...`)

## 1) Objetivo da Aba

- O que essa aba resolve (1–3 linhas).
- Quem usa (perfis): <ex.: admin, supervisor, enfermagem, financeiro>.

## 2) Estrutura de UI (Cards e Campos)

- Descrever os cards exatamente como na UI (nome do card + propósito).
- Para cada card, listar campos na tabela abaixo.

Tabela padrão por campo (obrigatória):

| Card | Campo (label UI) | Nome técnico (coluna) | Tipo PG | Tipo TS | Obrigatório | Default | Validações | Máscara | Descrição curta |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <Card X> | <Label do campo> | <snake_case> | <ex.: text, uuid, date, enum> | <ex.: string, number, boolean> | Sim/Não | <default> | <regras> | <máscara> | <1 linha> |

## 3) Modelo de Dados (Banco)

- Tabela(s) envolvidas: <ex.: `public.patients`>
- Chaves:
  - PK: <...>
  - `tenant_id`: <como é preenchido/validado>
  - FKs: <...>
- Índices necessários: <...>
- Enum/Check constraints necessários: <...>
- Regras de auditoria:
  - `created_at`, `updated_at`
  - “quem alterou” (se aplicável): <coluna/estratégia>

## 4) Segurança (RLS / Policies)

- RLS: enabled (sim/não)
- Política de SELECT: <...>
- Política de INSERT: <...>
- Política de UPDATE: <...>
- Política de DELETE: <...>
- Observação sobre `tenant_id` + `app_private.current_tenant_id()`: <...>

## 5) Operações / Actions do App

- Leituras necessárias (queries): <lista>
- Updates necessários (payload): <lista>
- Regras de salvar/cancelar: <...>
- Estados de UI (view/edit/loading/error): <...>
- Mensagens de validação: <...>

## 6) Máscaras e Validações (detalhadas)

- CPF: <regras>
- Telefone: <regras>
- CEP: <regras>
- Data: <regras>
- Etc (conforme a aba): <...>

## 7) Migrações previstas

- Nome sugerido da migration: <YYYYMMDDHHMM_<slug>>
- Conteúdo esperado:
  - <bullet 1>
  - <bullet 2>

## 8) Definição de Pronto (DoD)

Checklist:

- [ ] Contrato aprovado
- [ ] Migration criada e aplicada no Supabase local
- [ ] Tipos TS regenerados
- [ ] UI sem mocks, usando Supabase
- [ ] Actions implementadas
- [ ] RLS e policies validadas
- [ ] Testes manuais (lista)
- [ ] Documentação do runbook atualizada
