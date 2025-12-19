# ADR-006: Política de e-mail no DB — CHECK simples; validação forte no app

Status: Accepted
Data: 2025-12-17
Owner: @RenatoMazzarino

Contexto

- Validações complexas de e-mail no banco geraram falsos negativos na Aba 01. Precisamos equilibrar segurança e praticidade: bloquear formatos obviamente inválidos no DB e deixar validação completa para o app (Zod/UX).

Decisão

- No banco, usar um CHECK **tolerante** que rejeita apenas formatos evidentemente inválidos.
- A validação forte (regex/normalização/mensagens) ocorre no app (Zod) antes do update.

Alternativas consideradas

- Regex rígida no DB: rejeitado por falsos negativos e impacto operacional.
- Sem CHECK no DB: rejeitado por risco de dados inválidos e inconsistência entre clientes.

Consequências

- Reduz falsos negativos em writes no DB e mantém boa UX.
- Exige disciplina para manter validação no app alinhada ao contrato.

Referências

- supabase/migrations/202512141854_pacientes_email_check_relax.sql
- docs/runbooks/pacientes-aba01-troubleshooting.md (seção "CHECK de e-mail")
- docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md (Máscaras e Validações)
