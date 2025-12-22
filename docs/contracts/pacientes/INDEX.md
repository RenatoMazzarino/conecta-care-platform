# Índice de Contratos — Módulo Pacientes

Status: ATUAL — ABA01 implementada; ABA02 em revisao; ABA03 em implementacao.

Este índice consolida os contratos por ABA do módulo Pacientes. Ele é o apontador canônico para os contratos do módulo e deve ser atualizado conforme novos contratos forem aprovados.

## ABAs e Contratos

| ABA | Status | Contrato |
| :-- | :----- | :------- |
| ABA01 — Dados Pessoais | Implementado | [ABA01_DADOS_PESSOAIS.md](./ABA01_DADOS_PESSOAIS.md) |
| ABA02 — Endereço & Logística | Em revisao | [ABA02_ENDERECO_LOGISTICA.md](./ABA02_ENDERECO_LOGISTICA.md) |
| ABA03 — Rede de Apoio | Em implementacao | [ABA03_REDE_APOIO.md](./ABA03_REDE_APOIO.md) |
| ABA04 — Administrativo | A definir | — |
| ABA05 — Financeiro | A definir | — |
| ABA06 — Clínico | A definir | — |
| ABA07 — Documentos (GED) | A definir | — |
| ABA08 — Histórico & Auditoria | A definir | — |

Notas:

- Os nomes das ABAs seguem o padrão visual de navegação documentado em `AGENT.md` e a arquitetura canônica em `docs/architecture/SYSTEM_ARCHITECTURE.md`.
- Quando um contrato for aprovado para uma ABA, substitua “A definir” por “Em contrato/Implementado” e adicione o link do documento correspondente.

Anexos ABA02:

- Cobertura do legado no contrato: [Anexos ABA02](./ABA02_ENDERECO_LOGISTICA.md#anexos-cobertura-do-legado-fonte-docsrepo_antigoschema_currentsql).

## Referências ABA03

- Contrato e cobertura de legado: `docs/contracts/pacientes/ABA03_REDE_APOIO.md`
- Plano associado: `docs/reviews/PLANO_PACIENTES_ABA03_REDE_APOIO.md`

## Evidências

- Contrato ABA01 aprovado: `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`.
- Contrato ABA02 em revisao: `docs/contracts/pacientes/ABA02_ENDERECO_LOGISTICA.md`.
