# AI Repo Audit — Conecta Care Platform

Data: 2025-12-19T23:50:32-03:00
Repo: conecta-care-platform
Branch: chore/analise-governanca-estrutura-2025-12-19
Commit: 2782cead5b164fe3ae7b481e82ccdf0b8d5a20f4

## Passo 0 — Baseline (registrado no topo)

```
git status -sb
## chore/analise-governanca-estrutura-2025-12-19...origin/chore/analise-governanca-estrutura-2025-12-19
git rev-parse --abbrev-ref HEAD
chore/analise-governanca-estrutura-2025-12-19
git rev-parse HEAD
2782cead5b164fe3ae7b481e82ccdf0b8d5a20f4
node -v ; npm -v
/bin/bash: line 1: node: command not found
11.6.2
```

Escopo: varredura de arquivos tracked e untracked; exclusoes aplicadas para `node_modules/`, `.next/`, `dist/`, `build/`, `.turbo/`, `.vercel/`, `coverage/`, dumps grandes (`db/snapshots/`), alem de exclusoes tecnicas de ruído para `.git/`, `.tmp/` e `.idea/`.

## Comandos executados

```bash
git status -sb
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
node -v ; npm -v
date -Iseconds
mkdir -p .tmp
git ls-files > .tmp/git_ls_files.txt
ls -d .github .vscode docs scripts supabase src 2>/dev/null
find . -type d \( -path './node_modules' -o -path './.next' -o -path './dist' -o -path './build' -o -path './.turbo' -o -path './.vercel' -o -path './coverage' \) -prune -o -type d \( -iname 'ai' -o -iname 'ia' -o -iname 'agent' -o -iname 'agents' -o -iname 'prompt' -o -iname 'prompts' -o -iname 'rules' -o -iname 'mcp' -o -iname 'rag' -o -iname 'llm' -o -iname 'assistant' \) -print
rg --files --hidden --no-ignore -g '!.git/**' -g '!.tmp/**' -g '!node_modules/**' -g '!.next/**' -g '!dist/**' -g '!build/**' -g '!.turbo/**' -g '!.vercel/**' -g '!coverage/**' -g '!.idea/**' -g '!db/snapshots/**' | rg -i 'ai|ia|agent|agents|prompt|prompts|copilot|cursor|cline|windsurf|mcp|rag|llm|embedding|vector|gemini|openai|anthropic|claude|vertex' > .tmp/ai_name_matches_files.txt
find . -type d \( -path './.git' -o -path './.tmp' -o -path './node_modules' -o -path './.next' -o -path './dist' -o -path './build' -o -path './.turbo' -o -path './.vercel' -o -path './coverage' -o -path './.idea' -o -path './db/snapshots' \) -prune -o -type d \( -iname '*ai*' -o -iname '*ia*' -o -iname '*agent*' -o -iname '*prompt*' -o -iname '*copilot*' -o -iname '*cursor*' -o -iname '*cline*' -o -iname '*windsurf*' -o -iname '*mcp*' -o -iname '*rag*' -o -iname '*llm*' -o -iname '*embedding*' -o -iname '*vector*' -o -iname '*gemini*' -o -iname '*openai*' -o -iname '*anthropic*' -o -iname '*claude*' -o -iname '*vertex*' \) -print > .tmp/ai_name_matches_dirs.txt
rg -n --no-heading --hidden --no-ignore -g '!.git/**' -g '!.tmp/**' -g '!node_modules/**' -g '!.next/**' -g '!dist/**' -g '!build/**' -g '!.turbo/**' -g '!.vercel/**' -g '!coverage/**' -g '!.idea/**' -g '!db/snapshots/**' -g '!**/*.tsbuildinfo' -i -e 'gemini|openai|anthropic|claude|copilot|cursor|windsurf|cline|llm|rag|embedding|vector|mcp|prompt|agent|assistant|generative|vertex' | perl -pe 's/(sk-)[A-Za-z0-9]{4,}/$1***/g; s/(AIza)[0-9A-Za-z_-]{4,}/$1***/g; s/((?:x-api-key|api_key|api-key|apikey|openai_api_key|google_api_key|anthropic_api_key|gemini_api_key|vertex_api_key|llm_api_key|embedding_api_key)\s*[:=]\s*)(["\x27]?)[^"\x27\s]+/${1}${2}***REDACTED***/ig;' > .tmp/rg_ai_terms.txt
rg -n --no-heading --hidden --no-ignore -g '!.git/**' -g '!.tmp/**' -g '!node_modules/**' -g '!.next/**' -g '!dist/**' -g '!build/**' -g '!.turbo/**' -g '!.vercel/**' -g '!coverage/**' -g '!.idea/**' -g '!db/snapshots/**' -g '!**/*.tsbuildinfo' -e 'AIza|sk-|x-api-key|OPENAI_API_KEY|GOOGLE_API_KEY|ANTHROPIC_API_KEY|GEMINI|VERTEX|MODEL|LLM|EMBEDDING' | perl -pe 's/(sk-)[A-Za-z0-9]{4,}/$1***/g; s/(AIza)[0-9A-Za-z_-]{4,}/$1***/g; s/((?:x-api-key|api_key|api-key|apikey|openai_api_key|google_api_key|anthropic_api_key|gemini_api_key|vertex_api_key|llm_api_key|embedding_api_key)\s*[:=]\s*)(["\x27]?)[^"\x27\s]+/${1}${2}***REDACTED***/ig;' > .tmp/rg_ai_secrets.txt
rg -n --no-heading --hidden --no-ignore -g '!.git/**' -g '!.tmp/**' -g '!node_modules/**' -g '!.next/**' -g '!dist/**' -g '!build/**' -g '!.turbo/**' -g '!.vercel/**' -g '!coverage/**' -g '!.idea/**' -g '!db/snapshots/**' -g '!**/*.tsbuildinfo' -i -e 'fetch\(|axios|openai sdk|anthropic sdk|google generative|vertex ai|embeddings|vector store|supabase vector|pgvector' | perl -pe 's/(sk-)[A-Za-z0-9]{4,}/$1***/g; s/(AIza)[0-9A-Za-z_-]{4,}/$1***/g; s/((?:x-api-key|api_key|api-key|apikey|openai_api_key|google_api_key|anthropic_api_key|gemini_api_key|vertex_api_key|llm_api_key|embedding_api_key)\s*[:=]\s*)(["\x27]?)[^"\x27\s]+/${1}${2}***REDACTED***/ig;' > .tmp/rg_ai_runtime.txt
rg --files .github
cat .github/workflows/ci.yml
rg --files .vscode
cat .vscode/settings.json
cat .vscode/extensions.json
find . -maxdepth 2 -type d \( -path './node_modules' -o -path './.next' -o -path './dist' -o -path './build' -o -path './.turbo' -o -path './.vercel' -o -path './coverage' -o -path './.git' \) -prune -o -type d \( -iname '.cursor' -o -iname '.cline' -o -iname '.windsurf' \) -print
cat .github/copilot-instructions.md
rg --files .gemini
cat .gemini/settings.json
cat package.json
rg -n -i 'openai|anthropic|langchain|llama|llamaindex|embedding|vector|gemini|vertex|mcp' package-lock.json
rg -n -i 'openai|anthropic|gemini|vertex|llm|embedding|model' .env*
rg -n -i 'openai|gemini|anthropic|vertex|llm|embedding|model' supabase/config.toml
rg -n -i 'ai|codex|agent|assistant|prompt|review|copilot|cursor|cline|windsurf|gemini|openai|anthropic|vertex|llm|rag|embedding|vector|mcp' scripts
rg -n -i 'codex|gemini|chatgpt|copilot|vercel agent|openai|anthropic|claude|vertex|rag|llm|mcp|prompt|assistant|embedding|vector' docs/reviews | perl -pe 's/(sk-)[A-Za-z0-9]{4,}/$1***/g; s/(AIza)[0-9A-Za-z_-]{4,}/$1***/g; s/((?:x-api-key|api_key|api-key|apikey|openai_api_key|google_api_key|anthropic_api_key|gemini_api_key|vertex_api_key|llm_api_key|embedding_api_key)\s*[:=]\s*)(["\x27]?)[^"\x27\s]+/${1}${2}***REDACTED***/ig;' > .tmp/rg_ai_docs_reviews.txt
rg -n --no-heading --hidden --no-ignore -g '!.git/**' -g '!.tmp/**' -g '!node_modules/**' -g '!.next/**' -g '!dist/**' -g '!build/**' -g '!.turbo/**' -g '!.vercel/**' -g '!coverage/**' -g '!.idea/**' -g '!db/snapshots/**' -g '!**/*.tsbuildinfo' -g '!package-lock.json' -i -e 'codex|gemini|chatgpt|copilot|vercel agent|openai|anthropic|claude|vertex|rag|llm|mcp|prompt|assistant|embedding|vector' | perl -pe 's/(sk-)[A-Za-z0-9]{4,}/$1***/g; s/(AIza)[0-9A-Za-z_-]{4,}/$1***/g; s/((?:x-api-key|api_key|api-key|apikey|openai_api_key|google_api_key|anthropic_api_key|gemini_api_key|vertex_api_key|llm_api_key|embedding_api_key)\s*[:=]\s*)(["\x27]?)[^"\x27\s]+/${1}${2}***REDACTED***/ig;' > .tmp/rg_ai_keywords.txt
rg -n -i 'ia|gemini|assistente' docs/process/ai/README.md
rg -n -i 'gemini|ia|assistente|executor|codex' docs/process/ai/gemini.md
rg -n -i 'codex|ia|ai|assistente|prompt|agent|chatgpt|vercel' docs/process/ai/CODEX_GUIDE.md
rg -n -i 'ai|codex|chatgpt|agent|vercel|prompt|review' docs/process/ai/AI_TOOLING.md
rg -n -i 'ia|assistente|codex|ai' docs/process/ai/CODEX_QUESTIONS.md
nl -ba .github/copilot-instructions.md
nl -ba .gemini/settings.json
nl -ba supabase/config.toml | sed -n '80,160p' | perl -pe 's/(sk-)[A-Za-z0-9]{4,}/$1***/g; s/(AIza)[0-9A-Za-z_-]{4,}/$1***/g; s/(openai_api_key\s*=\s*)(["\x27]?)[^"\x27\s]+/${1}${2}***REDACTED***/ig;'
nl -ba docs/runbooks/review-workflow.md | sed -n '1,120p'
nl -ba README.md | sed -n '20,80p'
nl -ba CONTRIBUTING.md | sed -n '20,80p'
nl -ba ANALISE_DO_PROJETO.md | sed -n '1,120p'
nl -ba docs/contracts/pacientes/INDEX.md | sed -n '1,80p'
nl -ba docs/architecture/decisions/ADR-004-ui-dynamics-standard.md | sed -n '1,120p'
nl -ba docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_RESTRUCTURE_SUMMARY.md | sed -n '1,120p'
nl -ba docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_AUDIT_REPORT.md | sed -n '60,120p'
nl -ba docs/reviews/analise-governanca-estrutura-2025-12-19/PLANO_GOVERNANCA_REPO_P0-P3.md | sed -n '110,200p'
nl -ba docs/reviews/analise-governanca-estrutura-2025-12-19/GOVERNANCE_P0_P2_FINAL_AUDIT.md | sed -n '1,120p'
nl -ba docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_LINK_CHECK.md | sed -n '36,60p'
```

