# AGENT.md - AI single source of truth (Conecta Care)

Purpose
- This file is the single source of truth for AI guidance in this repo.
- If any other AI doc conflicts with this file, AGENT.md wins.
- Other AI docs are stubs that link here to avoid drift.

Scope
- Applies to all assistants: Codex (VS Code), Gemini local, Copilot, ChatGPT, Codex Web, Vercel Agent.
- Defines governance, non-negotiables, stop conditions, and operational flow.

## Governance flow (mandatory order)

Contract -> Migrations -> Types -> Actions -> UI -> Docs/Runbooks/Review

Rules
- Do not skip the order.
- Contract is the source of truth. If missing, create a draft and request approval.

## Tooling and roles

- Codex (VS Code): executes changes in the repo (code, docs, migrations).
- ChatGPT: discusses decisions, writes contracts/ADRs, defines plan and commands.
- Codex Web: PR review (only reviews PRs, not raw commits).
- Vercel Agent: automated review in Vercel/GitHub.
- Humans: make product decisions and final approvals.

## Non-negotiables (do not violate)

- Multi-tenant + RLS: tenant_id required; RLS enforced in DB and app.
- Soft delete: use deleted_at; do not hard delete by default.
- UI standard: Microsoft Dynamics / Fluent classic shell.
- Executor does not decide product or scope without explicit approval.
- No secrets in repo: do not commit .env or keys; keep .env.example only.
- No "MVP" shortcuts that reduce governance or quality.

## Stop conditions (pause and ask)

Stop and ask for a decision when any of the following is true:
- Missing or unclear contract/ADR for the requested change.
- Conflicting instructions between docs or between doc and code.
- Schema mismatch between DTOs and DB (do not invent columns).
- Request implies a major refactor or pattern change without explicit approval.
- Security risk or secret exposure is suspected.

## Required reading before changes

- Canonical UI HTML: html/modelo_final_aparencia_pagina_do_paciente.htm
- Contracts: docs/contracts/**
- Reviews: docs/reviews/**
- Runbooks: docs/runbooks/**
- Architecture: docs/architecture/**

If a referenced path does not exist, do not invent it. Search for the closest existing source.

## Pre-flight / boot sequence

- git status -sb (understand working tree state)
- git checkout main
- git pull
- git checkout -b <branch>
- Run npm run verify or record why it could not run.
- For work larger than a small doc change, create a plan (steps, risks, validation, evidence).

## Product and platform vision (core rules)

- Escalas is the operational core.
- Pacientes is the data anchor feeding Escalas, Financeiro, Inventario, Clinico, GED, and Auditoria.
- GED + Auditoria provide compliance, evidence, and traceability.
- Multi-tenant and auditability are required for all domain data.

## Escalas (core behavior)

- Shifts are 12h per patient (2 shifts per day).
- Swap/changes require approval (escalista/supervisor).
- Check-in/out uses geo + biometric API (ex: SERPRO) + BLE presence pings.
- Financeiro ties to shift events (late/early adjustments with approvals).

## UI standard (Dynamics / Fluent classic)

- Global header: keep the Conecta Care shell.
- Command bar: top actions; title "Conecta Care . Pacientes".
- Record header: patient avatar + name + metadata (status, alergia, etc).
- Tabs (inline, no pills): Dados pessoais, Endereco & logistica, Rede de apoio, Administrativo,
  Financeiro, Clinico, Documentos/GED, Historico & Auditoria.
- Layout: 2/3 + 1/3 grid with cards; sidebar for status/auditoria/timeline.
- Stack: Fluent classic + CSS/Tailwind simple. Do not use MUI or Fluent 2.

Canonical UI references
- html/modelo_final_aparencia_pagina_do_paciente.htm
- html/comparativo-fluent.html (legacy reference)
- src/app/pacientes/page.tsx and src/app/pacientes/[id]/page.tsx

## Data and migrations discipline

- Never edit old migrations once applied.
- New migrations must link to the contract at the top of the file.
- Avoid fragile or paranoid DB regex checks; DB validates minimal consistency, app validates strongly.
- If schema is unknown, pause and document the question before changing code.

## Repo vs DB sync procedure

1) Compare DTOs with DB schema snapshots (db/snapshots if present).
2) If a column or constraint is missing, pause and document in docs/architecture/OPEN_TODO.md.
3) Do not invent schema; use explicit mock or placeholder with documentation.
4) Only propose migrations after alignment.

## Audit and last update

- Prefer created_at/updated_at and created_by/updated_by if available.
- UI should show "Ultima alteracao" (date + author) where data exists.
- Event naming pattern: <dominio>.<entidade>.<acao> (keep audit payload contextual).

## Actions and UX quality

- Validate inputs (Zod), normalize data, and return user-friendly errors.
- UI should not expose raw error payloads.
- Keep logs technical, UI messages simple.

## Sensitive data handling

- If granular RBAC is required, use a staged approach (satellite table, backfill, policy, migration plan).
- Do not execute sensitive data separation without explicit approval.

## Branch, commits, and PR workflow

- One branch per unit of work.
- Open PR early as Draft to enable automated reviewers.
- Run npm run verify before Ready for review (or document why it failed).
- Commit prefixes: feat, fix, docs, chore, refactor, ci.

## AI runtime and config notes

- There is no AI SDK or runtime integration in the app dependencies today.
- supabase/config.toml contains openai_api_key for Supabase Studio AI only (not app runtime).
- Vector storage config exists but is disabled by default.
- Any future AI runtime must be explicit, documented, and approved.

## Stubs policy (anti-drift)

- docs/process/ai/gemini.md, CODEX_GUIDE.md, AI_TOOLING.md, CODEX_QUESTIONS.md are stubs.
- .github/copilot-instructions.md is a minimal pointer to this file.

## References

- Architecture: docs/architecture/SYSTEM_ARCHITECTURE.md
- Contracts: docs/contracts/
- Runbooks: docs/runbooks/
- Open questions: see Appendix below

## Appendix: Open questions (from CODEX_QUESTIONS)

Escalas
1) What are the official shift statuses and where are approvals stored?
   - Context: docs/architecture/SYSTEM_ARCHITECTURE.md (Section 3), docs/process/ai/CODEX_GUIDE.md (legacy).
2) What is the shift swap flow (who requests, who approves, required audit events)?
   - Context: event taxonomy in legacy CODEX_GUIDE content.
3) Check-in/out: which biometric API and geo/BLE payload is required?
   - Context: core requirements mention SERPRO and BLE; schema pending.
4) Are there rounding/tolerance rules for hours that impact billing?

Auditoria
1) Is there a centralized audit endpoint/service, and what is the minimum schema?
2) Data retention/anonymization policy for audit history (LGPD)?
3) Is there a unified Patient History endpoint aggregating Escalas/GED/admin?
   - Context: SYSTEM_ARCHITECTURE.md vision and HTML prototype.

Security / Multi-tenant
1) What are the official roles and allowed actions for Pacientes and Escalas?

Data / Schema
1) Should readable IDs (PAC-000123) be stored or display-only?
2) Where will GED documents be stored, versioned, and linked?
3) Clinico/Financeiro/Inventario: which datasets are mirrored vs created from scratch?

## Appendix: Answered questions (from CODEX_QUESTIONS)

- Tenant identification and isolation: tenant_id from Supabase Auth JWT; RLS enforces isolation.
  - Sources: docs/runbooks/auth-tenancy.md, docs/architecture/SYSTEM_ARCHITECTURE.md
- Paciente schema (ABA01): defined in docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md.
