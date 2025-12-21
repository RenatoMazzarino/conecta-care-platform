# PLANO_PACIENTES_ABA03_REDE_APOIO

## 0) Baseline
- `git status -sb` → `## feat/pacientes-aba03-rede-apoio...origin/feat/pacientes-aba03-rede-apoio [ahead 1]` (com alterações em docs)
- `git rev-parse --abbrev-ref HEAD` → `feat/pacientes-aba03-rede-apoio`
- `git rev-parse HEAD` → `a66068d7ad8238cf548876014ad9023f14cab052`
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
1. **Docs**: contratos e plano estão consolidados — legados mapeados e escopo fechado; estamos prontos para atacar a implementação ponta a ponta.
2. **Dados**: definir tabelas canônicas (ex.: `patient_related_persons`, `patient_household_members`, `care_team_members`, `patient_documents`, `patient_document_logs`, `patient_portal_access`) e novas colunas/constraints. Tabelas administrativas permanecem na Aba04.
3. **Types**: gerar tipos Supabase baseados nas tabelas definidas.
4. **Actions**: desenhar actions de get/list/save/setPrimary/invite/revoke, validações de documentos e audit trail.
5. **UI**: implementar tabs (view/edit) com cards/leitura/edição e fichas das três frentes.
6. **Testes/Validations**: checklist de QA manual e docs (links + lint) novamente antes do merge.

## 6) Decisões já tomadas / aberto
**Fechadas (Renato):**
- Fluxo contrato-driven obrigatório.
- Multi-tenant + RLS + soft delete (uso de `tenant_id` e `deleted_at`).
- Modo leitura terá cards label/valor, modo edição com inputs como Aba01/Aba02.
- Aba03 se restringe à rede de apoio: referências a gestor/escalista/admin financeiro foram removidas e registradas como fora do escopo (Aba04 Administrativa).
- Profissionais de saúde externos permanecem na Aba03; administração/backoffice permanece na Aba04.
- IA para validação legal preparada, mas desligada por padrão (`LEGAL_DOC_AI_ENABLED=false`).
- Aprovação manual é obrigatória para validar o responsável legal (`document_status = manual_approved`).
- Governança do portal (MVP) está especificada apenas como gestão e rastreabilidade, sem implementação de portal.

**Em aberto (documentar no contrato + lista de perguntas no final):**
- Permissões internas específicas com claim `can_manage_portal_access=true`.
- Campo canônico para assinatura final da revisão (`approved_by`/`signed_by`) e onde ficará registrado.
## 7) Cobertura do legado (prévia)
Tabulação das tabelas legadas que alimentam a Aba 03 e que serão detalhadas no contrato:
- `patient_related_persons` (responsáveis/contatos, flags de autorização, preferências, informações de contato e endereços).
- `patient_household_members` (moradores/cuidadores próximos com tipo/role/schedule).
- `care_team_members` (profissionais vinculados, papeis, contatos, status, regime, classificações internas vs externas).
- `patient_documents` (recorte jurídico de curatela/procuração e metadados de validação).
- `patient_document_logs` (auditoria de ações sobre documentos).
- `view_patient_legal_guardian_summary` (view legado para resumo do responsável legal).
- `patient_admin_info` e `patient_administrative_profiles` aparecem apenas como “fora do escopo” (Aba04 Administrativa).

- Cada tabela agora tem sua lista completa de colunas, tipos e constraints dentro de `docs/contracts/pacientes/ABA03_REDE_APOIO.md`, seguida do mapa legado→canônico. Os dados administrativos aparecem apenas para rastrear o legado e são explicitamente marcados como “Fora do escopo (Aba04 Administrativa)” para garantir cobertura total sem misturar escopo.

## 8) Validações (docs-only)
- `npm run docs:links` (já executado) 
- `npm run docs:lint` (já executado)

Se algum destes falhar, registrar erro acima e continuar apenas com docs (sem corrigir o erro nesta etapa). 

## 9) Riscos e mitigação
- **Gaps de informações**: legados podem ter colunas não mapeadas; mitigação: incluir seção “mapa legado→canônico” e perguntas abertas. 
- **Decisões de separação Aba03/Aba04** indefinidas: deixar opção recomendada + ancorar as perguntas ao contrato para decisão posterior. 
- **Regra de acesso**: se o portal precisar de roles adicionais, documentar dependência de RLS e fluxos de auditoria.
- **Audit trail**: garantir eventos de upload, mudança de status, geração/revogação de links e troca do responsável vigente; registrar que esses eventos existem mesmo que a infraestrutura venha depois.

## 10) Perguntas abertas (priorizadas)
- Confirmar quais perfis internos terão a permissão `can_manage_portal_access=true` (alteração/revogação de acesso).
- Validar quem assina a revisão final (campo `approved_by`/`signed_by`) e onde esse registro ficará no modelo canônico.