## 1) Resumo executivo

IDE/Assistentes (governança):
- `.github/copilot-instructions.md` define regras para Copilot; status: configurado, com referencia a caminho inexistente.
- `.gemini/settings.json` habilita recursos de preview do Gemini local; status: configurado.
- `docs/process/ai/*` consolida governanca de IA (Gemini, Codex, AI Tooling, perguntas); status: em uso.
- `README.md` e `CONTRIBUTING.md` citam fluxo de uso do Codex/IA; status: em uso.

CI/CD (automacao):
- `docs/runbooks/review-workflow.md` descreve revisores automaticos (Codex Web / Vercel Agent); status: documentado.
- `.github/workflows/ci.yml` nao possui passos de IA; status: sem IA no pipeline.

Runtime (aplicacao):
- Nenhum SDK ou biblioteca de IA em `package.json`/`package-lock.json`; status: inexistente.
- Nenhuma chamada de runtime para IA identificada em `src/`; status: inexistente.
- `supabase/config.toml` inclui `openai_api_key` para Supabase Studio AI e bloco de vector embeddings desativado; status: configurado (infra/local).

Outros achados:
- Documentos de governanca/reviews citam IA e guias de IA; status: em uso com risco de duplicidade.
- Referencia orfa a `docs/architecture/CODEX_GUIDE.md` (nao existe); status: suspeito/orfao.
- Nenhum diretorio dedicado a prompts/agentes/MCP/RAG/LLM encontrado; status: nao encontrado.

