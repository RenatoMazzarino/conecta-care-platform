# Status dos Módulos da Plataforma

Este documento rastreia o status de implementação de cada módulo principal da Conecta Care Platform.

Colunas:
- Status: Implementado / Em contrato / Em desenvolvimento / Não iniciado
- Abas: principais áreas de navegação (quando aplicável)
- Contratos: índice/contratos por módulo/aba
- Runbooks: guias operacionais relevantes
- Evidência: PR/migration/commit relacionado

| Módulo | Status | Abas | Contratos | Runbooks | Evidência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Pacientes | Implementado | Dados Pessoais; Endereço & Logística; Rede de Apoio; Administrativo; Financeiro; Clínico; Documentos (GED); Histórico & Auditoria | [Índice de Contratos (Pacientes)](./contracts/pacientes/INDEX.md) | [ONBOARDING](./runbooks/ONBOARDING.md); [migrations-workflow](./runbooks/migrations-workflow.md); [auth-tenancy](./runbooks/auth-tenancy.md) | — |
| Prontuários | Em desenvolvimento | — | — | — | — |
| Agendamentos | Não iniciado | — | — | — | — |
| Escalas | Não iniciado | Visão por Paciente; Visão por Profissional | — | — | — |
| Financeiro | Em contrato | — | — | — | — |
| Home Care Ops | Não iniciado | — | — | — | — |
| Inventário | Não iniciado | — | — | — | — |
| Configurações | Em desenvolvimento | — | — | — | — |

## Roadmap por módulo (P2)

- Pacientes
  - P1: Contratos das ABAs 02–08 aprovados e versionados; índice atualizado (evidência: `docs/contracts/pacientes/INDEX.md`).
  - P1: Runbooks de lacunas (auditoria endpoint; storage de fotos) — esqueleto entregue; evidências vinculadas no ONBOARDING.
  - P2: Modelo mínimo de GED e trilha de auditoria integrada.

- Escalas
  - P1→P2: Criar `docs/contracts/escalas/INDEX.md` e contratos base (visão por Paciente e por Profissional).
  - P2: UI (visões) + integração de auditoria (checkin/checkout/approval).

- Financeiro
  - P1→P2: Índice + contrato inicial alinhados ao fluxo de Escalas; integração mínima com Pacientes.

- Configurações
  - P2: Consolidar políticas (tenancy/RLS) e parametrizações chaves; documentação operacional.