# OPEN_TODO

Backlog técnico priorizado (máximo 15 itens), separado por criticidade. Manter este arquivo sempre alinhado ao estado real; quando um item for concluído, mova para "Concluídos (com evidência)" com os links comprobatórios.

## P0 (Críticos / fundacionais)
- **Segurança/RLS multi-tenant** — DoD: roles/claims e escopo por empresa documentados e aplicados em pacientes/escalas; validação no front/back.  
- **Auditoria granular (core)** — DoD: lista de eventos + campos mínimos (actor, role, origem, geo/IP, payload) incorporada ao fluxo e ao endpoint de auditoria.  
- **Serviço Auditoria/Histórico** — DoD: endpoint unificado capaz de anexar eventos de escalas, GED e administrativos por paciente/tenant.  
- **Serviços Escalas (paciente/profissional)** — DoD: rotas/handlers para plantões 12h com aprovação obrigatória e payload mínimo de checkin/checkout.  
 - **Governança de decisões (ADRs 001–006) — CONCLUÍDO** — DoD: ADRs base institucionalizadas como fonte canônica. Evidência em "Concluídos".

## P1 (Importantes)
- **UI Escalas (paciente/profissional)** — DoD: telas na casca do módulo (Pacientes / estilo “Dynamics”) com command bar + header contextual + abas + cards, ações de aprovação/ocorrências (mock inicial permitido).  
- **Abas Financeiro/Clínico/Documentos/Histórico dinâmicas** — DoD: conteúdo vindo de fonte real ou mock explícito mapeado; sem dados fictícios.  
- **Modelo mínimo de GED** — DoD: metadados + vínculos com paciente/entidades operacionais descritos e compatíveis com auditoria.  
 - **Pipeline de lint no CI** — DoD: `npm run lint` rodando no CI com status gate.  
 - **Índices/contratos por módulo/aba** — DoD: índices por módulo com ABAs e contratos aprovados; gaps explícitos.  
 - **Runbooks (lacunas)** — DoD: runbooks mínimos para Storage de fotos em ABA01 e endpoint unificado de Auditoria; ONBOARDING linkando para eles.  
 - **Scripts npm (verify)** — DoD: script `verify` agregando lint, typecheck, build e docs:links; documentado no README/runbooks.  
 - **README/CONTRIBUTING (governança)** — DoD: política de docs no mesmo PR, convenção de commits e link-check obrigatório documentados.  
 - **Proteção de branch** — DoD: checks obrigatórios habilitados (CI + Docs Link Check) nas regras de proteção da `main`.

## P2 (Melhorias / qualidade)
- **Home alinhada ao estado real** — DoD: módulos inexistentes marcados como “em breve” ou apontando para novas rotas de Escalas.  
- **Smoke tests manuais documentados** — DoD: roteiro de validação para `/pacientes` e `/pacientes/[id]`; plano de e2e quando Escalas estiver disponível.
 - **Varredura automatizada de segredos no CI** — DoD: job (ex.: gitleaks/trufflehog) com bloqueio em PR; exceções documentadas.

---

## Concluídos (com evidência)
- (P0) **API Pacientes (Supabase)** — DoD cumprido (DTOs alinhados ao schema real; listagem/detalhe consumindo API real, sem campos inventados).  
  Evidências: `docs/reviews/PR_FEAT_PACIENTES_ABA01.md` (seção "UI/Actions"), `src/features/pacientes/actions/*`, `src/types/supabase.ts`.
- (P0) **Schema paciente formalizado** — DoD cumprido (tabela/documentação + constraints no repositório).  
  Evidências: `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md` (v0.4 Aprovado), `docs/contracts/pacientes/README.md` (migrations relacionadas), `supabase/migrations/*` listadas no índice do contrato.
 - (P0) **ADRs formais 001–006** — DoD cumprido (estrutura + decisões base).  
   Evidências: `docs/architecture/decisions/` (ADRs 001–006 + índice + template), PR #6 (Draft) — branch `chore/repo-governance-docs-p0-p3`.
 - (P0) **CI: Docs Link Check** — DoD cumprido (job no CI; falha se houver link relativo quebrado).  
   Evidências: `.github/workflows/ci.yml` (job “Docs Link Check”), `docs/reviews/DOCS_LINK_CHECK.md` (snapshot), PR #6 (Draft).
 - (P0) **Higiene de segredos (plano de rotação)** — DoD cumprido (política e passos).  
   Evidências: `docs/reviews/SECRETS_ROTATION.md`; `.gitignore` já ignora `.env*`.