## 2) Inventario completo por categoria

### A) Docs e governanca

| Path | Tipo | Finalidade | Como e acionado | Dependencias (env vars/pacotes) | Evidencia | Observacoes |
| --- | --- | --- | --- | --- | --- | --- |
| `docs/process/ai/README.md` | Doc (processo IA) | Explicar escopo da pasta de IA e separar de arquitetura. | Leitura manual; citado em reviews. | — | `docs/process/ai/README.md:1` | Status: em uso. |
| `docs/process/ai/gemini.md` | Doc (manual Gemini) | Manual mestre do assistente Gemini executor. | Leitura manual; linkado no README da pasta. | — | `docs/process/ai/gemini.md:1` | Status: em uso. |
| `docs/process/ai/CODEX_GUIDE.md` | Doc (guia Codex/IA) | Fonte de verdade para IA e automacoes do repo. | Leitura manual; referenciado por outros docs. | — | `docs/process/ai/CODEX_GUIDE.md:1` | Status: em uso. |
| `docs/process/ai/CODEX_QUESTIONS.md` | Doc (perguntas IA) | Perguntas criticas para time e assistentes de IA. | Leitura manual; referenciado no CONTRIBUTING. | — | `docs/process/ai/CODEX_QUESTIONS.md:3` | Status: em uso. |
| `docs/process/ai/AI_TOOLING.md` | Doc (ferramentas IA) | Define papeis de Codex, ChatGPT, Codex Web e Vercel Agent. | Leitura manual; citado em reviews. | — | `docs/process/ai/AI_TOOLING.md:1` | Status: em uso. |
| `ANALISE_DO_PROJETO.md` | Doc (timeline IA) | Registro historico de acoes guiadas por IA. | Leitura manual. | — | `ANALISE_DO_PROJETO.md:3` | Status: historico/ativo. |
| `CONTRIBUTING.md` | Doc (contribuicao) | Direciona duvidas para `CODEX_QUESTIONS`. | Leitura manual. | — | `CONTRIBUTING.md:27` | Status: em uso. |
| `README.md` | Doc (setup) | Secoes de uso do Codex (scripts de configuracao/manutencao). | Leitura manual. | Scripts locais (`scripts/setup.sh`, `scripts/maintenance.sh`). | `README.md:28` | Status: em uso. |
| `docs/contracts/pacientes/INDEX.md` | Doc (indice contratos) | Referencia padrao visual em `CODEX_GUIDE`. | Leitura manual. | — | `docs/contracts/pacientes/INDEX.md:22` | Status: em uso. |
| `docs/architecture/decisions/ADR-004-ui-dynamics-standard.md` | ADR | Referencia `CODEX_GUIDE` para padroes de UI. | Leitura manual. | — | `docs/architecture/decisions/ADR-004-ui-dynamics-standard.md:30` | Status: em uso. |
| `docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_RESTRUCTURE_SUMMARY.md` | Review | Consolida pasta `docs/process/ai`. | Leitura manual. | — | `docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_RESTRUCTURE_SUMMARY.md:17` | Status: snapshot. |
| `docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_AUDIT_REPORT.md` | Review | Inventario inclui docs de IA. | Leitura manual. | — | `docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_AUDIT_REPORT.md:73` | Status: snapshot. |
| `docs/reviews/analise-governanca-estrutura-2025-12-19/PLANO_GOVERNANCA_REPO_P0-P3.md` | Plano | Menciona `CODEX_GUIDE` na consolidacao. | Leitura manual. | — | `docs/reviews/analise-governanca-estrutura-2025-12-19/PLANO_GOVERNANCA_REPO_P0-P3.md:126` | Status: snapshot. |
| `docs/reviews/analise-governanca-estrutura-2025-12-19/GOVERNANCE_P0_P2_FINAL_AUDIT.md` | Auditoria | Inclui `CODEX_GUIDE` como referencia. | Leitura manual. | — | `docs/reviews/analise-governanca-estrutura-2025-12-19/GOVERNANCE_P0_P2_FINAL_AUDIT.md:44` | Status: snapshot. |
| `docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_LINK_CHECK.md` | Review artifact | Relatorio de link-check com referencias a docs de IA. | Gerado por script. | Script `scripts/docs-link-check.mjs`. | `docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_LINK_CHECK.md:41` | Status: snapshot. |

