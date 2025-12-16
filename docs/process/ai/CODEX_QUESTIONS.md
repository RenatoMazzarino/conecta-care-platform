# Perguntas de Arquitetura e Negócio

Este documento centraliza as perguntas críticas cujo desconhecimento pode levar a decisões de implementação erradas. Ele é um guia para o time e para assistentes de IA.

## Como Propor Novas Perguntas

Para adicionar uma nova pergunta, ela deve atender aos seguintes critérios:
1.  **Ser Crítica**: A falta da resposta deve ter o potencial de gerar retrabalho significativo ou desalinhamento técnico.
2.  **Não Ser Óbvia**: A resposta não deve ser facilmente encontrada em uma leitura rápida dos contratos ou da arquitetura principal.
3.  **Ser Específica**: A pergunta deve ser clara e direcionada a um problema real.

Adicione a pergunta na seção "Perguntas Abertas" e, se possível, sugira quem poderia respondê-la.

---

## Perguntas Abertas (Ativas)

Estas são as perguntas que ainda precisam de uma definição clara.

### Escalas
1.  Quais são os status oficiais de um plantão (ex: `Scheduled`, `Confirmed`, `InProgress`, `Completed`, `Missed`, `Cancelled`) e onde os registros de aprovação devem ser armazenados?
2.  Qual é o fluxo de troca de plantão: quem pode solicitar, quem aprova e quais eventos de auditoria são mandatórios?
3.  Check-in/out: Qual API de biometria (ex: SERPRO) e geolocalização/BLE será usada? Qual o payload mínimo que precisamos armazenar (geo, biometria, device, horário)?
4.  Existem regras de tolerância ou arredondamento para o cálculo de horas (atraso/adiantamento) que impactam o faturamento e o pagamento dos profissionais?

### Auditoria
5.  As políticas de retenção e anonimização de dados (LGPD) afetam o histórico de auditoria? Qual é o período de retenção definido?

### Segurança / Multi-tenant
6.  Quais são os papéis (Roles) oficiais do sistema (ex: admin da empresa, familiar, profissional, supervisor) e quais ações cada um pode executar nos módulos de Pacientes e Escalas?

### Dados / Schema
7.  Convenções de IDs legíveis (ex: `PAC-000123`, `ESC-000123`): como e onde são gerados? São apenas para exibição ou armazenados no banco?
8.  GED: Onde os documentos serão armazenados (bucket Supabase, S3, etc.)? Como serão versionados e vinculados a outras entidades (paciente, escala, financeiro)?
9.  Clínico/Financeiro/Inventário: Quais datasets de sistemas externos existentes devemos espelhar versus criar do zero?

---

## Perguntas Respondidas

Estas perguntas já foram cobertas pela documentação existente.

1.  **Endpoint centralizado de auditoria e campos mínimos?**
    -   **Status**: RESPONDIDA (Parcialmente)
    -   **Resposta**: O princípio da "Auditabilidade Completa" está definido, e a necessidade de rastrear `created_by` e `updated_by` é um requisito. A visão de longo prazo menciona um módulo de Auditoria. No entanto, o schema exato e a centralização do endpoint ainda estão em aberto.
    -   **Fonte**: `docs/architecture/SYSTEM_ARCHITECTURE.md` (Seção 1. Princípios Arquiteturais)

2.  **Eventos de Escalas e GED ficam em trilha única?**
    -   **Status**: RESPONDIDA (Parcialmente)
    -   **Resposta**: A visão de "Ecossistema Integrado" e "Visão 360" sugere que os dados serão centralizados em torno do paciente, mas a implementação específica (tabela única vs. particionada) não está definida.
    -   **Fonte**: `docs/architecture/SYSTEM_ARCHITECTURE.md` (Seção 3. Visão de Longo Prazo)

3.  **Como identificar o tenant e isolar a UI?**
    -   **Status**: RESPONDIDA
    -   **Resposta**: O `tenant_id` é extraído do JWT do usuário autenticado. As políticas de RLS no banco de dados garantem o isolamento dos dados.
    -   **Fonte**: `docs/runbooks/auth-tenancy.md`

4.  **Qual o schema real de Paciente no Supabase?**
    -   **Status**: RESPONDIDA
    -   **Resposta**: O schema completo da tabela `public.patients` para a Aba 01, incluindo colunas, tipos, constraints e validações, está detalhado no contrato.
    -   **Fonte**: `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md`

5.  **Há endpoint unificado para Histórico do paciente?**
    -   **Status**: RESPONDIDA (Parcialmente)
    -   **Resposta**: A arquitetura prevê um "Ecossistema Integrado" e a UI de referência (`modelo_final...htm`) mostra uma aba de "Histórico & Auditoria", indicando a intenção de unificar. A implementação detalhada, no entanto, não foi definida.
    -   **Fonte**: `docs/architecture/SYSTEM_ARCHITECTURE.md` e `html/modelo_final_aparencia_pagina_do_paciente.htm`
