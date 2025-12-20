# Plano — Pacientes | ABA02 Endereco & Logistica

Atualizado em: 2025-12-20

Este plano cobre **docs + implementacao V1** da Aba 02 (migrations/types/actions/UI) para CEP, geocode e ranking de risco.

- Branch de trabalho: `feat/pacientes-aba02-endereco-logistica`
- PR (Draft): a definir

## Objetivo

- Consolidar o contrato canônico da Aba 02, separando **Endereco (localizacao)** e **Logistica & Estrutura**.
- Garantir rastreabilidade com base no legado e padrao de qualidade da Aba 01.

## Escopo

IN
- Contrato ABA02 atualizado (integracoes CEP/geocode/risco).
- Migrations para tabelas de endereco/logistica + colunas de integracao.
- Types regenerados (`src/types/supabase.ts`).
- Actions e schemas (Zod) da ABA02.
- UI da Aba 02 conectada ao Supabase (sem mocks).
- Indexacao do modulo Pacientes atualizada.

OUT
- Alteracoes em outras abas (ABA01/ABA03+).
- Refactors gerais fora do escopo da ABA02.

## Referencias obrigatorias

- `AGENT.md`
- `docs/contracts/_templates/CONTRACT_TEMPLATE.md`
- `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`
- `docs/architecture/decisions/ADR-004-ui-dynamics-standard.md`
- `db/snapshots_legado/conectacare-2025-11-29.sql`
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
- Cache sugerido (V1): CEP 30 dias (opcional), geocode 30 dias, risco 7 dias.

## Estrategia em 2 fases (no mesmo contrato)

1) **Endereco (localizacao)**
- Campos obrigatorios, CEP, regras de primario e normalizacao.

2) **Logistica & Estrutura**
- Campos de acesso/condicoes com opcionalidade no V1.

## Entregaveis desta etapa

- `docs/reviews/PLANO_PACIENTES_ABA02_ENDERECO_LOGISTICA.md`
- `docs/contracts/pacientes/ABA02_ENDERECO_LOGISTICA.md`
- `docs/contracts/pacientes/INDEX.md`
- `docs/contracts/pacientes/README.md`
- Migration(s) ABA02 (enderecos/logistica + integracoes).
- Types Supabase regenerados.
- Actions + schemas da Aba 02.
- UI da Aba 02 sem mocks (enderecos/logistica + integracoes).

## DoD — V1 Integracoes (CEP/Geocode/Risco)

- [ ] Contrato ABA02 atualizado com integracoes e regras de cache.
- [ ] Migration aplicada no Supabase local (enderecos/logistica + integracoes).
- [ ] Types TS regenerados.
- [ ] Actions (CEP/geocode/risco) implementadas.
- [ ] UI Aba 02 conectada ao Supabase e sem mocks.
- [ ] `npm run verify` OK.

## Criterios de Aceite (Docs)

- Contrato referencia os anexos de legado.
- Mapa legado -> canonico 100% concluido.
- Precedencia dos duplicados definida.
- Campos criticos resolvidos: `zone_type`, `team_parking`, `animal_behavior`/`animals_behavior`.
- Indices/README atualizados com link para os anexos no contrato.

## Checklist de implementacao (ordem)

1) Atualizar contrato e plano (integracoes V1).
2) Criar migrations (tabelas + colunas + RLS).
3) Regenerar types Supabase.
4) Implementar schemas + normalizacao.
5) Implementar actions (CEP/geocode/risco).
6) Atualizar UI da Aba 02 (botao CEP, geocode/risk, share).
7) Rodar `npm run verify`.

## Variaveis de ambiente (V1)

- `GEOCODE_PROVIDER` (google|mapbox|osm|none)
- `GEOCODE_GOOGLE_API_KEY` (se provider=google)
- `GEOCODE_MAPBOX_TOKEN` (se provider=mapbox)
- `GEOCODE_USER_AGENT` (opcional, para OSM/Nominatim)
- `RISK_PROVIDER` (none|custom_http|...)
- `RISK_API_URL` (se provider=custom_http)
- `RISK_API_KEY` (se provider=custom_http)

## Politica de cache sugerida (V1)

- CEP: 30 dias (opcional).
- Geocode: 30 dias ou ate alteracao manual do endereco + refresh manual.
- Risco: 7 dias + refresh manual.

## Validacoes desta etapa

- `npm run verify`

## Riscos

- Divergencia legado vs contrato: mitigar com mapa 100% e notas de conversao.
- Excesso de obrigatorios na logistica: manter opcional no V1.

## Perguntas abertas (se restarem)

- Nenhuma no momento.

## Governanca

- O contrato e a fonte de verdade para o escopo funcional da Aba 02.
- Atualizar este plano conforme a execucao real avancar.
