 # Endpoint Unificado de Auditoria (rascunho)
 
 Aviso: este runbook é um esqueleto inicial. É um processo operacional e não substitui contratos nem arquitetura canônica.
 
 - Arquitetura canônica: [../architecture/SYSTEM_ARCHITECTURE.md](../architecture/SYSTEM_ARCHITECTURE.md)
 - Backlog relacionado: [../architecture/OPEN_TODO.md](../architecture/OPEN_TODO.md) — itens P0 "Serviço Auditoria/Histórico" e P1 "Modelo mínimo de GED"
 
 ## Objetivo
 Descrever o endpoint unificado de auditoria para registrar eventos de Escalas, GED e administrativos por paciente/tenant, com taxonomia consistente.
 
 ## Escopo mínimo
 - Rota única (ex.: `POST /api/audit/events`).
 - Payload com campos mínimos: `event`, `actor_id`, `actor_role`, `tenant_id`, `origin`, `timestamp`, `entity`, `entity_id`, `data` (opcional/contexto).
 - Persistência compatível com consulta por paciente/tenant/intervalo.
 
 ## Taxonomia de eventos (exemplos)
 - Escalas: `schedule.shift.create`, `schedule.checkin`, `schedule.checkout`, `schedule.swap.requested`.
 - Pacientes/GED: `patient.update`, `document.create`, `document.version_create`, `document.download`.
 
 ## Segurança
 - Exigir autenticação e verificação de `tenant_id`.
 - Rate limit por tenant/actor.
 - Validação de payload (schema) e tamanho máximo.
 
 ## Pendências/tarefas
 - [ ] Definir schema do payload (ex.: Zod/JSON Schema) e âncoras de documentação.
 - [ ] Especificar armazenamento (tabela `audit_events` ou coleção equivalente) com índices.
 - [ ] Especificar filtros e paginação para consulta histórica.
 - [ ] Atualizar `OPEN_TODO.md` com evidências quando implementado.
 
 ---
 
 ## Evidências
 - A serem adicionadas (PR, migrations, contratos ou diagramas): vincular quando implementado.