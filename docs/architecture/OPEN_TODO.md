# OPEN_TODO

Pendências reais (priorizadas) – máximo 15 itens.

1) **Segurança/RLS multi-tenant** (P0) — DoD: roles/claims e escopo por empresa documentados e aplicados em pacientes/escalas; validação no front/back.  
2) **Auditoria granular (core)** (P0) — DoD: lista de eventos + campos mínimos (actor, role, origem, geo/IP, payload) incorporada ao fluxo e ao endpoint de auditoria.  
3) **API Pacientes (Supabase)** (P0) — DoD: DTOs alinhados ao schema real, listagem/detalhe consumindo API real sem campos inventados.  
4) **Serviço Auditoria/Historico** (P0) — DoD: endpoint unificado capaz de anexar eventos de escalas, GED e administrativos por paciente/tenant.  
5) **Serviços Escalas (paciente/profissional)** (P0) — DoD: rotas/handlers para plantões 12h com aprovação obrigatória e payload mínimo de checkin/checkout.  
6) **UI Escalas (paciente/profissional)** (P1) — DoD: telas na casca do módulo (Pacientes / estilo “Dynamics”) com command bar + header contextual + abas + cards, ações de aprovação/ocorrências (mock inicial permitido).  
7) **Abas Financeiro/Clínico/Documentos/Histórico dinâmicas** (P1) — DoD: conteúdo vindo de fonte real ou mock explícito mapeado; sem dados fictícios.  
8) **Home alinhada ao estado real** (P2) — DoD: módulos inexistentes marcados como “em breve” ou apontando para novas rotas de Escalas.  
9) **Schema paciente formalizado** (P0) — DoD: tabela/documentação com campos usados no front (PAC-ID, status, alergias, responsável legal) e constraints registradas no repositório.  
10) **Modelo mínimo de GED** (P1) — DoD: metadados + vínculos com paciente/entidades operacionais descritos e compatíveis com auditoria.  
11) **Pipeline de lint no CI** (P1) — DoD: `npm run lint` rodando no CI com status gate.  
12) **Smoke tests manuais documentados** (P2) — DoD: roteiro de validação para `/pacientes` e `/pacientes/[id]`; plano de e2e quando Escalas estiver disponível.
