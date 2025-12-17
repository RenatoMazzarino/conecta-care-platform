Diretório reservado para mapeadores (DB ↔ DTO/UI) do módulo Pacientes.

Diretrizes:
- Somente crie mappers quando houver transformação não trivial entre os tipos do Supabase (`src/types/supabase.ts`) e os DTOs/UI.
- Mantenha funções puras e tipadas; documente campos derivados e defaults.
- Referencie contratos em `docs/contracts/pacientes/` e evidências (migrations/PRs) quando o mapper refletir regras de negócio do contrato.

Observação: pode permanecer vazio até que haja necessidade real de mapeamento.
