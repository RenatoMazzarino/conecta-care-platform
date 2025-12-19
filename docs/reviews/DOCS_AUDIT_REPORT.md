# Relatório de Auditoria da Documentação – Conecta Care Platform

Data: 2025-12-16

Escopo: auditoria apenas de docs/ (sem alterar outros arquivos). Este relatório sobrescreve versões anteriores.

Observação: quando apontamos problemas, citamos o arquivo e o trecho correspondente, sem inventar fatos.

## 1) Árvore completa de docs/ (pastas e arquivos relevantes)

- docs/
  - architecture/
    - database/ (.gitkeep)
    - decisions/ (.gitkeep)
    - ARCHITECTURE_REAL.md
    - OPEN_TODO.md
    - REPO_MAP.md
    - SYSTEM_ARCHITECTURE.md
  - contracts/
    - pacientes/
      - ABA01_DADOS_PESSOAIS.md
      - README.md
    - _templates/
      - CONTRACT_TEMPLATE.md
  - process/
    - ai/
      - AI_TOOLING.md
      - CODEX_GUIDE.md
      - CODEX_QUESTIONS.md
      - gemini.md
      - README.md
  - repo_antigo/
    - snapshots/ (.gitkeep)
    - README.md
    - schema_current.sql
  - research/
    - PROJECT_IMMERSION_REPORT.md
  - reviews/
    - DOCS_AUDIT_REPORT.md (este relatório)
    - DOCS_LINK_CHECK.md
    - DOCS_RESTRUCTURE_SUMMARY.md
    - PR_FEAT_PACIENTES_ABA01.md
    - README.md
  - runbooks/
    - ONBOARDING.md
    - auth-tenancy.md
    - branch-protection.md
    - env.md
    - local-dev-supabase.md
    - migrations-workflow.md
    - pacientes-aba01-troubleshooting.md
    - review-workflow.md
  - MODULE_STATUS.md
  - README.md
  - code-review.md

Não há arquivos .htm dentro de docs/; o protótipo visual canônico (.htm) está fora de docs/ em html/.

## 2) Tabela por arquivo (docs/)

