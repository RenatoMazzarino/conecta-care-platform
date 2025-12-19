# Documentação Conecta Care Platform

Esta documentação serve como a fonte central de verdade para o desenvolvimento, arquitetura e operação da plataforma Conecta Care.

## Visão Rápida

O objetivo da Conecta Care é fornecer uma plataforma SaaS robusta e intuitiva para gestão de pacientes, prontuários, agendamentos e operações de home care. A arquitetura é baseada em Next.js no frontend, Supabase para o backend e banco de dados (PostgreSQL), e segue um modelo de desenvolvimento "contract-driven".

### Fluxo canônico

Contrato → Migrations → Types → Actions → UI

Toda nova funcionalidade ou alteração significativa deve começar com um **Contrato** formalizado, que define o escopo e a "fonte da verdade". A partir dele, derivam-se as alterações no banco de dados, os tipos no código, as lógicas de negócio e, por fim, a interface do usuário.

**Política de Atualização:** Qualquer Pull Request que altere o comportamento de uma funcionalidade *deve* atualizar a documentação correspondente (contratos, runbooks, arquitetura) no mesmo PR. Documentação desatualizada é considerada um bug.

**Validação automática (CI):** PRs falham se houver links relativos quebrados em `docs/` (job “Docs Link Check”).

## Pontos de Entrada

- **[Arquitetura](./architecture/):** Descreve a arquitetura atual do sistema, decisões tomadas e o mapa do repositório.
- **[Decisões Arquiteturais (ADRs)](./architecture/decisions/):** Registro canônico das decisões de arquitetura (histórico e status de cada decisão).
- **[Contratos](./contracts/):** A fonte da verdade para cada módulo e funcionalidade. Nada é construído sem um contrato aprovado. Índices por módulo em [`docs/contracts/README.md`](./contracts/README.md).
- **[Runbooks](./runbooks/):** Guias operacionais para tarefas comuns, como setup do ambiente local, troubleshooting e workflows de migração.
- **[Processos](./process/):** Descreve nossos processos de trabalho, incluindo o uso de ferramentas de IA para otimizar o desenvolvimento.
- **[Reviews](./reviews/):** Armazena auditorias, relatórios de revisão de PRs e outros artefatos de garantia de qualidade.
- **[Status dos Módulos](./MODULE_STATUS.md):** Tabela com o status atual de cada módulo da plataforma.
