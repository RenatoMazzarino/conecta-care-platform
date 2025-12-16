# Relatório de Auditoria da Documentação — Conecta Care

- **Data da Auditoria:** 2025-12-15
- **Auditor:** Assistente de Manutenção Gemini
- **Objetivo:** Mapear o estado atual da pasta `docs/`, identificar conflitos, duplicidades e lacunas para guiar a reorganização.

---

## 1. Árvore de Arquivos Analisados

A auditoria cobriu os seguintes 20 arquivos relevantes dentro da pasta `docs/`:

```
docs/
├── code-review.md
├── README.md
├── architecture/
│   ├── AI_TOOLING.md
│   ├── ARCHITECTURE_REAL.md
│   ├── CODEX_GUIDE.md
│   ├── CODEX_QUESTIONS.md
│   ├── OPEN_TODO.md
│   └── REPO_MAP.md
├── contracts/
│   ├── _templates/
│   │   └── CONTRACT_TEMPLATE.md
│   └── pacientes/
│       ├── ABA01_DADOS_PESSOAIS.md
│       └── README.md
├── repo_antigo/
│   └── schema_current.sql
├── reviews/
│   └── PR_FEAT_PACIENTES_ABA01.md
└── runbooks/
    ├── auth-tenancy.md
    ├── branch-protection.md
    ├── env.md
    ├── local-dev-supabase.md
    ├── migrations-workflow.md
    ├── pacientes-aba01-troubleshooting.md
    └── review-workflow.md
```

---

## 2. Auditoria Detalhada por Arquivo

| Caminho | Objetivo | Fonte da Verdade? | Status | Conflitos/Duplicidades |
| :--- | :--- | :--- | :--- | :--- |
| `docs/README.md` | Descreve a estrutura da pasta `docs` e o fluxo de trabalho oficial "Contrato → DB". | **SIM** | ATUAL | N/A |
| `docs/code-review.md` | Registra observações de um code review específico que já foram resolvidas. | NÃO | OBSOLETO | O conteúdo é histórico; `pacientes-aba01-troubleshooting.md` cobre tópicos similares. |
| `docs/process/ai/AI_TOOLING.md` | Define os papéis das diferentes IAs usadas no projeto. | **SIM** (para o processo) | ATUAL | `CODEX_GUIDE.md` |
| `docs/architecture/ARCHITECTURE_REAL.md` | Descreve a arquitetura real e implementada da aplicação. | **SIM** (para o que existe) | ATUAL | `REPO_MAP.md`, `CODEX_GUIDE.md` |
| `docs/process/ai/CODEX_GUIDE.md` | Guia de instruções para a IA, detalhando a visão completa do produto e padrões. | DEPENDE | PARCIAL | `ARCHITECTURE_REAL.md`, `AI_TOOLING.md`. Duplica a descrição da arquitetura e o processo. |
| `docs/process/ai/CODEX_QUESTIONS.md` | Lista de perguntas de negócio/arquitetura para guiar o desenvolvimento. | NÃO | OBSOLETO | Várias perguntas são respondidas em `ABA01_DADOS_PESSOAIS.md`. |
| `docs/architecture/OPEN_TODO.md` | Lista de pendências técnicas prioritizadas do projeto. | **SIM** | ATUAL | N/A |
| `docs/architecture/REPO_MAP.md` | Mapeia responsabilidades por pasta e o que existe vs. placeholders. | **SIM** (para o estado atual) | ATUAL | `ARCHITECTURE_REAL.md` (descrevem o mesmo estado de formas diferentes). |
| `docs/contracts/_templates/CONTRACT_TEMPLATE.md` | Template para criação de novos contratos de aba. | **SIM** (para o processo) | ATUAL | N/A |
| `docs/contracts/pacientes/README.md` | Índice dos contratos do módulo Pacientes, ligando-os às migrations. | **SIM** | ATUAL | N/A |
| `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md` | **Contrato canônico** para a funcionalidade da Aba 01 de Dados Pessoais. | **SIM** (mestre) | ATUAL | N/A |
| `docs/repo_antigo/schema_current.sql` | Snapshot do schema do banco de dados legado para referência histórica. | NÃO (histórico) | OBSOLETO | `docs/README.md` clarifica seu propósito, mas há risco de ser usado como referência atual. |
| `docs/reviews/PR_FEAT_PACIENTES_ABA01.md` | Exemplo de um registro de revisão de PR. | NÃO (histórico) | ATUAL (como exemplo) | `review-workflow.md` define o processo que este arquivo exemplifica. |
| `docs/runbooks/auth-tenancy.md` | Guia para configurar e testar o multi-tenancy com Supabase localmente. | **SIM** (para o processo) | ATUAL | N/A |
| `docs/runbooks/branch-protection.md` | Guia para configurar proteções de branch no GitHub. | **SIM** (para o processo) | ATUAL | N/A |
| `docs/runbooks/env.md` | Explica a finalidade das variáveis de ambiente do projeto. | **SIM** (para o processo) | ATUAL | N/A |
| `docs/runbooks/local-dev-supabase.md` | Comandos básicos para gerenciar o ambiente Supabase local. | **SIM** (para o processo) | ATUAL | N/A |
| `docs/runbooks/migrations-workflow.md` | Descreve o fluxo obrigatório para criar e aplicar migrations no Supabase. | **SIM** (para o processo) | ATUAL | `docs/README.md` |
| `docs/runbooks/pacientes-aba01-troubleshooting.md`| Base de conhecimento com erros encontrados e suas soluções. | **SIM** (para o histórico) | ATUAL | N/A |
| `docs/runbooks/review-workflow.md` | Define a estratégia de branches, commits e fluxo de Pull Request. | **SIM** (para o processo) | ATUAL | `PR_FEAT_PACIENTES_ABA01.md` |

