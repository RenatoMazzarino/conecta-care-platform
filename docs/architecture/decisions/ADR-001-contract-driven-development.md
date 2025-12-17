# ADR-001: Contract-Driven Development

Status: Accepted
Data: 2025-12-17

Contexto
- Precisamos evitar divergência entre código, banco e documentação. O projeto já adotava prática informal de começar por contratos em algumas áreas e formalizou isso em docs.

Decisão
- O fluxo oficial e obrigatório é: **Contrato → Migration → Types → Actions → UI → Docs/Runbooks/Review**.
- Nenhuma coluna/tabela, payload ou lógica de UI deve ser criada sem contrato aprovado.
- Toda mudança funcional deve atualizar o contrato/runbooks no mesmo PR.

Consequências
- Garante alinhamento e rastreabilidade (migrations indexadas nos contratos).
- Aumenta previsibilidade de PRs e facilita review/rollback.
- Requer disciplina: PRs sem contrato ou sem atualização de docs não passam no review.

Referências
- docs/README.md (política e fluxo)
- docs/runbooks/migrations-workflow.md
- docs/contracts/_templates/CONTRACT_TEMPLATE.md
- docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md
- docs/architecture/SYSTEM_ARCHITECTURE.md (Princípios)
- docs/reviews/PR_FEAT_PACIENTES_ABA01.md
