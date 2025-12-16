# REPO_MAP

Estado atual baseado no repositório (sem suposições).

## Front-end (Next.js App Router)
- Páginas: `/` (home com cards de módulos), `/pacientes` (lista em cards), `/pacientes/[id]` (detalhe com abas).  
- Auth: `/login` (login mínimo via Supabase Auth).  
- Layout global: `FluentProviderWrapper` (tema claro/escuro), `Header` (launcher, busca, ações), `Breadcrumb`.  
- Command bar:
  - lista (`/pacientes`): `src/components/layout/CommandBar.tsx`
  - detalhe (`/pacientes/[id]`): command bar “Dynamics style” em `src/app/pacientes/[id]/PatientPageClient.tsx`
- Estilo: `globals.css` com Tailwind 4 e reset (sem travar o scroll vertical global).

## Pastas-chave e finalidade
- `src/app`: rotas/páginas (App Router).  
- `src/components`: componentes compartilhados (layout e paciente).  
- `src/lib`: integrações utilitárias (Supabase client).  
- `docs`: documentação canônica.  
- `html`: referência visual (`comparativo-fluent.html`).  
- `db/snapshots`: dumps/snapshots de schema (quando existirem).

## Domínio Pacientes (base da operação)
- Lista (`src/app/pacientes/page.tsx`): command bar, header de lista com contadores, filtros em abas e cards de pacientes com status/contatos/link.  
- Detalhe (`src/app/pacientes/[id]/page.tsx`): shell no estilo “Dynamics” (command bar + record header + abas em linha).  
  - Aba 01 (Dados pessoais) está conectada ao Supabase (sem mocks) via `src/components/patient/DadosPessoaisTab.tsx`.  
  - As demais abas ainda são placeholders/mock.  
- Componentes de formulário/visualização em `src/components/patient/*`.

## Domínio Escalas (core esperado)
- Nenhuma rota/componente/serviço implementado. Sem tipos ou dados de escala.

## GED / Auditoria
- Apenas placeholders textuais na aba Documentos (GED) e Histórico & Auditoria do detalhe do paciente. Não há integrações, tipos ou storage configurado.

## Financeiro / Inventário / Clínico
- Home lista módulos, mas não há rotas ou serviços implementados. Abas “Financeiro” e “Clínico” no detalhe do paciente são estáticas/mock.

## O que existe vs. placeholders
- **Pacientes**: existe (lista e detalhe com casca do módulo).  
- **Escalas**: a construir (nenhuma rota/componente ainda).  
- **GED**: placeholder em abas; sem implementação real.  
- **Auditoria/Histórico**: placeholder textual; sem integração.  
- **Financeiro/Inventário/Clínico**: placeholders/espelhos listados na home e abas mock.

## Dados / Integrações
- Supabase:
  - client em `src/lib/supabase/client.ts`
  - actions em `src/features/pacientes/actions/*`
  - tipos canônicos: `src/types/supabase.ts`
  - env esperados: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Tipos legados: `src/types/patient.ts` (@deprecated; evitar novos usos).

## Segurança / Permissões / Multi-tenant
- Multi-tenant no banco via `tenant_id` + RLS/policies (migrations em `supabase/migrations/*`).
- Guard de sessão no app para rotas sensíveis (ex.: `/pacientes/[id]`).
- Runbook: `docs/runbooks/auth-tenancy.md`.

## Referência visual
- Detalhe do paciente (estilo “Dynamics”): `html/modelo_final_aparencia_pagina_do_paciente.htm`
- Comparativo anterior: `html/comparativo-fluent.html`

## Pastas-chave do shell (Pacientes)
- Páginas de referência: `src/app/pacientes/page.tsx` e `src/app/pacientes/[id]/page.tsx`.  
- Layout base: `src/components/layout/Header.tsx`, `src/components/layout/Breadcrumb.tsx`, `src/components/layout/CommandBar.tsx` (lista).  
- Detalhe do paciente: `src/app/pacientes/[id]/PatientPageClient.tsx` (command bar + record header + abas).  
- Estilos globais e provider: `src/app/globals.css`, `src/components/FluentProviderWrapper.tsx`.
