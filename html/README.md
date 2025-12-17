# Protótipos HTML — Referência Visual (não canônico)

Aviso importante:

- Estes arquivos HTML servem apenas como referência visual/estática (protótipos) para orientar padrões de UI.
- Não são fonte de verdade funcional nem arquitetural. As fontes canônicas são:
  - Arquitetura (canônico): [`docs/architecture/SYSTEM_ARCHITECTURE.md`](../docs/architecture/SYSTEM_ARCHITECTURE.md)
  - Decisões (ADRs): [`docs/architecture/decisions/`](../docs/architecture/decisions/)
  - Contratos (features): [`docs/contracts/`](../docs/contracts/)
  - Runbooks: [`docs/runbooks/`](../docs/runbooks/)

## Arquivos

- `modelo_final_aparencia_pagina_do_paciente.htm` — Padrão visual de detalhe do Paciente (estilo “Dynamics”).
- `comparativo-fluent.html` — Comparativo visual para reforçar o padrão desejado (Fluent clássico).

## Como usar

- Use como referência de casca/estrutura (header, command bar, record header, abas, cards). Para comportamento real, consulte os contratos e a implementação.
- Ao implementar telas, siga a regra: `Contrato → Migrations → Types → Actions → UI` (ver `docs/README.md`).
