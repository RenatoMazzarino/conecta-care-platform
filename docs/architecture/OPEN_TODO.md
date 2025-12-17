# OPEN_TODO

Backlog técnico priorizado (máximo 15 itens), separado por criticidade. Manter este arquivo sempre alinhado ao estado real; quando um item for concluído, mova para "Concluídos (com evidência)" com os links comprobatórios.

## P0 (Críticos / fundacionais)
- **Segurança/RLS multi-tenant** — DoD: roles/claims e escopo por empresa documentados e aplicados em pacientes/escalas; validação no front/back.  
- **Auditoria granular (core)** — DoD: lista de eventos + campos mínimos (actor, role, origem, geo/IP, payload) incorporada ao fluxo e ao endpoint de auditoria.  
- **Serviço Auditoria/Histórico** — DoD: endpoint unificado capaz de anexar eventos de escalas, GED e administrativos por paciente/tenant.  
- **Serviços Escalas (paciente/profissional)** — DoD: rotas/handlers para plantões 12h com aprovação obrigatória e payload mínimo de checkin/checkout.  

## P1 (Importantes)
- **UI Escalas (paciente/profissional)** — DoD: telas na casca do módulo (Pacientes / estilo “Dynamics”) com command bar + header contextual + abas + cards, ações de aprovação/ocorrências (mock inicial permitido).  
- **Abas Financeiro/Clínico/Documentos/Histórico dinâmicas** — DoD: conteúdo vindo de fonte real ou mock explícito mapeado; sem dados fictícios.  
- **Modelo mínimo de GED** — DoD: metadados + vínculos com paciente/entidades operacionais descritos e compatíveis com auditoria.  
- **Pipeline de lint no CI** — DoD: `npm run lint` rodando no CI com status gate.  

## P2 (Melhorias / qualidade)
- **Home alinhada ao estado real** — DoD: módulos inexistentes marcados como “em breve” ou apontando para novas rotas de Escalas.  
- **Smoke tests manuais documentados** — DoD: roteiro de validação para `/pacientes` e `/pacientes/[id]`; plano de e2e quando Escalas estiver disponível.

---

## Concluídos (com evidência)
- (P0) **API Pacientes (Supabase)** — DoD cumprido (DTOs alinhados ao schema real; listagem/detalhe consumindo API real, sem campos inventados).  
  Evidências: `docs/reviews/PR_FEAT_PACIENTES_ABA01.md` (seção "UI/Actions"), `src/features/pacientes/actions/*`, `src/types/supabase.ts`.
- (P0) **Schema paciente formalizado** — DoD cumprido (tabela/documentação + constraints no repositório).  
  Evidências: `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md` (v0.4 Aprovado), `docs/contracts/pacientes/README.md` (migrations relacionadas), `supabase/migrations/*` listadas no índice do contrato.
