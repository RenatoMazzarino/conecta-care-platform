# Plano — Pacientes | ABA02 Endereco & Logistica

Atualizado em: 2025-12-20

Este plano cobre **somente docs** (plano + contrato + indexacao + mapeamento legado). Implementacao (migrations/types/actions/UI) fica fora desta etapa.

- Branch de trabalho: `feat/pacientes-aba02-endereco-logistica`
- PR (Draft): a definir

## Objetivo

- Consolidar o contrato canônico da Aba 02, separando **Endereco (localizacao)** e **Logistica & Estrutura**.
- Garantir rastreabilidade com base no legado e padrao de qualidade da Aba 01.

## Escopo

IN
- Contrato ABA02 completo (com regras de negocio e mapa legado -> novo 100%).
- Plano atualizado com DoD da fase Docs.
- Indexacao do modulo Pacientes atualizada.
- Lista de campos do legado documentada.

OUT
- Migrations, types, actions, UI ou runtime.
- Refactors fora de docs.

## Referencias obrigatorias

- `AGENT.md`
- `docs/contracts/_templates/CONTRACT_TEMPLATE.md`
- `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`
- `docs/architecture/decisions/ADR-004-ui-dynamics-standard.md`
- `docs/repo_antigo/schema_current.sql`
- `html/modelo_final_aparencia_pagina_do_paciente.htm`

## Estado atual

- Aba 02 sem contrato aprovado (apenas mocks na UI).
- Sem tabela/typing canônico para endereco/logistica no schema atual.
- Legado possui duas tabelas (`patient_addresses` e `patient_domiciles`) com cobertura ampla.

## Decisoes fechadas (Renato)

- Modelo 1:N: multiplos enderecos por paciente.
- V1: **1 endereco primario global** por paciente (entre enderecos ativos).
- Auditoria obrigatoria (metadados + trilha de mudanca).
  - Abordagem proposta: eventos em `public.audit_events` (ver `docs/runbooks/auditoria-endpoint.md`).
- CEP via **BrasilAPI** (autofill) + fallback manual + normalizacao.
- Endereco impacta cobertura/escala (campos derivados opcionais no V1).
- Ordem de execucao: Endereco -> Logistica & Estrutura.

## Estrategia em 2 fases (no mesmo contrato)

1) **Endereco (localizacao)**
- Campos obrigatorios, CEP, regras de primario e normalizacao.

2) **Logistica & Estrutura**
- Campos de acesso/condicoes com opcionalidade no V1.

## Entregaveis desta etapa (Docs)

- `docs/reviews/PLANO_PACIENTES_ABA02_ENDERECO_LOGISTICA.md`
- `docs/contracts/pacientes/ABA02_ENDERECO_LOGISTICA.md`
- `docs/contracts/pacientes/ABA02_LEGACY_FIELD_LIST.md`
- `docs/contracts/pacientes/ABA02_LEGACY_TO_CANONICAL_MAP.md`
- `docs/contracts/pacientes/INDEX.md`
- `docs/contracts/pacientes/README.md`

## DoD — Fase Docs

- [ ] Contrato ABA02 completo e sem placeholders.
- [ ] Mapa Legado -> Canonico com 100% das colunas (patient_addresses + patient_domiciles).
- [ ] Lista de campos do legado publicada (ABA02_LEGACY_FIELD_LIST).
- [ ] Indexacao do modulo atualizada (INDEX/README).
- [ ] Checagens de docs executadas (links + lint).

## Criterios de Aceite (Docs)

- Contrato referencia os anexos de legado.
- Mapa legado -> canonico 100% concluido.
- Precedencia dos duplicados definida.
- Campos criticos resolvidos: `zone_type`, `team_parking`, `animal_behavior`/`animals_behavior`.
- Indices/README atualizados com links da ABA02 e anexos.

## Proximas etapas (nao executar agora)

- Migrations (tabelas, RLS, indices, triggers).
- Types (gerar `src/types/supabase.ts`).
- Actions (CRUD + setPrimary + validacoes).
- UI (view/edit sem mocks, command bar integrado).
- Testes manuais e runbooks.

## Validacoes desta etapa

- `npm run docs:links`
- `npm run docs:lint`

## Riscos

- Divergencia legado vs contrato: mitigar com mapa 100% e notas de conversao.
- Excesso de obrigatorios na logistica: manter opcional no V1.

## Perguntas abertas (se restarem)

- Nenhuma no momento.

## Governanca

- O contrato e a fonte de verdade para o escopo funcional da Aba 02.
- Atualizar este plano conforme a execucao real avancar.
