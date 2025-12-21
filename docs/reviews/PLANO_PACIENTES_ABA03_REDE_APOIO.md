# PLANO_PACIENTES_ABA03_REDE_APOIO

## 0) Baseline
- Branch / HEAD: `feat/pacientes-aba03-rede-apoio` / `16751a2784adea2f848c5ef5d62d2c2afdcf9cfa`
- `npm run docs:links` → ✅ OK (relatório em `docs/reviews/analise-governanca-estrutura-2025-12-19/DOCS_LINK_CHECK.md`)
- `npm run docs:lint` → ✅ OK

## 1) Objetivo
- Documentar o contrato e plano da Aba 03 (Rede de Apoio) usando o fluxo contrato → migrations → types → actions → UI, com foco nas três frentes centrais (responsáveis legais, contatos e rede de cuidados) e na operação do portal do paciente antes de tocar em banco/interfaces.
- Criar o contrato oficial em `docs/contracts/pacientes/ABA03_REDE_APOIO.md`, incorporando cobertura total do legado, mapa legado→canônico e as perguntas abertas que exigem decisão.

## 2) Escopo
**IN:**
- Plano detalhado da evolução multi-fase (docs → data → runtime). 
- Contrato completo com UI, campos/validações, workflows, legado (tabelas e colunas) e mapa legado→canônico.
- Registro das decisões tomadas e das perguntas abertas.
- Atualização de `docs/contracts/pacientes/INDEX.md` e `docs/contracts/pacientes/README.md` para incluir a Aba 03 em Draft.

**OUT:**
- Migrações, tipos TS, actions, componentes de UI ou runtime de IA.
- Qualquer arquivo extra além de `docs/reviews/PLANO_PACIENTES_ABA03_REDE_APOIO.md` e `docs/contracts/pacientes/ABA03_REDE_APOIO.md` (exceto os dois índices obrigatórios).

## 3) Referências obrigatórias
- `AGENT.md` (governança) 
- `docs/contracts/_templates/CONTRACT_TEMPLATE.md` (formato de contrato)
- `docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md` e `docs/contracts/pacientes/ABA02_ENDERECO_LOGISTICA.md` (padrões de detalhamento)
- `docs/architecture/decisions/ADR-004-ui-dynamics-standard.md`
- `html/modelo_final_aparencia_pagina_do_paciente.htm` (UI Dynamics)

## 4) Estado atual / inventário
- `src/components/patient/RedeApoioTab.tsx`: componente stub com dados mock e layout de tabela/cards, sem conexão a nenhuma action ou UI dinâmica.
- `src/app/pacientes/[id]/PatientPageClient.tsx`: aba registrada (label “Rede de apoio”) e exibe `RedeApoioTab` com mock; há mensagem placeholder sugerindo ainda não implementado.
- Tipos provisórios em `src/types/patient.ts` definem `RedeApoio` (nome, parentesco, telefone, etc.).
- Não há migrations, actions ou schemas específicos para Aba 03.

## 5) Estratégia por fases
1. **Docs (esta etapa)**: escrever plano + contrato, capturar cobertura de legado e decisões abertas (Aba 03 vs Aba 04, portal etc.).
2. **Dados**: definir tabelas canônicas (ex.: `patient_related_persons`, `patient_household_members`, `care_team_members`, `patient_documents`, `patient_document_logs`, `patient_admin_info`, `patient_administrative_profiles`) e novas colunas/constraints.
3. **Types**: gerar tipos Supabase baseados nas tabelas definidas.
4. **Actions**: desenhar actions de get/list/save/setPrimary/invite/revoke, validações de documentos e audit trail.
5. **UI**: implementar tabs (view/edit) com cards/leitura/edição e fichas das três frentes.
6. **Testes/Validations**: checklist de QA manual e docs (links + lint) novamente antes do merge.

## 6) Decisões já tomadas / aberto
**Fechadas (Renato):**
- Fluxo contrato-driven obrigatório.
- Multi-tenant + RLS + soft delete (uso de `tenant_id` e `deleted_at`).
- Modo leitura terá cards label/valor, modo edição com inputs como Aba01/Aba02.

**Em aberto (documentar no contrato + lista de perguntas no final):**
- Como separar Aba 03 x Aba 04 (opções descritas no contrato).
- Níveis de acesso do portal (quem recebe convite, o que visualiza/autoriza).
- Status de documentos (curatela vs procuração) e checklist de validação automática + manual.
- Definição do “principal contato” e flag de autorização para decisões clínicas/financeiras.

## 7) Cobertura do legado (prévia)
Tabulação das tabelas legadas que alimentam a Aba 03 e que serão detalhadas no contrato:
- `patient_related_persons` (responsáveis/contatos, flags de autorização, preferências, informações de contato e endereços).
- `patient_household_members` (moradores/cuidadores próximos com tipo/role/schedule).
- `care_team_members` (profissionais vinculados, papeis, contatos, status, regime, classificações internas vs externas).
- `patient_documents` (documentos jurídicos/financeiros/clinicos, metadados de versão, status e assinatura).
- `patient_document_logs` (auditoria de ações sobre documentos).
- `patient_admin_info` e `patient_administrative_profiles` (dados administrativos/equipe interna com escalistas, supervisores, checklists legais).

Cada tabela agora tem sua lista completa de colunas, tipos e constraints dentro de `docs/contracts/pacientes/ABA03_REDE_APOIO.md`, seguida do mapa legado→canônico e das decisões de domínio.

## 8) Validações (docs-only)
- `npm run docs:links` (já executado) 
- `npm run docs:lint` (já executado)

Se algum destes falhar, registrar erro acima e continuar apenas com docs (sem corrigir o erro nesta etapa). 

## 9) Riscos e mitigação
- **Gaps de informações**: legados podem ter colunas não mapeadas; mitigação: incluir seção “mapa legado→canônico” e perguntas abertas. 
- **Decisões de separação Aba03/Aba04** indefinidas: deixar opção recomendada + ancorar as perguntas ao contrato para decisão posterior. 
- **Regra de acesso**: se o portal precisar de roles adicionais, documentar dependência de RLS e fluxos de auditoria.

## 10) Perguntas abertas (priorizadas)
- Confirmar se a Aba 04 deve abrigar os profissionais internos ou se a Aba 03 cobre toda a rede e usa `type/origin` para separar.
- Definir o escopo do portal (quais níveis — visualizar, comunicar, autorizar — entram já no MVP e quem pode mudar).
- Estabelecer o workflow de documentos jurídicos: IA + checklist manual ou apenas manual no V1?
- Validar quais `document_status` bloqueiam o portal (ex.: curatela/rejeição impede envio de convite) e quem registra a assinatura final (`signed_by` ou similar).
