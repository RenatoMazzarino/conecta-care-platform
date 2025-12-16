# Relatório de Auditoria da Documentação

## 1. Mapeamento da Documentação

| Caminho | Objetivo | Fonte da Verdade? | Status | Conflitos/Duplicidades |
| :--- | :--- | :--- | :--- | :--- |
| `docs/README.md` | Ponto de entrada central para a documentação, explicando o fluxo "contract-driven". | **SIM** | ATUAL | Nenhum. |
| `docs/MODULE_STATUS.md` | Tabela de alto nível sobre o status de cada módulo da plataforma. | **SIM** | ATUAL | Nenhum. |
| `docs/code-review.md` | Registro de decisões e correções feitas durante revisões de código. | NÃO | PARCIAL | O conteúdo é pontual e pode se tornar obsoleto. Melhor seria integrar aos PRs ou ADRs. |
| `docs/architecture/SYSTEM_ARCHITECTURE.md` | Descreve os princípios, estado atual e visão de longo prazo da arquitetura. | **SIM** | ATUAL | `ARCHITECTURE_REAL.md` e `REPO_MAP.md` são subconjuntos deste. |
| `docs/architecture/ARCHITECTURE_REAL.md` | Detalha a implementação técnica *existente* no repositório. | DEPENDE | PARCIAL | **Duplicidade/Risco de Conflito:** Descreve o mesmo que `SYSTEM_ARCHITECTURE.md` e `REPO_MAP.md`, mas com um foco diferente. Pode ficar dessincronizado. |
| `docs/architecture/REPO_MAP.md` | Mapeia a estrutura de pastas e arquivos do projeto. | DEPENDE | PARCIAL | **Duplicidade/Risco de Conflito:** Redundante com `SYSTEM_ARCHITECTURE.md`. A estrutura do código é a fonte da verdade. |
| `docs/architecture/OPEN_TODO.md` | Backlog técnico e de débitos. | **SIM** | ATUAL | Nenhum. |
| `docs/contracts/pacientes/README.md` | Índice de contratos para o módulo de Pacientes. | **SIM** | ATUAL | Nenhum. |
| `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md` | Contrato canônico para a aba "Dados Pessoais" do paciente. | **SIM** | ATUAL | Nenhum. |
| `docs/contracts/_templates/CONTRACT_TEMPLATE.md` | Template para criação de novos contratos de abas. | **SIM** | ATUAL | Nenhum. |
| `docs/runbooks/auth-tenancy.md` | Guia para configurar autenticação e multi-tenancy no ambiente local. | **SIM** | ATUAL | Nenhum. |
| `docs/runbooks/migrations-workflow.md` | Descreve o fluxo de trabalho para criar e aplicar migrações de banco de dados. | **SIM** | ATUAL | Nenhum. |
| `docs/runbooks/*.md` (outros) | Guias operacionais para tarefas específicas (env, review, etc.). | **SIM** | ATUAL | Nenhum. |
| `docs/reviews/PR_FEAT_PACIENTES_ABA01.md` | Relatório de revisão de um PR específico. | NÃO | OBSOLETO | O conteúdo é um snapshot. A fonte da verdade é o próprio PR no Git. |
| `docs/reviews/DOCS_RESTRUCTURE_SUMMARY.md` | Resumo de uma reestruturação da documentação. | NÃO | OBSOLETO | O estado atual da pasta `docs/` é a fonte da verdade. |
| `docs/research/PROJECT_IMMERSION_REPORT.md` | Relatório gerado pela IA para demonstrar entendimento do projeto. | NÃO | ATUAL | É um documento de onboarding, não uma fonte da verdade do projeto. |
| `html/modelo_final_aparencia_pagina_do_paciente.htm` | Protótipo HTML estático que serve como referência visual para a UI. | **SIM** | ATUAL | Nenhum. |

## 2. Análise de Duplicidades, Contradições e Gaps

### Duplicidades e Conflitos

