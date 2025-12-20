# Plano — Pacientes | ABA02 Endereco & Logistica

Atualizado em: 2025-12-20

Este plano define o escopo e o caminho para documentar a Aba 02 (Endereco & Logistica) com base no fluxo contrato-driven. A etapa atual e **somente docs** (plano + contrato + indexacao), sem migrations ou mudancas de UI.

- Branch de trabalho: `feat/pacientes-aba02-endereco-logistica`
- PR (Draft): a definir

## Objetivo

- Criar o plano da Aba 02 e o contrato oficial (ABA02), com separacao clara entre **Endereco (localizacao)** e **Logistica & Estrutura**.
- Garantir alinhamento com o padrao da Aba 01, com governanca e rastreabilidade (contrato como fonte de verdade).

## Escopo

IN
- Plano e contrato da Aba 02 (Endereco & Logistica), incluindo mapeamento do legado.
- Atualizacao de indices de contratos do modulo Pacientes.
- Registro de gaps/risco (mocks, ausencia de tabela, etc.).

OUT
- Migrations, types, actions e UI.
- Alteracoes de runtime ou refactor amplo.

## Referencias obrigatorias

- `AGENT.md`
- `docs/architecture/decisions/ADR-004-ui-dynamics-standard.md`
- `docs/contracts/_templates/CONTRACT_TEMPLATE.md`
- `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`
- `docs/repo_antigo/schema_current.sql`
- `html/modelo_final_aparencia_pagina_do_paciente.htm`

## Como trabalhamos em abas (padrao Aba 01)

- Fluxo canonico: **Contrato -> Migrations -> Types -> Actions -> UI**.
- Validacoes e normalizacao ficam em `src/features/pacientes/schemas` (Zod + normalizadores).
- Actions em `src/features/pacientes/actions` usam Supabase client e respeitam RLS/tenant_id.
- Orquestracao de tabs e command bar no detalhe em `src/app/pacientes/[id]/PatientPageClient.tsx`.
- UI de leitura em cards + edicao em formulario (padrao de `DadosPessoaisTab`).

## Estado atual (diagnostico)

- Aba Endereco & Logistica esta com **mocks** no `PatientPageClient`.
- Nao existe contrato da ABA02 em `docs/contracts/pacientes`.
- Nao existe tabela/typing canonico para endereco no schema atual.
- Tipos legados (`src/types/patient.ts`) sao @deprecated e nao podem ser fonte de verdade.

## Estrategia em 2 fases (no mesmo contrato)

- **Fase 1 — Endereco (localizacao)**: definir modelo 1:N, campos obrigatorios, CEP/BrasilAPI e regra de endereco primario.
- **Fase 2 — Logistica & Estrutura**: campos de acesso e condicoes da residencia, com foco em opcionalidade no V1.

## Decisoes ja tomadas (Renato)

- Modelo 1:N: multiplos enderecos por paciente, com um **primario** entre ativos.
- Auditoria obrigatoria (metadados + trilha de mudanca).
- CEP via **BrasilAPI** com fallback manual e normalizacao.
- Endereco impacta cobertura/escala (campos derivados opcionais no V1).
- Logistica/estrutura: definir endereco primeiro; completar logistica depois.

## Cobertura do legado (extracao)

- `public.patient_addresses`: endereco + grande parte de logistica/acesso.
- `public.patient_domiciles`: estrutura/condicoes da residencia.

Resumo (alto nivel):
- Endereco: cep, logradouro, numero, bairro, cidade, UF, complemento, referencia, lat/long.
- Logistica/acesso: acesso ambulancia, entrada, portaria, vagas, elevador, escadas, risco, horario visita.
- Estrutura: cama/colchao, energia, agua, fumantes, wifi, ventilacao, iluminacao, ruido, higiene.

## Entregaveis desta etapa (docs apenas)

- `docs/reviews/PLANO_PACIENTES_ABA02_ENDERECO_LOGISTICA.md` (este plano).
- `docs/contracts/pacientes/ABA02_ENDERECO_LOGISTICA.md` (contrato ABA02).
- Atualizacao de indices:
  - `docs/contracts/pacientes/INDEX.md`
  - `docs/contracts/pacientes/README.md`

## Proximas etapas (nao executar agora)

- Criar migrations (tabelas + RLS + indices + triggers de updated_at).
- Gerar types em `src/types/supabase.ts`.
- Implementar actions (CRUD + set primary).
- Implementar UI (view/edit), substituir mocks e integrar command bar.
- Testes manuais e atualizacao de runbooks (quando aplicavel).

## Validacoes desta etapa

- `npm run docs:links`
- `npm run docs:lint`

## Riscos e mitigacoes

- **Risco**: divergencia entre contrato e legado (cobertura incompleta). **Mitigacao**: mapear legacy->novo no contrato.
- **Risco**: excesso de obrigatorios na logistica bloquear cadastro. **Mitigacao**: V1 opcional, obrigar apenas endereco.
- **Risco**: inconsistencia de docs (MODULE_STATUS vs indices). **Mitigacao**: registrar no plano e corrigir em etapa propria.

## Pendencias e perguntas abertas

- Qual mecanismo padrao de **audit trail** (tabela/eventos) sera adotado para endereco/logistica?
- Quando habilitar o modo "primario por finalidade" (address_purpose) em vez de primario unico?

## Governanca deste documento

- Este plano deve ser atualizado conforme a execucao real avancar.
- O contrato e a fonte de verdade para o escopo funcional da Aba 02.
