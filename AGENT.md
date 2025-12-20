# AGENT.md - fonte unica de verdade para IA (Conecta Care)

## Baseline

```
git status -sb
## chore/ai-agent-single-source-of-truth...origin/chore/ai-agent-single-source-of-truth
 M .github/copilot-instructions.md
 M AGENT.md
 M docs/process/ai/AI_TOOLING.md
 M docs/process/ai/CODEX_GUIDE.md
 M docs/process/ai/CODEX_QUESTIONS.md
 M docs/process/ai/README.md
 M docs/process/ai/gemini.md
RM .tmp/rg_ai_terms.txt -> docs/reviews/AI_TERM_SCAN_2025-12-20.txt
 M docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_LINK_CHECK.md
?? AGENTS.md
git rev-parse --abbrev-ref HEAD
chore/ai-agent-single-source-of-truth
git rev-parse HEAD
3dcc67b9079a60cdd4e4cba13199dab95dbc0d13
node -v
/bin/bash: line 1: node: command not found
npm -v
11.6.2
```

## 1) Proposito e escopo (IN/OUT)

IN
- Governanca de IA, processos e orientacoes operacionais.
- Links canonicos e stubs anti-drift.
- Auditoria e evidencias de validacao.

OUT
- Nao tocar Aba Endereco.
- Nao implementar runtime de IA (SDKs, chamadas OpenAI/Anthropic/etc).
- Nao alterar produto/UI fora de docs e links de governanca.

## 2) Hierarquia de fonte de verdade

AGENT.md > specs/contratos (docs/contracts) > migrations (supabase/migrations) > types > actions > UI

Regras
- Se houver conflito, AGENT.md vence.
- Contrato e a fonte de verdade para escopo funcional.

## 3) Papeis de agentes e responsabilidades

- Executor: implementa mudancas no repo, segue o fluxo e registra evidencias.
- Arquiteto: define decisoes e contratos; nao executa mudancas diretas no repo.
- Revisor: revisa PRs e aponta riscos/bugs; nao muda escopo.

## 4) Workflow padrao

branch -> baseline -> mudanca -> validacao -> PR

Checklist minimo
- git status -sb
- criar branch
- executar mudanca
- validar (npm run verify) ou registrar impedimento
- abrir PR (Draft cedo)

## 5) Non-negotiables

- Fluxo de governanca: Contrato -> Migrations -> Types -> Actions -> UI -> Docs/Runbooks/Review.
- Multi-tenant + RLS obrigatorio.
- Soft delete com deleted_at.
- UI Dynamics/Fluent classico (command bar + record header + tabs + grid).
- Executor nao decide produto sem aprovacao explicita.
- Sem segredos no repo (.env e chaves nunca versionados).

## 6) Stop conditions

Pare e peça decisao quando:
- Contrato/ADR ausente ou ambiguo.
- Instrucoes conflitantes entre docs ou entre doc e codigo.
- DTO diverge do schema do banco (nao inventar coluna).
- Pedido implica refatoracao grande ou mudanca de padrao sem aprovacao.
- Suspeita de segredo/versionamento indevido.

## 7) Seguranca e segredos

Regras
- Nunca registrar chaves reais; sempre redigir (ex: sk-***, AIza***).
- .env e variantes nunca devem ser commitados.

Como reportar
- Pausar a mudanca.
- Redigir qualquer evidencia no log/relatorio.
- Abrir issue/nota no PR com passos de rotacao.

## 8) Politica de stubs (anti-drift)

Template unico (max 20 linhas)
- 1 paragrafo: documento consolidado.
- Link para secao exata em AGENT.md.
- Linha: "Ultimo commit com conteudo completo: <hash>".

Regras
- Nao repetir regras completas fora de AGENT.md.
- Stubs devem apontar para o mesmo topo/ancora canonica.

## 9) Integracao com ferramentas (adapters)

- Copilot: usar AGENT.md como fonte canonica; .github/copilot-instructions.md e stub.
- Codex (VS Code): executor do repo; segue workflow e non-negotiables.
- Gemini local: se usado, seguir AGENT.md; sem decidir produto.
- Codex Web / Vercel Agent: revisao automatica de PRs (nao altera repo).

## 10) Estado atual de IA no produto

- Nao ha runtime de IA no app (sem SDKs/chamadas).
- openai_api_key em supabase/config.toml e para Supabase Studio AI (nao runtime).
- Vector storage esta desativado por padrao.

## 11) Apendice: Perguntas e decisoes

Perguntas abertas (origem: CODEX_QUESTIONS)

Escalas
1) Status oficiais de plantao e onde registrar aprovacoes?
2) Fluxo de troca de plantao (quem solicita/aprova, eventos obrigatorios)?
3) Check-in/out: qual API de biometria e payload minimo (geo/BLE)?
4) Regras de tolerancia/arredondamento que impactam faturamento?

Auditoria
1) Endpoint centralizado de auditoria e schema minimo?
2) Politica de retencao e anonimizacao LGPD para historico?
3) Endpoint unificado de Historico do Paciente (Escalas/GED/admin)?

Seguranca / Multi-tenant
1) Roles oficiais e permissoes em Pacientes e Escalas?

Dados / Schema
1) IDs legiveis (PAC-000123): persistir ou apenas exibir?
2) GED: onde armazenar/versionar/vincular documentos?
3) Clinico/Financeiro/Inventario: espelhar dados externos ou criar do zero?

Perguntas respondidas
- Tenant: vem do JWT do Supabase Auth; RLS garante isolamento.
- Schema Pacientes ABA01: docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md.