---

## 3. Análise Consolidada

### Duplicidades de Conteúdo

- **Descrição da Arquitetura**: O estado atual da arquitetura é descrito em três lugares diferentes, com focos ligeiramente distintos:
  - `docs/architecture/ARCHITECTURE_REAL.md` (visão técnica)
  - `docs/architecture/REPO_MAP.md` (visão por pastas)
  - `docs/process/ai/CODEX_GUIDE.md` (visão para a IA)
  *Embora não sejam 100% idênticos, um desenvolvedor precisa ler os três para ter a visão completa, o que indica uma oportunidade de consolidação.*

- **Processo de Desenvolvimento**: O fluxo de trabalho é mencionado em múltiplos locais.
  - `docs/README.md`
  - `docs/runbooks/migrations-workflow.md`
  - `docs/process/ai/CODEX_GUIDE.md`
  *O conteúdo é consistente, mas poderia ser centralizado em um guia principal e referenciado nos demais.*

### Contradições

- **Perguntas vs. Respostas**: O arquivo `docs/process/ai/CODEX_QUESTIONS.md` lista perguntas que já foram detalhadamente respondidas no contrato `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`.
  - **Trecho conflitante**: `CODEX_QUESTIONS.md` pergunta: *"Qual o schema real de Paciente no Supabase?"*. O contrato da Aba 01 define este schema em mais de 100 linhas de tabela. Isso torna o arquivo de perguntas obsoleto e potencialmente enganoso.

- **Visão Estratégica vs. Realidade Implementada**: Há uma grande diferença entre a visão do produto e o estado atual.
  - **Visão**: `CODEX_GUIDE.md` posiciona o módulo de **Escalas como o "core operacional"**.
  - **Realidade**: `REPO_MAP.md` afirma sobre Escalas: **"Nenhuma rota/componente/serviço implementado"**.
  *Isso não é um erro, mas uma lacuna estratégica que precisa ser bem comunicada para evitar que desenvolvedores façam suposições erradas sobre a base de código existente.*

### Gaps (Lacunas)

- **Testes Automatizados**: A ausência de uma estratégia ou implementação de testes automatizados é a lacuna técnica mais crítica, confirmada em `ARCHITECTURE_REAL.md` e `OPEN_TODO.md`.

- **Contratos para Módulos Futuros**: O processo de desenvolvimento orientado a contratos não foi aplicado aos módulos futuros (Escalas, Financeiro, etc.), que existem apenas como conceitos na documentação de visão (`CODEX_GUIDE.md`).

- **Guia de Onboarding Consolidado**: Falta um documento único que sirva como ponto de partida para um novo desenvolvedor, guiando-o desde a configuração do ambiente até a primeira contribuição, conectando os vários runbooks existentes.