1.  **Arquitetura Descrita em Múltiplos Lugares**:
    *   **Conflito**: A arquitetura e o estado atual do projeto estão descritos em `docs/architecture/SYSTEM_ARCHITECTURE.md`, `docs/architecture/ARCHITECTURE_REAL.md`, e `docs/architecture/REPO_MAP.md`.
    *   **Risco**: Manter três documentos sincronizados é propenso a erros. `SYSTEM_ARCHITECTURE.md` parece ser o documento canônico, enquanto os outros dois são subconjuntos que podem (e provavelmente irão) ficar desatualizados.
    *   **Citação**: `SYSTEM_ARCHITECTURE.md` afirma: "Para um mapa detalhado de arquivos e pastas, consulte o REPO_MAP.md". Isso cria uma dependência desnecessária.

2.  **Registros de Revisão vs. Histórico do Git**:
    *   **Duplicidade**: Arquivos como `docs/reviews/PR_FEAT_PACIENTES_ABA01.md` e `docs/code-review.md` duplicam informações que já existem no histórico de commits e nos Pull Requests do GitHub.
    *   **Risco**: Esses arquivos se tornam obsoletos rapidamente e não são a fonte da verdade. O Git é a fonte da verdade para o histórico de código.

### Contradições

*   Nenhuma contradição direta foi encontrada nos documentos canônicos (contratos, runbooks principais). As regras de governança são consistentes. O principal risco vem da duplicidade de documentos de arquitetura, que podem vir a contradizer um ao outro no futuro.

### Gaps (Lacunas)

1.  **Falta de um ADR (Architectural Decision Record)**:
    *   **Gap**: O projeto possui um `OPEN_TODO.md` e um `SYSTEM_ARCHITECTURE.md`, mas não há um local formal para registrar *por que* certas decisões de arquitetura foram tomadas (ADRs). Documentos como `code-review.md` tentam preencher essa lacuna de forma informal.
    *   **Impacto**: Novas pessoas no time podem não entender o racional por trás de escolhas tecnológicas, levando a questionamentos ou refatorações desnecessárias.

2.  **Documentação de Componentes de UI**:
    *   **Gap**: Existe uma referência visual (`.htm`), mas não há uma documentação formal sobre os componentes React/Fluent UI, suas props e como devem ser reutilizados.
    *   **Impacto**: Desenvolvedores podem recriar componentes existentes ou usá-los de forma inconsistente.

3.  **Runbook de Onboarding para Novos Desenvolvedores**:
    *   **Gap**: Embora existam runbooks para tarefas específicas, falta um guia consolidado de "primeiros passos" que junte tudo: como clonar, instalar, rodar o Supabase local, criar um usuário de teste, e entender o fluxo de trabalho. O `PROJECT_IMMERSION_REPORT.md` serve como uma visão geral, mas não um guia prático.

## 3. Recomendações (Ações Sugeridas)

1.  **Centralizar a Documentação de Arquitetura**:
    *   **Ação**: Unificar `ARCHITECTURE_REAL.md` e `REPO_MAP.md` dentro de `SYSTEM_ARCHITECTURE.md`. Manter um único documento como fonte da verdade para a arquitetura.
    *   **Benefício**: Reduz a sobrecarga de manutenção e elimina o risco de contradições.

2.  **Adotar um Formato de ADR**:
    *   **Ação**: Criar uma nova pasta `docs/architecture/decisions` e começar a usar um template simples de ADR para registrar decisões importantes.
    *   **Benefício**: Cria um histórico claro e imutável do racional técnico do projeto.

3.  **Mover Registros de Revisão para o Git**:
    *   **Ação**: Descontinuar o uso de arquivos em `docs/reviews` para registrar o conteúdo de PRs. Manter essa informação nos próprios PRs do GitHub.
    *   **Benefício**: Utiliza a ferramenta certa para o trabalho e garante que a informação esteja sempre no contexto correto.

4.  **Criar um "Onboarding Runbook"**:
    *   **Ação**: Criar um novo arquivo `docs/runbooks/onboarding.md` que guie um novo desenvolvedor do `git clone` até ter o ambiente rodando.
    *   **Benefício**: Acelera a integração de novos membros no time.
