# Onboarding - Guia de Início Rápido

Bem-vindo ao projeto **Conecta Care Platform**. Este guia serve como ponto de partida para desenvolvedores e assistentes de IA, consolidando os passos essenciais para configurar o ambiente e entender a cultura do projeto.

## 1. Filosofia do Repositório

Antes de escrever qualquer código, entenda os pilares que sustentam a plataforma:

-   **Contract-Driven Development**: Nenhuma funcionalidade é implementada sem um contrato formal aprovado em `docs/contracts`. O fluxo é estrito: `Contrato -> Migration -> Types -> Actions -> UI`.
-   **Segurança e Multi-tenancy**: O sistema é multi-tenant por design. Todo dado sensível deve ter um `tenant_id` e ser protegido por Row-Level Security (RLS). O acesso é negado por padrão.
-   **Soft Deletes**: Nunca usamos `DELETE` físico para dados de negócio. Utilizamos exclusão lógica via coluna `deleted_at`.
-   **Governança**: A documentação não é opcional. Ela é a fonte da verdade e deve ser atualizada no mesmo PR que altera o código.

## 2. Pré-requisitos e Setup Local

Para rodar o projeto, você precisará do Node.js (>= 20.9.0) e Docker (para o Supabase local).

1.  **Configuração de Variáveis de Ambiente**:
    -   Siga o guia em **[docs/runbooks/env.md](./env.md)** para criar seu arquivo `.env.local`.

2.  **Setup do Supabase e Banco de Dados**:
    -   Siga o guia em **[docs/runbooks/local-dev-supabase.md](./local-dev-supabase.md)** para iniciar o Supabase, aplicar as migrações e configurar um usuário de teste.
    -   **Importante**: Entenda como o `tenant_id` funciona lendo **[docs/runbooks/auth-tenancy.md](./auth-tenancy.md)**.

## 3. Rodando a Aplicação

Com o ambiente configurado:

1.  **Instale as dependências**:
    ```bash
    npm install
    ```

2.  **Verifique o projeto**:
    Antes de rodar, garanta que tudo está saudável (lint, types, build):
    ```bash
    npm run verify
    ```
    Ou use o script utilitário: `bash scripts/verify.sh`

3.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```
    Acesse `http://localhost:3000`.

## 4. Trabalhando com Migrations

Alterações no banco de dados seguem um fluxo rigoroso. Nunca altere o banco manualmente sem uma migration versionada.

-   Consulte o fluxo completo em **[docs/runbooks/migrations-workflow.md](./migrations-workflow.md)**.
-   Lembre-se: Primeiro o contrato, depois a migration.

## 5. Contribuição e Code Review

Para submeter suas alterações:

1.  **Abra um Pull Request**: Siga as diretrizes de proteção de branch em **[docs/runbooks/branch-protection.md](./branch-protection.md)**.
2.  **Processo de Review**: Entenda o que será avaliado no seu código lendo **[docs/runbooks/review-workflow.md](./review-workflow.md)**.

## 6. O que NÃO Fazer (Anti-patterns)

-   ❌ **Pular a etapa do contrato**: Não comece a codar a UI ou o banco sem um contrato aprovado.
-   ❌ **Ignorar o `tenant_id`**: Nunca escreva queries ou mutations que não filtrem ou atribuam o `tenant_id` correto.
-   ❌ **Deletar dados fisicamente**: Use sempre `deleted_at` para entidades de negócio.
-   ❌ **Usar mocks fora do escopo**: Se a funcionalidade já tem backend (como a Aba 01 de Pacientes), use os dados reais do Supabase. Mocks são apenas para prototipagem inicial ou testes.
-   ❌ **Deixar a documentação para depois**: Documentação desatualizada é considerada um bug e bloqueará seu PR.

## 7. Runbooks específicos (referência)

-   Auditoria — endpoint unificado (esqueleto): [docs/runbooks/auditoria-endpoint.md](./auditoria-endpoint.md)
-   Storage de fotos (ABA01) — políticas/RLS e fluxo de upload (esqueleto): [docs/runbooks/storage-photos-aba01.md](./storage-photos-aba01.md)
