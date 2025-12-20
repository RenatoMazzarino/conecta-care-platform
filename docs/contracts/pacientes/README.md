# Contratos — Módulo Pacientes

Índice canônico dos contratos do módulo **Pacientes** (uma aba = um contrato).

Atualize este arquivo sempre que:

- um contrato mudar de status, ou
- uma migration for criada para implementar um contrato.

## Abas

| Aba | Contrato | Status | Migrations relacionadas |
| --- | --- | --- | --- |
| ABA01 | `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md` | Aprovado | `supabase/migrations/202512130452_base.sql`, `supabase/migrations/202512130453_pacientes_aba01_dados_pessoais.sql`, `supabase/migrations/202512130704_pacientes_aba01_dados_pessoais_extend_legado.sql`, `supabase/migrations/202512131716_pacientes_aba01_align_final.sql`, `supabase/migrations/202512141854_pacientes_email_check_relax.sql`, `supabase/migrations/202512142004_auth_tenant_from_jwt.sql` |
| ABA02 | `docs/contracts/pacientes/ABA02_ENDERECO_LOGISTICA.md` | Em revisao | — |

Anexos ABA02:

- `docs/contracts/pacientes/ABA02_ENDERECO_LOGISTICA.md#anexos-cobertura-do-legado-fonte-docsrepo_antigoschema_currentsql`
