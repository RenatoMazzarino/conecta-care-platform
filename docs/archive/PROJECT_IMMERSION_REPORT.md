# Relatório de Imersão no Projeto Conecta Care

## Visão Geral do Projeto

O Conecta Care é uma plataforma SaaS para gestão de operações de home care. O sistema visa unificar o gerenciamento de pacientes, prontuários, escalas de profissionais, inventário e finanças em um único ecossistema. A arquitetura é moderna, utilizando Next.js para o frontend e Supabase (PostgreSQL) para o backend, com um forte foco em governança de dados e segurança.

O projeto segue uma filosofia "contract-driven", onde toda funcionalidade é primeiramente definida em um documento de contrato antes da implementação, garantindo clareza e alinhamento. A interface do usuário é padronizada para seguir o estilo visual do Microsoft Dynamics, proporcionando uma experiência consistente e profissional.

## Arquitetura Técnica Resumida

- **Frontend**: Next.js 14+ com App Router.
- **Backend**: Supabase (PostgreSQL, Auth, Storage).
- **Estilo**: Tailwind CSS e Fluent UI, com um tema customizado que emula o Microsoft Dynamics.
- **Banco de Dados**: PostgreSQL gerenciado pelo Supabase, com schemas e migrações versionadas.
- **Autenticação**: Supabase Auth, utilizando JWTs para gerenciar sessões e `tenant_id`.
- **Tipagem**: TypeScript, com tipos gerados automaticamente a partir do schema do banco de dados.

## Padrões Obrigatórios (Governança)

- **Contract-Driven Development**: Nenhuma funcionalidade é implementada sem um contrato formal aprovado em `docs/contracts`.
- **Segurança por Design**: Todas as tabelas com dados sensíveis devem ser multi-tenant, utilizando `tenant_id` e políticas de Row-Level Security (RLS). O acesso é negado por padrão.
- **Soft Deletes**: Registros não são excluídos permanentemente. Utiliza-se um campo `deleted_at` para exclusão lógica.
- **Auditabilidade**: Todas as ações de modificação de dados devem ser rastreáveis (através de `created_by`, `updated_by`).
- **UI Consistente**: A interface deve seguir o padrão visual definido no arquivo `html/modelo_final_aparencia_pagina_do_paciente.htm`.

## Fluxo de Trabalho Oficial

O desenvolvimento segue um fluxo estrito e sequencial:

1. **Contrato**: Criação ou atualização de um documento de contrato em `docs/contracts` que define a funcionalidade.
2. **Migrations**: Criação de uma nova migração de banco de dados em `supabase/migrations` para refletir as mudanças do contrato.
3. **Types**: Regeneração dos tipos TypeScript a partir do schema do banco com `supabase gen types`.
4. **Actions**: Implementação das lógicas de negócio (Server Actions) que interagem com o banco de dados.
5. **UI**: Desenvolvimento ou atualização da interface do usuário, consumindo as actions e tipos gerados.

## UI / UX Padrão Adotado

A interface do usuário é fortemente inspirada no **Microsoft Dynamics**. As características principais são:

- **Command Bar**: Uma barra de ações no topo da página com botões como "Salvar", "Editar", "Imprimir".
- **Record Header**: Uma seção de cabeçalho que exibe o nome do registro principal (ex: nome do paciente) e metadados importantes.
- **Abas (Tabs)**: Navegação principal dentro de uma página de detalhes, onde cada aba corresponde a um contrato.
- **Layout em Grid**: O conteúdo principal é organizado em um layout de 2 ou 3 colunas, com "cards" que agrupam informações relacionadas.
- **Consistência Visual**: A referência canônica é o arquivo `html/modelo_final_aparencia_pagina_do_paciente.htm`.

## Segurança, Tenancy e Dados

- **Multi-tenancy**: A isolação de dados entre diferentes clientes (tenants) é garantida pelo uso obrigatório da coluna `tenant_id` em tabelas sensíveis.
- **Row-Level Security (RLS)**: O Supabase utiliza RLS para garantir que um usuário só possa acessar os dados do seu próprio `tenant_id`. As políticas são definidas nas migrações.
- **JWT com `tenant_id`**: O `tenant_id` do usuário é injetado no JWT durante o login e extraído no backend pela função `app_private.current_tenant_id()`.
- **Soft Delete**: A exclusão de dados é sempre lógica, preenchendo a coluna `deleted_at`. As políticas de RLS garantem que registros "deletados" não sejam retornados nas queries.

## O que está Fechado e Não Deve Ser Alterado

- **Módulo de Pacientes (Aba 01 - Dados Pessoais)**: A estrutura e implementação desta aba estão concluídas e servem como modelo para futuros módulos.
- **Fluxo de Trabalho (Contrato → Migrations → Types → Actions → UI)**: Este é o processo de desenvolvimento padrão e não deve ser contornado.
- **Padrão Visual (Dynamics-style)**: A estrutura de UI com Command Bar, Record Header e Abas é uma decisão fechada.
- **Arquitetura de Segurança**: O modelo de multi-tenancy com RLS e `tenant_id` no JWT é a base da segurança do sistema.

## Cuidados que o Assistente Deve Ter

- **Respeitar o Fluxo de Trabalho**: Nunca pular a etapa do contrato ou da migração antes de codificar a UI.
- **Manter a Consistência da UI**: Sempre usar o `modelo_final_aparencia_pagina_do_paciente.htm` como referência para novos componentes e páginas.
- **Garantir a Segurança**: Ao criar novas tabelas ou queries, sempre considerar o isolamento por `tenant_id` e as políticas de RLS.
- **Não Reinventar a Roda**: Reutilizar os componentes e padrões já estabelecidos no módulo de Pacientes.

## Checklist Mental Antes de Qualquer PR

1. A minha alteração está documentada em um **contrato**?
2. Eu criei uma **migration** para as mudanças no banco de dados?
3. Eu regenerei os **tipos** do Supabase?
4. A minha UI segue o padrão **Dynamics-style**?
5. As minhas queries e políticas de RLS garantem o isolamento por **`tenant_id`**?
6. Eu estou utilizando **soft delete** em vez de `DELETE` permanente?
7. A minha alteração está alinhada com as **decisões de arquitetura** já documentadas?

## Glossário Rápido do Projeto

- **Contrato**: A "fonte da verdade" para uma funcionalidade.
- **Dynamics-style**: O padrão de UI inspirado no Microsoft Dynamics.
- **RLS**: Row-Level Security, a camada de segurança do PostgreSQL.
- **Tenant**: Um cliente isolado na plataforma (ex: uma clínica ou empresa de home care).
- **Soft Delete**: Exclusão lógica de um registro.
- **Command Bar**: A barra de ações principal da UI.
- **Record Header**: O cabeçalho de uma página de detalhes.
