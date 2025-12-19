# ADR-004: UI padrão "Dynamics" (Fluent clássico)

Status: Accepted
Data: 2025-12-17
Owner: @RenatoMazzarino

Contexto

- Precisamos de uma experiência consistente e enterprise nas telas, favorecendo produtividade e manutenção. Já há um HTML canônico que modela a página do paciente.

Decisão

- Adotar o padrão visual inspirado no Microsoft Dynamics: **command bar + record header + abas + grid de cards (com sidebar onde fizer sentido)**.
- O HTML canônico `html/modelo_final_aparencia_pagina_do_paciente.htm` é a referência mandatória.
- Telas novas devem reutilizar a “casca” do módulo Pacientes, evitando bibliotecas de UI divergentes.

Alternativas consideradas

- UI livre por módulo: rejeitado por fragmentação visual e custo de manutenção.
- Adotar outro design system sem referência canônica: rejeitado por risco de inconsistência e retrabalho.

Consequências

- Consistência visual entre módulos; curva de aprendizado menor.
- Menos liberdade para experimentos visuais fora do padrão; facilita revisão e QA.

Referências

- html/modelo_final_aparencia_pagina_do_paciente.htm
- docs/process/ai/CODEX_GUIDE.md (padrões de UI)
- docs/architecture/SYSTEM_ARCHITECTURE.md (Princípios)