### B) Agentes e regras de IDE

| Path | Tipo | Finalidade | Como e acionado | Dependencias (env vars/pacotes) | Evidencia | Observacoes |
| --- | --- | --- | --- | --- | --- | --- |
| `.github/copilot-instructions.md` | IDE/assistente (Copilot) | Instrucoes para assistente no GitHub. | Lido automaticamente pelo Copilot. | — | `.github/copilot-instructions.md:1` | Status: configurado; referencia orfa (ver Categoria I). |
| `.gemini/settings.json` | IDE/assistente (Gemini) | Habilitar preview features no Gemini local. | Lido pela ferramenta Gemini. | — | `.gemini/settings.json:2` | Status: configurado. |

### C) Prompts / libraries

Nenhum item encontrado.

### D) Ferramentas / MCP / bridges

Nenhum item encontrado.

### E) Runtime IA na aplicacao

Nenhum item encontrado.

### F) CI/CD e automacoes

| Path | Tipo | Finalidade | Como e acionado | Dependencias (env vars/pacotes) | Evidencia | Observacoes |
| --- | --- | --- | --- | --- | --- | --- |
| `docs/runbooks/review-workflow.md` | Runbook (review automatizado) | Documenta revisores automaticos (Codex Web / Vercel Agent). | Leitura manual. | Bots externos (Codex Web, Vercel Agent). | `docs/runbooks/review-workflow.md:31` | Status: documentado; nao ha configuracao de IA no CI local. |

