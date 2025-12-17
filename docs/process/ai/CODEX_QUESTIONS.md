# Perguntas de Arquitetura e Negócio

Este documento centraliza as perguntas críticas cujo desconhecimento pode levar a decisões erradas. Ele é um guia para o time e para assistentes de IA.

---

## Perguntas Abertas (ativas)

Estas perguntas permanecem sem decisão final. Cada item está marcado como [ABERTA] e, quando útil, contém links para contexto ou backlog relacionado.

### Escalas
1. [ABERTA] Quais são os status oficiais de um plantão (ex.: `Scheduled`, `Confirmed`, `InProgress`, `Completed`, `Missed`, `Cancelled`) e onde os registros de aprovação devem ser armazenados?
   - Contexto: visão geral em ../../architecture/SYSTEM_ARCHITECTURE.md (Seção 3) e padrões no guia de processo em ./CODEX_GUIDE.md; definição final pendente de contrato/ADR.
2. [ABERTA] Qual é o fluxo de troca de plantão: quem pode solicitar, quem aprova e quais eventos de auditoria são mandatórios?
   - Contexto: padrões de eventos em ./CODEX_GUIDE.md (Taxonomia de eventos); especificação final pendente.
3. [ABERTA] Check-in/out: qual API de biometria (ex.: SERPRO) e geolocalização/BLE será usada? Qual o payload mínimo a armazenar (geo, biometria, device, horário)?
   - Contexto: requisitos gerais em ./CODEX_GUIDE.md; implementação/schemas pendentes.
4. [ABERTA] Existem regras de tolerância/arredondamento para cálculo de horas (atraso/adiantamento) que impactam faturamento e pagamento dos profissionais?
   - Contexto: dependerá de decisão operacional/financeira; sem contrato.

### Auditoria
5. [ABERTA] Endpoint centralizado de auditoria e campos mínimos (actor, role, origem, geo/IP, payload): haverá serviço unificado? Quais tabelas/partições?
   - Contexto: princípio “Auditabilidade Completa” em ../../architecture/SYSTEM_ARCHITECTURE.md (Seção 1); itens de backlog relacionados em ../../architecture/OPEN_TODO.md (P0: “Auditoria granular (core)” e “Serviço Auditoria/Histórico”).
6. [ABERTA] As políticas de retenção e anonimização de dados (LGPD) afetam o histórico de auditoria? Qual período de retenção será adotado e como anonimizar sob pedido?
   - Contexto: requer política/ADR; não definido.
7. [ABERTA] Há endpoint unificado para “Histórico do Paciente” que consolide Escalas, GED e administrativos? Qual o contrato de payload/consulta?
   - Contexto: intenção indicada pela visão 360 (../../architecture/SYSTEM_ARCHITECTURE.md Seção 3) e pelo protótipo ../../../html/modelo_final_aparencia_pagina_do_paciente.htm; execução pendente (ver ../../architecture/OPEN_TODO.md P0 “Serviço Auditoria/Histórico”).

### Segurança / Multi-tenant
8. [ABERTA] Quais são os papéis (roles) oficiais do sistema (ex.: admin da empresa, familiar, profissional, supervisor) e quais ações cada um pode executar nos módulos de Pacientes e Escalas?
   - Contexto: isolamento por tenant está definido (../../runbooks/auth-tenancy.md), mas a matriz de autorização por papel está em aberto.

### Dados / Schema
9. [ABERTA] Convenções de IDs legíveis (ex.: `PAC-000123`, `ESC-000123`): como/onde são gerados? São somente exibição ou persistidos no banco (e com unicidade por tenant)?
10. [ABERTA] GED: onde os documentos serão armazenados (bucket Supabase, S3, etc.)? Como serão versionados e vinculados a entidades (paciente, escala, financeiro)?
11. [ABERTA] Clínico/Financeiro/Inventário: quais datasets de sistemas externos existentes devemos espelhar versus criar do zero? Há prioridades/escopo mínimo?

---

## Perguntas Respondidas (com links)

Estas perguntas foram cobertas por documentos canônicos (contratos, runbooks ou arquitetura). Marcação: [RESPONDIDA].

1. [RESPONDIDA] Como identificar o tenant e isolar a UI?
   - Resposta: o `tenant_id` vem do JWT do Supabase Auth; RLS no banco garante isolamento por tenant. Em produção, usar `app_metadata.tenant_id`; em dev há bypass opcional. Detalhes no runbook.
   - Fontes: ../../runbooks/auth-tenancy.md; ../../architecture/SYSTEM_ARCHITECTURE.md (Princípios).
2. [RESPONDIDA] Qual é o schema real de Paciente no Supabase (Aba 01)?
   - Resposta: especificado no contrato aprovado da Aba 01 (colunas, tipos, checks, RLS, DoD) e refletido nas migrations indexadas.
   - Fontes: ../../contracts/pacientes/ABA01_DADOS_PESSOAIS.md; ../../contracts/pacientes/README.md.

---

## Como propor novas perguntas

Critérios mínimos (todas as condições abaixo):
- Ser crítica: a falta da resposta pode causar retrabalho significativo/alinhamento quebrado.
- Não ser óbvia: a resposta não está evidente nos contratos, runbooks ou arquitetura canônica após leitura rápida.
- Ser específica: descreva claramente o problema/decisão esperada e o contexto onde será aplicada.

Padrão de submissão:
- Adicione sob “Perguntas Abertas (ativas)” com o marcador [ABERTA].
- Inclua links de contexto (contrato, runbook, arquitetura, PR/issue) quando existirem.
- Se a pergunta for completamente respondida posteriormente, mova para “Perguntas Respondidas (com links)” marcando [RESPONDIDA] e cite as fontes.
