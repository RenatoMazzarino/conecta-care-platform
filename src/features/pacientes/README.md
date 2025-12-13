# Feature: Pacientes

Estrutura-base para organizar o domínio **Pacientes** no fluxo:
**Contrato → Migrations → Types → UI → Actions**.

- `src/features/pacientes/ui/`: componentes/containers específicos do domínio (sem layout global).
- `src/features/pacientes/actions/`: operações de leitura/escrita (queries/mutations) e regras de salvar.
- `src/features/pacientes/schemas/`: schemas/validações/máscaras (ex.: CPF, telefone, CEP).
- `src/features/pacientes/mappers/`: mapeamento entre tipos do banco e DTOs da UI.
- `src/features/pacientes/index.ts`: ponto de export (barrel) do domínio.

