# Contratos — Módulo Pacientes

Índice canônico dos contratos do módulo **Pacientes** (uma aba = um contrato).

Atualize este arquivo sempre que:
- um contrato mudar de status, ou
- uma migration for criada para implementar um contrato.

## Abas
| Aba | Contrato | Status | Migrations relacionadas |
|-----|----------|--------|------------------------|
| ABA01 | `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md` | Aprovado | `supabase/migrations/202512130452_base.sql`, `supabase/migrations/202512130453_pacientes_aba01_dados_pessoais.sql` |