| Caminho | Objetivo (1 linha) | Fonte da verdade? | Status | Conflitos/Duplicidades |
| :-- | :-- | :--: | :--: | :-- |
| docs/README.md | Índice central e políticas de documentação/fluxo. | SIM | ATUAL | Reforça o fluxo contrato→migration→types→actions→UI (dup. com vários). |
| docs/MODULE_STATUS.md | Status dos módulos da plataforma. | SIM | ATUAL | — |
| docs/code-review.md | Snapshot de observações de um PR. | NÃO | PARCIAL | Conteúdo histórico (preferir PRs). |
| docs/architecture/SYSTEM_ARCHITECTURE.md | Arquitetura canônica (princípios/estado atual/visão). | SIM | ATUAL | Dup. com CODEX_GUIDE em visão 360/UI e com README (fluxo). |
| docs/architecture/ARCHITECTURE_REAL.md | Documento descontinuado (aponta para o canônico). | NÃO | OBSOLETO | Redireciona para SYSTEM_ARCHITECTURE.md. |
| docs/architecture/REPO_MAP.md | Documento descontinuado (mapa integrado ao canônico). | NÃO | OBSOLETO | Redireciona para SYSTEM_ARCHITECTURE.md. |
| docs/architecture/OPEN_TODO.md | Backlog técnico priorizado. | DEPENDE | ATUAL | — |
| docs/contracts/pacientes/README.md | Índice dos contratos do módulo Pacientes. | SIM | ATUAL | — |
| docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md | Contrato aprovado da Aba 01 (Dados Pessoais). | SIM | ATUAL | Diverge do legado por decisão explícita (ver citações). |
| docs/contracts/_templates/CONTRACT_TEMPLATE.md | Template padrão para novos contratos. | DEPENDE | ATUAL | — |
| docs/process/ai/README.md | Explica o escopo da pasta de processo de IA. | NÃO | ATUAL | Dup. leve com CODEX_GUIDE/gemini.md sobre governança. |
| docs/process/ai/AI_TOOLING.md | Papéis das IAs e fluxo canônico. | DEPENDE | ATUAL | Dup. do fluxo contrato→... |
| docs/process/ai/CODEX_GUIDE.md | Guia operacional (IA) com visão 360 e padrões. | DEPENDE | ATUAL | Dup. com SYSTEM_ARCHITECTURE (visão 360/UI). |
| docs/process/ai/CODEX_QUESTIONS.md | Perguntas críticas abertas/fechadas. | NÃO | ATUAL | Cita lacunas parcialmente respondidas. |
| docs/process/ai/gemini.md | Manual mestre do Gemini (executor). | DEPENDE | ATUAL | Dup. de princípios (tenancy/soft delete/UI). |
| docs/repo_antigo/README.md | Aviso: conteúdo histórico/legado. | NÃO | ATUAL | — |
| docs/repo_antigo/schema_current.sql | Snapshot de schema legado (referência histórica). | NÃO | OBSOLETO | Diverge do contrato em colunas/defaults (ver citações). |
| docs/research/PROJECT_IMMERSION_REPORT.md | Visão de imersão (contexto). | NÃO | ATUAL | Dup. de princípios (tenancy/fluxo/UI) em alto nível. |
| docs/reviews/README.md | Explica o propósito de reviews/auditorias. | NÃO | ATUAL | — |
| docs/reviews/DOCS_LINK_CHECK.md | Verificação manual de links (snapshot). | NÃO | PARCIAL | — |
| docs/reviews/DOCS_RESTRUCTURE_SUMMARY.md | Resumo de reestruturação (snapshot). | NÃO | PARCIAL | — |
| docs/reviews/PR_FEAT_PACIENTES_ABA01.md | Resumo de revisão de PR (snapshot). | NÃO | PARCIAL | — |
| docs/runbooks/ONBOARDING.md | Onboarding rápido do projeto. | SIM | ATUAL | Dup. leve com README e CODEX_GUIDE em princípios. |
| docs/runbooks/auth-tenancy.md | Tenancy/JWT e RLS (prod e dev). | SIM | ATUAL | Dup. com SYSTEM_ARCHITECTURE e contrato (RLS). |
| docs/runbooks/branch-protection.md | Proteção de branch no GitHub. | SIM | ATUAL | — |
| docs/runbooks/env.md | Política de env/secrets e arquivos exemplo. | SIM | ATUAL | Ver incidente com .env presentes no repo (citação). |
| docs/runbooks/local-dev-supabase.md | Como subir/resetar Supabase local e gerar types. | SIM | ATUAL | — |
| docs/runbooks/migrations-workflow.md | Fluxo contrato→migration→types→UI. | SIM | ATUAL | Dup. do fluxo já em outros docs. |
| docs/runbooks/pacientes-aba01-troubleshooting.md | Log real de problemas/soluções da Aba 01. | NÃO | ATUAL | — |
| docs/runbooks/review-workflow.md | Fluxo de branches/PR e checks mínimos. | SIM | ATUAL | — |

Legenda “Fonte da verdade?”: SIM (canônico para o tema), NÃO (snapshot/processo/contexto), DEPENDE (válido no seu escopo, não substitui contratos/arquitetura).

## 3) Duplicidades, contradições e gaps (com citações)

### 3.1 Duplicidades de conteúdo

- Fluxo de desenvolvimento “Contrato → Migrations → Types → Actions → UI” é repetido em vários lugares:
  - docs/README.md, linhas 9–15: “Contrato → Migrations → Types → Actions → UI” e “Documentação desatualizada é considerada um bug”.
  - docs/runbooks/migrations-workflow.md, linha 1 (título) e linhas 8–10: “Fluxo canônico (obrigatório) …”.
  - docs/process/ai/AI_TOOLING.md, linhas 23–30: “Contrato → Migration → Types → UI → Actions”.
  - docs/architecture/SYSTEM_ARCHITECTURE.md, linhas 9–13: princípios incluindo governança por contratos.
  - docs/research/PROJECT_IMMERSION_REPORT.md, linhas 20–35: repete o fluxo oficial em seções 18–35.