### G) Dependencias

Nenhum item encontrado (sem bibliotecas de IA em `package.json` e `package-lock.json`).

### H) Config/Infra

| Path | Tipo | Finalidade | Como e acionado | Dependencias (env vars/pacotes) | Evidencia | Observacoes |
| --- | --- | --- | --- | --- | --- | --- |
| `supabase/config.toml` | Config/infra (Supabase) | Config do Supabase Studio AI e vector storage (embeddings). | Lido pelo Supabase local/studio. | `openai_api_key` (valor redigido), feature `storage.vector`. | `supabase/config.toml:88` | Status: configurado; vector desativado. |

### I) Legado/orfao

| Path | Tipo | Finalidade | Como e acionado | Dependencias (env vars/pacotes) | Evidencia | Observacoes |
| --- | --- | --- | --- | --- | --- | --- |
| `docs/architecture/CODEX_GUIDE.md` (inexistente) | Referencia orfa | Suposta fonte de verdade para Copilot. | Referenciada por `.github/copilot-instructions.md`. | — | `.github/copilot-instructions.md:1` | Status: orfao/suspeito (arquivo nao existe). |

### J) Links/URLs relacionados a IA

Nenhum link/URL de IA encontrado.

## 3) Mapa de referencias (cross-reference)

| Termo | Evidencias (arquivo:linha — trecho curto) |
| --- | --- |
| IA | `docs/process/ai/README.md:1` — "Processo de Trabalho com IA"; `docs/process/ai/CODEX_GUIDE.md:3` — "Fonte de verdade para IA"; `ANALISE_DO_PROJETO.md:3` — "guiadas pelo assistente de IA" |
| Gemini | `docs/process/ai/README.md:3` — "assistentes de IA (como o Gemini)"; `docs/process/ai/gemini.md:1` — "Manual Mestre do Gemini" |
| Codex | `docs/process/ai/CODEX_GUIDE.md:1` — "Codex Guide"; `docs/process/ai/AI_TOOLING.md:7` — "Codex (VS Code)"; `README.md:28` — "Codex (campo \"Script de configuracao\")" |
| ChatGPT | `docs/process/ai/AI_TOOLING.md:12` — "ChatGPT — Decisao e direcao tecnica" |
| Codex Web | `docs/process/ai/AI_TOOLING.md:17` — "Codex Web — Revisao de Pull Request"; `docs/runbooks/review-workflow.md:31` — "Codex Web / Vercel Agent" |
| Vercel Agent | `docs/process/ai/AI_TOOLING.md:22` — "Vercel Agent — Revisao automatica"; `docs/runbooks/review-workflow.md:31` — "Codex Web / Vercel Agent" |
| Copilot | `.github/copilot-instructions.md:1` — arquivo de instrucoes do Copilot (nome do arquivo) |
| OpenAI | `supabase/config.toml:88` — "OpenAI API Key ... Supabase AI"; `supabase/config.toml:142` — "documents-openai" |
| Embedding/Vector | `supabase/config.toml:134` — "vector embeddings"; `supabase/config.toml:136` — "storage.vector" |
| Prompt | `docs/process/ai/AI_TOOLING.md:14` — "gerar prompts para o Codex" |
| Assistente | `docs/process/ai/README.md:3` — "assistentes de IA"; `ANALISE_DO_PROJETO.md:3` — "assistente de IA" |
| MCP/RAG/LLM/Claude/Anthropic/Vertex | Nao encontrado no conteudo do repo. |

