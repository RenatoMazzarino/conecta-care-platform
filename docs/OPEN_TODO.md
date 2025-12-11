# OPEN_TODO

Pendências reais (priorizadas) – máximo 15 itens.

## Segurança/Permissões
- Modelo de tenants/perfis definido e aplicado no front/back — DoD: roles/claims claros + checagem de escopo nas páginas/serviços de pacientes/escalas.
- Trilha de auditoria desenhada para ações sensíveis — DoD: lista de eventos + campos mínimos (actor, role, origem, geo/IP, payload) documentada e acoplada ao fluxo de UI.

## Backend/API
- Integrar pacientes ao Supabase — DoD: DTOs alinhados ao schema real, listagem/detalhe consumindo API real sem campos inventados.
- Serviço de auditoria/histórico por paciente — DoD: endpoint unificado especificado e capaz de anexar eventos de escalas, GED e administrativos.
- Serviços de Escalas (paciente e profissional) — DoD: rotas/handlers definidos respeitando plantões 12h, aprovação obrigatória e payload mínimo para checkin/checkout.

## UI
- Telas de Escalas (paciente e profissional) na casca Fluent A — DoD: command bar + header contextual + abas + cards com ações de aprovação/ocorrências (mock inicial permitido).
- Abas Financeiro/Clínico/Documentos/Histórico ligadas a dados reais ou placeholders dinâmicos — DoD: conteúdo vindo de fonte real ou mock explícito, sem dados fictícios não mapeados.
- Home refletindo estado real dos módulos — DoD: módulos inexistentes marcados como “em breve” ou apontando para novas rotas de Escalas.

## Dados/Schema
- Schema de paciente formalizado no Supabase — DoD: tabela/documentação com campos usados no front (PAC-ID, status, alergias, responsável legal) e constraints registradas.
- Modelo mínimo de GED definido — DoD: metadados + vínculos com paciente/entidades operacionais descritos, compatíveis com auditoria.

## Qualidade/Testes
- Pipeline de lint no CI e smoke tests manuais — DoD: `npm run lint` no CI e roteiro de validação de `/pacientes` e `/pacientes/[id]`; plano de e2e quando Escalas estiver disponível.
