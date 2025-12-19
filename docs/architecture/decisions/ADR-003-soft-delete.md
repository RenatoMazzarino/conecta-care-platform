# ADR-003: Soft delete como padrão

Status: Accepted
Data: 2025-12-17
Owner: @RenatoMazzarino

Contexto

- Em saúde e operações, exclusões permanentes dificultam auditoria e conformidade. Precisamos de histórico e reversibilidade.

Decisão

- Adotar **soft delete** em entidades de negócio via coluna `deleted_at` (NULL = ativo).
- Policies/queries devem considerar `deleted_at IS NULL` para leituras e atualizações.
- DELETE padrão passa a significar preencher `deleted_at`; deleção física só com justificativa e política explícita.

Alternativas consideradas

- Hard delete com backups: rejeitado por risco de perda de histórico e auditoria incompleta.
- Soft delete apenas em tabelas críticas: rejeitado por inconsistência e gaps de compliance.

Consequências

- Facilita auditoria e recuperação de registros.
- Exige disciplina em queries/indices (filtros por `deleted_at`).

Referências

- docs/architecture/SYSTEM_ARCHITECTURE.md (Princípios)
- docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md (metadados e RLS)
