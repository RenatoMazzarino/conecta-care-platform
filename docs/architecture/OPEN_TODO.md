# OPEN_TODO

Backlog técnico priorizado (máximo 15 itens), separado por criticidade. Manter este arquivo alinhado ao estado real; quando um item for concluído, mova para "Concluídos (com evidência)" com links comprobatórios.

## P0 (Críticos / fundacionais)

- **Segurança/RLS multi-tenant** — Owner: @RenatoMazzarino — DoD: roles/claims e escopo por empresa documentados e aplicados em pacientes/escalas; validação no front/back.
- **Auditoria granular (core)** — Owner: @RenatoMazzarino — DoD: lista de eventos + campos mínimos (actor, role, origem, geo/IP, payload) incorporada ao fluxo e ao endpoint de auditoria.
- **Serviço Auditoria/Histórico** — Owner: @RenatoMazzarino — DoD: endpoint unificado capaz de anexar eventos de escalas, GED e administrativos por paciente/tenant.
- **Serviços Escalas (paciente/profissional)** — Owner: @RenatoMazzarino — DoD: rotas/handlers para plantões 12h com aprovação obrigatória e payload mínimo de checkin/checkout.

## P1 (Importantes)

- **UI Escalas (paciente/profissional)** — Owner: @RenatoMazzarino — DoD: telas na casca do módulo (Pacientes / estilo “Dynamics”) com command bar + header contextual + abas + cards, ações de aprovação/ocorrências (mock inicial permitido).
- **Abas Financeiro/Clínico/Documentos/Histórico dinâmicas** — Owner: @RenatoMazzarino — DoD: conteúdo vindo de fonte real ou mock explícito mapeado; sem dados fictícios.
- **Modelo mínimo de GED** — Owner: @RenatoMazzarino — DoD: metadados + vínculos com paciente/entidades operacionais descritos e compatíveis com auditoria.
- **Proteção de branch** — Owner: @RenatoMazzarino — DoD: checks obrigatórios habilitados (CI + Docs Link Check + Docs Markdown Lint + Secrets Scan) nas regras de proteção da `main`. Evidência parcial: `docs/runbooks/branch-protection.md` + `docs/reviews/analise-governanca-estrutura-2025-12-19/BRANCH_PROTECTION_CHECKLIST.md`.

### Gaps de contratos (P1)

- **Pacientes — ABAs 02–08 sem contrato aprovado** — Owner: @RenatoMazzarino — DoD: contratos por ABA aprovados e versionados; evidência viva: `docs/contracts/pacientes/INDEX.md`.
- **Escalas — contratos base pendentes** — Owner: @RenatoMazzarino — DoD: contratos base (visões por paciente e por profissional); evidências: `docs/contracts/escalas/INDEX.md`, `docs/MODULE_STATUS.md`.
- **Financeiro — contrato inicial pendente** — Owner: @RenatoMazzarino — DoD: contrato inicial alinhado ao fluxo de Escalas; evidência: `docs/contracts/financeiro/INDEX.md`.

## P2 (Melhorias / qualidade)

- **Home alinhada ao estado real** — Owner: @RenatoMazzarino — DoD: módulos inexistentes marcados como “em breve” ou apontando para novas rotas de Escalas.
- **Smoke tests manuais documentados** — Owner: @RenatoMazzarino — DoD: roteiro de validação para `/pacientes` e `/pacientes/[id]`; plano de e2e quando Escalas estiver disponível.

## GitHub Issues Mapping (sugestões)

| Item | Issue title sugerido | Labels | Link |
| --- | --- | --- | --- |
| Segurança/RLS multi-tenant | [p0] Implementar RLS completo em Escalas e Auditar claims | p0, security, backend | — |
| Auditoria granular (core) | [p0] Definir taxonomia e schema de auditoria | p0, backend, audit | — |
| Serviço Auditoria/Histórico | [p0] Implementar endpoint unificado de auditoria | p0, backend, audit | — |
| Serviços Escalas | [p0] Criar handlers de Escalas (checkin/checkout/aprovação) | p0, backend | — |
| UI Escalas | [p1] Construir UI base de Escalas (paciente/profissional) | p1, frontend | — |
| Modelo mínimo de GED | [p1] Definir modelo mínimo de GED e contratos | p1, backend, docs | — |
| Home alinhada ao estado real | [p2] Ajustar home para módulos não implementados | p2, frontend | — |
| Smoke tests manuais | [p2] Documentar smoke tests manuais | p2, qa, docs | — |

---

## Concluídos (com evidência)

- (P0) **ADRs formais 001–006** — DoD cumprido (estrutura + decisões base).
  Evidências: `docs/architecture/decisions/` (ADRs 001–006 + índice + template), `docs/architecture/decisions/README.md`.
- (P0) **CI: Docs Link Check** — DoD cumprido (job no CI; falha se houver link relativo quebrado).
  Evidências: `.github/workflows/ci.yml` (job “Docs Link Check”), `docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_LINK_CHECK.md`.
- (P0) **Higiene de segredos (plano de rotação)** — DoD cumprido (política e passos).
  Evidências: `docs/reviews/analise-governanca-estrutura-2025-12-19/SECRETS_ROTATION.md`.
- (P1) **Pipeline de lint no CI** — DoD cumprido (`npm run lint` em CI).
  Evidências: `.github/workflows/ci.yml` (job “CI”).
- (P1) **Índices/contratos por módulo/aba** — DoD cumprido (índices mínimos por módulo + gaps explícitos).
  Evidências: `docs/contracts/README.md`, `docs/contracts/*/INDEX.md`, `docs/MODULE_STATUS.md`.
- (P1) **Runbooks (lacunas)** — DoD cumprido (runbooks operacionais completos).
  Evidências: `docs/runbooks/auditoria-endpoint.md`, `docs/runbooks/storage-photos-aba01.md`, `docs/runbooks/security-incident-response.md`, `docs/runbooks/security-backups-access-rotation.md`, `docs/runbooks/security-secrets-scanning.md`, `docs/reviews/analise-governanca-estrutura-2025-12-19/RUNBOOKS_FINAL_REVIEW.md`.
- (P1) **Scripts npm (verify)** — DoD cumprido (verify agrega lint, typecheck, build, docs:links, docs:lint).
  Evidências: `package.json`, `scripts/docs-link-check.mjs`.
- (P1) **README/CONTRIBUTING (governança)** — DoD cumprido.
  Evidências: `README.md`, `CONTRIBUTING.md`, `docs/README.md`.
- (P2) **Secret scanning no CI** — DoD cumprido (gitleaks com gate forte).
  Evidências: `.github/workflows/ci.yml` (job “Secrets Scan”), `.gitleaks.toml`, `docs/runbooks/security-secrets-scanning.md`.
- (P2) **Docs Markdown Lint (gate forte)** — DoD cumprido (markdownlint hard gate + baseline zero).
  Evidências: `.github/workflows/ci.yml` (job “Docs Markdown Lint”), `.markdownlint.jsonc`, `docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_MARKDOWN_LINT.md`.
- (P0) **API Pacientes (Supabase)** — DoD cumprido (DTOs alinhados ao schema real; listagem/detalhe consumindo API real, sem campos inventados).
  Evidências: `docs/reviews/PR_FEAT_PACIENTES_ABA01.md`, `src/features/pacientes/actions/*`, `src/types/supabase.ts`.
- (P0) **Schema paciente formalizado** — DoD cumprido (tabela/documentação + constraints no repositório).
  Evidências: `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`, `docs/contracts/pacientes/README.md`.
