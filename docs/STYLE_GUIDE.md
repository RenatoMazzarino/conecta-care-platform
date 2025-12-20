# STYLE GUIDE — Documentação

Este guia padroniza a escrita dos documentos do repositório para reduzir ambiguidades, manter consistência e facilitar a manutenção contínua.

## 1. Estrutura e títulos

- Use cabeçalhos com hierarquia estável: h1 apenas para o título do arquivo; depois h2, h3, etc.
- O título do arquivo deve refletir o conteúdo de forma direta (ex.: Workflow de migrations).
- Sempre comece com uma seção curta de objetivo/contexto.

## 2. Estado/Status do documento

- Utilize badge textual na primeira seção quando relevante:
  - Status: ATUAL | PARCIAL | OBSOLETO | DUPLICADO | ARQUIVADO (histórico)
- Exemplos (linha inicial):
  - Status: ATUAL — documento canônico
  - Status: PARCIAL — em evolução, pode conter gaps
  - Status: ARQUIVADO — referência histórica (não canônico)

## 3. Links e referências

- Prefira links RELATIVOS entre arquivos do repositório (ex.: ../architecture/SYSTEM_ARCHITECTURE.md).
- Não duplique conteúdo canônico:
  - Arquitetura: docs/architecture/SYSTEM_ARCHITECTURE.md
  - Decisões: docs/architecture/decisions/
  - Contratos: docs/contracts/
  - Runbooks: docs/runbooks/
  - Plano/Backlog: docs/reviews/analise-governanca-estrutura-2025-12-19/PLANO_GOVERNANCA_REPO_P0-P3.md e docs/architecture/OPEN_TODO.md
- O CI falha PRs com links relativos quebrados (job “Docs Link Check”).
- O CI falha PRs com violações de markdownlint em `docs/` (job “Docs Markdown Lint”).

## 4. Código, comandos e tabelas

- Use crases para código inline: `tenant_id`, `deleted_at`.
- Blocos de código devem utilizar cercas somente quando necessário; prefira exemplos curtos.
- Tabelas devem ter cabeçalho e colunas claras. Para contratos, inclua: Card, Campo, Nome técnico, Tipo PG, Tipo TS, Obrigatório, Default, Validações, Máscara, Descrição.

## 5. Linguagem e terminologia

- Linguagem padrão: Português (pt-BR). Termos técnicos podem permanecer em inglês quando consagrados (ex.: soft delete, payload), mas mantenha consistência.
- Evite sinônimos conflitantes. Exemplos canônicos:
  - multi-tenant, RLS, soft delete, UI (casca Dynamics), contrato, migration, types, actions.
- Para domínios médicos/legais, alinhar terminologia e adicionar definições quando necessário (glossário futuro em P3).

## 6. Governança e rastreabilidade

- Qualquer mudança de comportamento deve atualizar a documentação no MESMO PR (contratos/runbooks/arquitetura).
- Rastreabilidade obrigatória em migrations: cabeçalho padrão + atualização dos índices de contratos e evidências (ver docs/runbooks/migrations-workflow.md).
- No backlog (OPEN_TODO.md), mover itens concluídos para “Concluídos (com evidência)” com links.

## 7. Seções recomendadas por tipo de documento

- Contratos:
  - Metadados (módulo, aba, versão, status, governança, referências)
  - Objetivo
  - Estrutura de UI (com links para código/HTML de referência)
  - Tabela de campos (com validações)
  - Regras de sincronização / notas sobre legado
  - Evidências (PR/migrations)
- Runbooks:
  - Objetivo
  - Pré-requisitos
  - Passo a passo (comandos/links)
  - Checklist e resolução de problemas
  - Evidências
- Arquitetura/ADRs:
  - Princípios
  - Estado atual
  - Decisões (motivação, alternativas, consequências)
  - Visão e impactos

## 8. Exemplos de padrões

- Badge de status e aviso de canonicidade (no topo, quando aplicável):
  - "Status: ARQUIVADO — documento histórico; consulte a fonte canônica em ../architecture/SYSTEM_ARCHITECTURE.md."
- Aviso de processo vs. arquitetura (para process/ai):
  - "Este documento descreve processo/IA. Não duplique arquitetura; a fonte canônica está em ../architecture/SYSTEM_ARCHITECTURE.md."

## 9. Revisão contínua

- Atualize este STYLE GUIDE quando surgirem novas necessidades de padronização.
- Itens propostos devem ser registrados no OPEN_TODO.md (P2: STYLE_GUIDE de docs) e vinculados a PRs.