- Multi-tenant + RLS repetido (coerente, mas duplicado):
  - docs/architecture/SYSTEM_ARCHITECTURE.md, linha 10: “Segurança e Multi-tenancy por Design … RLS …”.
  - docs/runbooks/auth-tenancy.md, linhas 8–14: ordem de resolução do tenant e erro se ausente.
  - docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md, linhas 183–191: RLS/policies detalhadas por tenant.

- Padrão de UI “Dynamics” repetido:
  - docs/architecture/SYSTEM_ARCHITECTURE.md, linha 13: “UI … referência canônica … html/modelo_final_aparencia_pagina_do_paciente.htm”.
  - docs/process/ai/CODEX_GUIDE.md, linhas 28–31: “Referência visual canônica”.
  - docs/research/PROJECT_IMMERSION_REPORT.md, linhas 36–45: define elementos de UI padrão.

### 3.2 Contradições

- Política de segredos vs. estado do repositório (incidente):
  - Política: docs/runbooks/env.md, linhas 29–31: “Nunca commitar .env … .gitignore já cobre .env*e só permite*.example”.
  - Evidência no repo: existem arquivos versionados `.env.local` e `.env.local.local` na raiz do projeto (ex.: C:\Users\renat\OneDrive\…\conecta-care-platform\.env.local.local). O arquivo contém chaves reais (ex.: comentários nas linhas 5–6: “Chave de serviço (usada apenas no backend/scripts…)”). Isso contradiz a política documentada.

Observação: Não foram encontradas contradições entre os documentos canônicos (contratos/runbooks/arquitetura). O principal risco são documentos obsoletos/duplicados que futuramente podem divergir entre si.

### 3.3 Divergências com o legado (esperadas)

- Nome de coluna de validação documental (legado vs. contrato):
  - Legado (docs/repo_antigo/schema_current.sql, linha 1712): contém coluna "document_validation_method".
  - Contrato (docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md, linhas 122–126): remove “document_validation_method” e mantém “doc_validation_method”.

- Default de `cpf_status` (legado vs. contrato):
  - Legado (docs/repo_antigo/schema_current.sql, linha 1710): default `'valid'`.
  - Contrato (docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md, linha 56): default `'unknown'`.

Estas divergências são intencionais (governança do contrato), não contradições.

### 3.4 Gaps (lacunas)

- ADRs inexistentes (registro de decisões)
  - A pasta docs/architecture/decisions/ contém apenas `.gitkeep` (não há ADRs). Sinaliza ausência de histórico formal de decisões.

- Contratos faltantes para abas/módulos citados
  - docs/architecture/SYSTEM_ARCHITECTURE.md, linha 34: “As demais abas são placeholders”.
  - docs/process/ai/CODEX_GUIDE.md, linhas 23–24: lista outras abas (Endereço, Rede de apoio, etc.). Em docs/contracts/pacientes/ há apenas a ABA01.

- Policies de Storage para fotos (ABA01)
  - docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md, linhas 313–315: TODO explícito sobre bucket/policies para `photo_path`.

- Endpoint unificado de Auditoria (parcial)
  - docs/process/ai/CODEX_QUESTIONS.md, linhas 63–66: marcado como “RESPONDIDA (Parcialmente)” — não há especificação final.

## 4) Conclusão

A documentação de docs/ está, em geral, consistente com as decisões canônicas (contratos, runbooks e arquitetura). Há duplicidades propositais (reforço de princípios) e alguns documentos explicitamente descontinuados que devem permanecer como ponte/aviso. Os principais pontos de atenção são: (a) eliminar/evitar documentos paralelos que possam divergir do canônico; (b) formalizar ADRs; (c) endereçar lacunas conhecidas (policies de Storage; endpoint de auditoria); e (d) corrigir a contradição prática da presença de `.env*` versionados, em desacordo com a política.

— Fim do relatório —
