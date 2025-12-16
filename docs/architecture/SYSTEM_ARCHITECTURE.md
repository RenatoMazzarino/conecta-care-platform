# Arquitetura do Sistema - Conecta Care

Este é o documento canônico que descreve a arquitetura da plataforma Conecta Care. Ele serve como fonte da verdade para o estado atual do sistema, a visão de longo prazo e os princípios que guiam o desenvolvimento.

## 1. Princípios Arquiteturais

Estes são os pilares que sustentam a plataforma. Todas as novas features e refatorações devem respeitá-los.

- **Governança de Dados via Contratos**: O fluxo de desenvolvimento é "contract-driven": `Contrato -> Migration -> Types -> Actions -> UI`. Não se deve implementar campos ou lógicas que não estejam formalizados em um contrato.
- **Segurança e Multi-tenancy por Design**: O sistema é multi-tenant. Cada registro de dado sensível deve ser associado a um `tenant_id` e protegido por políticas de Row-Level Security (RLS) no Supabase. O acesso é negado por padrão. (ver `docs/runbooks/auth-tenancy.md`).
- **Soft Deletes**: Nenhum dado é permanentemente apagado. A exclusão é lógica, utilizando um campo como `deleted_at`.
- **Auditabilidade Completa**: Todas as ações que alteram o estado do sistema ou acessam dados sensíveis devem gerar um evento de auditoria. A taxonomia de eventos (ex: `schedule.shift.create`) é mandatória.
- **Módulo de Escalas é o Core**: O módulo de **Escalas** é o coração da operação. Os demais módulos (Pacientes, Financeiro, etc.) existem para dar suporte ou consumir dados gerados pelas escalas.
- **Padrão de UI Consistente (Dynamics-Style)**: A interface segue um padrão visual unificado, inspirado no Microsoft Dynamics e Fluent UI. A referência canônica é `html/modelo_final_aparencia_pagina_do_paciente.htm`. Reutilizar a "casca" do módulo de Pacientes é mandatório.

## 2. Estado Atual

Esta seção descreve a implementação **real e existente** no repositório.

- **Plataforma**: Next.js 16 com App Router.
- **Estilo**: Tailwind 4 e Fluent UI 9. O tema e a estrutura visual base estão em `src/components/FluentProviderWrapper.tsx` e `src/app/globals.css`.
- **Módulo Principal Implementado: Pacientes**:
    - **Rotas**: `src/app/pacientes` (lista) e `src/app/pacientes/[id]` (detalhe).
    - **Layout**: O "shell" do módulo (CommandBar, Record Header, Abas) está implementado e é a base para futuros módulos.
        - Lista: `src/components/layout/CommandBar.tsx`
        - Detalhe: `src/app/pacientes/[id]/PatientPageClient.tsx`
    - **Dados**: Conectado ao Supabase para a aba "Dados Pessoais". As demais abas são placeholders. Actions estão em `src/features/pacientes/actions/*`.
- **Autenticação**: Mínima, via Supabase Auth. A página de login está em `src/app/login/page.tsx`.
- **Base de Dados (Supabase)**:
    - O cliente Supabase está em `src/lib/supabase/client.ts`.
    - As migrações de schema (incluindo tabelas e políticas de RLS) estão em `supabase/migrations`.
    - Os tipos TypeScript gerados a partir do schema estão em `src/types/supabase.ts`.
- **Módulos Placeholder**: Escalas, Financeiro, Inventário, GED e outros são apenas placeholders nas rotas e na UI, sem implementação de backend.

Para um mapa detalhado de arquivos e pastas, consulte o [REPO_MAP.md](./REPO_MAP.md).
Para detalhes técnicos da implementação atual, consulte a [ARCHITECTURE_REAL.md](./ARCHITECTURE_REAL.md).

## 3. Visão de Longo Prazo

Esta seção descreve a **visão de futuro** para a plataforma. Não representa o estado atual, mas sim o alvo que buscamos alcançar.

- **Visão 360**: Construir uma plataforma operacional completa para Home Care, onde:
    - **Escalas** é o motor da operação, gerenciando cobertura de atendimento, presença de profissionais e gerando dados para faturamento.
    - **Pacientes** é a base de dados central que alimenta todos os outros módulos.
    - **GED e Auditoria** garantem conformidade e rastreabilidade total.
    - **Financeiro, Inventário e Clínico** são módulos de suporte que refletem a operação em tempo real.
- **Core de Escalas**: O modelo de escalas será baseado em plantões de 12h por paciente, com fluxos de aprovação para trocas, e um sistema de check-in/checkout robusto (geo, biometria, BLE) para garantir a presença do profissional.
- **Ecossistema Integrado**: Todos os módulos conversarão entre si, com o paciente como entidade central, eliminando silos de informação.

## 4. Backlog Técnico

As tarefas de desenvolvimento, melhorias e débitos técnicos priorizados estão documentados no `OPEN_TODO.md`. Este documento funciona como nosso backlog ativo.

- **[Consulte o Backlog Técnico aqui](./OPEN_TODO.md)**
