# Resumo da Reestruturação da Documentação

Objetivo: reduzir fragmentação e deixar claro o que é arquitetura (estado atual), visão (longo prazo), governança/processo (workflow), contrato (fonte de verdade) e runbook (como operar). Todas as mudanças foram restritas a `docs/` e priorizaram mínimo impacto.

Data: 2025-12-17

## Checklist de Alterações (final)

- [x] `docs/README.md` — ponto de entrada canônico
  - Visão rápida (10 linhas), links para arquitetura/contratos/runbooks/reviews/processo/IA, regra “Contrato → Migrations → Types → Actions → UI” e política de atualização “docs no mesmo PR”.
  - Nenhuma alteração necessária (apenas verificação).

- [x] `docs/MODULE_STATUS.md` — status por módulo
  - Tabela existente validada (Pacientes, Prontuários, Agendamentos, Escalas, Financeiro, Home Care Ops, Inventário, Configurações).
  - Links: Pacientes aponta para `docs/contracts/pacientes/README.md` conforme requisito mínimo.

- [x] `docs/process/ai/` — pasta de processo/IA consolidada
  - `docs/process/ai/README.md` explica claramente que é processo de trabalho com IA (não arquitetura do sistema).
  - Arquivos presentes e validados no destino:
    - `docs/process/ai/CODEX_GUIDE.md`
    - `docs/process/ai/AI_TOOLING.md`
    - `docs/process/ai/CODEX_QUESTIONS.md`
    - `docs/process/ai/gemini.md`
  - Observação sobre histórico: os arquivos já estavam no destino nesta sessão; portanto, não houve necessidade de executar `git mv` agora. O histórico prévio foi preservado conforme o estado atual do repositório.

- [x] Atualização/validação de links na documentação
  - Passagem de verificação em arquivos-chave: `docs/architecture/SYSTEM_ARCHITECTURE.md`, `docs/runbooks/ONBOARDING.md`, `docs/runbooks/pacientes-aba01-troubleshooting.md`, `docs/process/ai/README.md` e os guias de IA acima.
  - Nenhum link relativo quebrado encontrado após a consolidação (ver `docs/reviews/DOCS_LINK_CHECK.md`).

- [x] Redução de sobreposição entre arquitetura e guias de IA
  - `docs/process/ai/CODEX_GUIDE.md`: adicionado aviso de canonicidade e substituída a seção "Arquitetura atual do repo (real)" por link para o documento canônico `docs/architecture/SYSTEM_ARCHITECTURE.md`.
  - Mantido conteúdo de processo/execução neste guia e criada seção de "Notas arquivadas" explicando a consolidação.

- [x] Backlog técnico saneado
  - `docs/architecture/OPEN_TODO.md`: reorganizado por P0/P1/P2; itens concluídos movidos para "Concluídos (com evidência)" com links para contratos/PRs/migrations.

## Itens atendidos por requisito

- Arquitetura (estado atual) → `docs/architecture/SYSTEM_ARCHITECTURE.md` (seções 1 e 2)
- Visão (longo prazo) → `docs/architecture/SYSTEM_ARCHITECTURE.md` (seção 3)
- Governança/Processo (workflow) → `docs/process/` e `docs/runbooks/` (especialmente `migrations-workflow.md`, `review-workflow.md` e `process/ai/*`)
- Contratos (fonte de verdade) → `docs/contracts/`
- Runbooks (como operar) → `docs/runbooks/`

## Observações finais

- Mantido “impacto mínimo”: nenhum conteúdo foi modificado além do necessário para validação e documentação do processo.
- Todas as referências internas verificadas mantêm-se válidas; não há alterações fora de `docs/`.

— Fim