## 4) Riscos

- `supabase/config.toml` contem `openai_api_key` versionado (valor redigido); risco de segredo em repo ou configuracao desnecessaria.
- `.github/copilot-instructions.md` aponta para `docs/architecture/CODEX_GUIDE.md` inexistente; risco de orientacao quebrada.
- Governanca de IA distribuida em muitos documentos (README, CONTRIBUTING, docs/process/ai, docs/reviews); risco de drift/duplicidade.
- Revisores automaticos (Codex Web / Vercel Agent) documentados sem configuracao visivel no repo; risco de expectativa falsa.
- Config de vector embeddings no Supabase (desativada) pode gerar confusao sobre uso real de IA.

## 5) Recomendacoes (nao executar nesta etapa)

- Validar se `openai_api_key` e necessario; se nao, remover do `supabase/config.toml` e mover para variavel de ambiente segura quando aplicavel.
- Corrigir referencia em `.github/copilot-instructions.md` para o caminho real `docs/process/ai/CODEX_GUIDE.md`.
- Consolidar pontos de governanca de IA e reforcar canonicidade (evitar duplicidade entre docs).
- Documentar como habilitar Codex Web e Vercel Agent (ou remover mencoes caso nao usados).
- Confirmar se recursos de vector embeddings/Supabase AI fazem parte do roadmap e registrar decisao.
- Opcional: criar branch dedicada para auditorias de IA antes de novas mudancas:

```
git checkout main
git pull --ff-only
git checkout -b chore/ai-repo-audit
```

## Apêndice A — Inventario de estrutura e varreduras

Passo 1.1 (tracked): `git ls-files > .tmp/git_ls_files.txt`.

Passo 1.2 (diretorios sensiveis a IA): `.github/`, `.vscode/`, `docs/`, `scripts/`, `supabase/`, `src/`, `docs/process/ai/`, `.gemini/`.

Passo 2 (nomes de arquivos/pastas que batem com lista, case-insensitive):

```
./.gemini
./docs/process/ai

html/modelo_final_aparencia_pagina_do_paciente.htm
scripts/maintenance.sh
.github/copilot-instructions.md
docs/runbooks/storage-photos-aba01.md
docs/runbooks/auditoria-endpoint.md
supabase/.temp/storage-version
supabase/.temp/storage-migration
.gemini/settings.json
supabase/migrations/202512130704_pacientes_aba01_dados_pessoais_extend_legado.sql
supabase/migrations/202512130453_pacientes_aba01_dados_pessoais.sql
supabase/migrations/202512141854_pacientes_email_check_relax.sql
docs/process/ai/README.md
docs/process/ai/gemini.md
docs/process/ai/CODEX_QUESTIONS.md
docs/process/ai/CODEX_GUIDE.md
docs/process/ai/AI_TOOLING.md
docs/architecture/decisions/ADR-006-email-validation-db-policy.md
src/components/patient/DadosPessoaisTab.tsx
docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md
src/features/pacientes/schemas/aba01DadosPessoais.ts
src/features/pacientes/actions/updatePatientDadosPessoais.ts
src/features/pacientes/ui/onboarding/DadosPessoaisOnboardingForm.tsx
```

Observacao: a lista acima inclui falsos positivos por substring (ex.: "paciente", "email", "auditoria"). Itens realmente de IA estao detalhados no inventario por categoria.

Passo 3 (varredura de conteudo):
- Termos de IA: 99 linhas relevantes (salvas em `.tmp/rg_ai_terms.txt`).
- Sinais de segredo/config: 2 linhas relevantes (salvas em `.tmp/rg_ai_secrets.txt`).
- Sinais de runtime: 4 linhas relevantes (salvas em `.tmp/rg_ai_runtime.txt`).
