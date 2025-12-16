# Arquitetura do Sistema - Conecta Care

Este é o documento canônico que descreve a arquitetura da plataforma Conecta Care. Ele serve como fonte da verdade para os princípios, o estado atual do sistema e a visão de longo prazo.

## 1. Princípios Arquiteturais

Estes são os pilares que sustentam a plataforma. Todas as novas features e refatorações devem respeitá-los.

-   **Governança de Dados via Contratos**: O fluxo de desenvolvimento é "contract-driven": `Contrato -> Migration -> Types -> Actions -> UI`. Não se deve implementar campos ou lógicas que não estejam formalizados em um contrato.
-   **Segurança e Multi-tenancy por Design**: O sistema é multi-tenant. Cada registro de dado sensível deve ser associado a um `tenant_id` e protegido por políticas de Row-Level Security (RLS) no Supabase. O acesso é negado por padrão. (Ver `docs/runbooks/auth-tenancy.md`).
-   **Soft Deletes**: Nenhum dado é permanentemente apagado. A exclusão é lógica, utilizando um campo como `deleted_at`.
-   **Auditabilidade Completa**: Todas as ações que alteram o estado do sistema devem gerar um evento de auditoria rastreável (`created_by`, `updated_by`).
-   **Padrão de UI Consistente (Dynamics-Style)**: A interface segue um padrão visual unificado, inspirado no Microsoft Dynamics. A referência canônica é `html/modelo_final_aparencia_pagina_do_paciente.htm`. A reutilização do "shell" do módulo de Pacientes é mandatória.

## 2. Estado Atual (Implementação Real)

Esta seção descreve a implementação **real e existente** no repositório.

-   **Plataforma**: Next.js com App Router.
-   **Estilo**: Tailwind CSS e Fluent UI 9. O tema (`FluentProviderWrapper.tsx`) e os estilos globais (`globals.css`) definem o padrão visual.
-   **Estrutura de Pastas Principal**:
    -   `src/app`: Rotas e páginas (App Router).
    -   `src/components`: Componentes React compartilhados (layout, UI).
    -   `src/features`: Lógica de negócio por domínio (actions, schemas Zod).
    -   `src/lib`: Clientes e utilitários de bibliotecas (ex: Supabase).
    -   `supabase/migrations`: Migrações de schema do banco de dados.
    -   `docs`: Documentação canônica do projeto.

-   **Módulo Principal Implementado: Pacientes**:
    -   **Rotas**: `src/app/pacientes` (lista) e `src/app/pacientes/[id]` (detalhe).
    -   **Layout (Shell)**: O layout "Dynamics-style" está implementado e serve como base para futuros módulos.
        -   **Command Bar**: `src/components/layout/CommandBar.tsx` (para listas) e em `PatientPageClient.tsx` (para detalhes).
        -   **Record Header, Abas e Grid de Cards**: Estrutura visual principal em `PatientPageClient.tsx`.
    -   **Dados**: A "Aba 01 - Dados Pessoais" está conectada ao Supabase, utilizando Server Actions (`src/features/pacientes/actions/*`) e validação com Zod (`src/features/pacientes/schemas/*`). As demais abas são placeholders.

-   **Autenticação e Segurança**:
    -   **Login**: Página de login mínima em `src/app/login/page.tsx` usando Supabase Auth.
    -   **Guard de Rota**: O componente `PatientPageClient.tsx` verifica a sessão do usuário e redireciona para o login se não estiver autenticado.
    -   **Multi-tenancy**: Implementado no banco com `tenant_id` e RLS.

-   **Base de Dados (Supabase)**:
    -   **Cliente**: `src/lib/supabase/client.ts`.
    -   **Migrações**: `supabase/migrations`.
    -   **Tipos**: Tipos TypeScript gerados a partir do schema em `src/types/supabase.ts`.

## 3. Visão de Longo Prazo

Esta seção descreve a **visão de futuro** para a plataforma, não o estado atual.

-   **Visão 360**: Construir uma plataforma operacional completa para Home Care, onde o módulo de **Escalas** seja o motor da operação, com os demais módulos (Pacientes, Financeiro, etc.) orbitando ao seu redor.
-   **Ecossistema Integrado**: Todos os módulos conversarão entre si, com o paciente como entidade central, eliminando silos de informação.
-   **Core de Escalas**: O modelo de escalas será baseado em plantões, com fluxos de aprovação e um sistema robusto de check-in/checkout.

## 4. Backlog Técnico

As tarefas de desenvolvimento, melhorias e débitos técnicos priorizados estão documentados no `OPEN_TODO.md`. Este documento funciona como nosso backlog ativo.

-   **[Consulte o Backlog Técnico aqui](./OPEN_TODO.md)**
