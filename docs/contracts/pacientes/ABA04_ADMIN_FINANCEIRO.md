# Contrato de Dados: Pacientes - Aba 04 (Administrativo e Financeiro)

**Status:** Draft  
**Responsável:** Agente Gemini  
**Última Atualização:** 22/12/2025  
**Versão Legado:** Snapshot `conectacare-2025-11-29.sql`

---

## 1. Visão Geral
Este contrato define a estrutura de dados, validações e mapeamento para a **Aba 04 (Administrativo e Financeiro)** do cadastro de pacientes.
Esta aba unifica dados contratuais, administrativos (checklists, datas, responsáveis) e financeiros (pagador, plano, dados de faturamento).

**Escopo:**
- Gestão de dados cadastrais administrativos (contratos, datas, status).
- Gestão de dados cadastrais financeiros (pagador, convênio, dados de cobrança).
- Checklists de implantação/admissão.

**Fora de Escopo (Out):**
- Operações financeiras transacionais (emissão de boletos, NFs, contas a receber).
- Regras de cálculo de repasse (apenas cadastro de regras básicas).

---

## 2. Tabelas Canônicas (Fonte da Verdade)

O armazenamento dos dados é híbrido no legado, mas consolidado na UI.

| Tabela (Postgres) | Papel | Obs |
| :--- | :--- | :--- |
| `public.patient_admin_info` | **Primária** | Contém 80% dos dados: contratos, checklists, datas, responsáveis internos. |
| `public.patient_financial_profiles` | **Secundária** | Dados específicos de faturamento, cobrança e detalhes do plano de saúde/pagador. |
| `public.patient_administrative_profiles` | *Legado/Depreciada* | Tabela redundante. Usar apenas se o campo não existir na `patient_admin_info`. |

---

## 3. Estratégia de Identificação & Tenant

- **Tenant:** Obrigatório em todas as queries (`tenant_id = auth.jwt() -> tenant_id`).
- **Chave Primária:** `patient_id` (PK compartilhada 1:1 com tabela `patients`).
- **RLS:** Policies devem validar `tenant_id`.

---

## 4. Mapeamento de Campos (Exaustivo)

### Grupo 1: Identificação Contratual & Status
*Dados fundamentais do contrato de Home Care.*

| Label UI | Tabela Legado | Coluna Legado | Tipo | Obrigatório | Default | Validação/Enum | Obs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Status do Contrato | `patient_admin_info` | `status` | `text` | Sim | `'Ativo'` | `'Ativo', 'Inativo', 'Suspenso', ...` | Campo mestre de status. |
| Motivo Status | `patient_admin_info` | `status_reason` | `text` | Não | - | - | Justificativa se suspenso/cancelado. |
| Data Início | `patient_admin_info` | `start_date` | `date` | Sim | - | Data passada ou futura. | Data de início do atendimento. |
| Data Fim | `patient_admin_info` | `end_date` | `date` | Não | - | > Data Início | |
| Tipo Admissão | `patient_admin_info` | `admission_type` | `text` | Sim | - | `home_care`, `paliativo`, etc. | |
| Origem Demanda | `patient_admin_info` | `demand_origin` | `text` | Não | - | - | Ex: Hospital X, Indicacao Y. |
| Canal Aquisição | `patient_admin_info` | `acquisition_channel` | `text` | Não | - | - | |
| Núm. Contrato | `patient_admin_info` | `contract_id` | `text` | Não | - | - | Código interno do contrato. |
| Núm. Contrato Ext. | `patient_admin_info` | `external_contract_id` | `text` | Não | - | - | Código no cliente/operadora. |
| Categoria Contrato | `patient_admin_info` | `contract_category` | `enum` | Não | - | `contract_category_enum` | |
| Data Renovação | `patient_admin_info` | `contract_end_date` | `date` | Não | - | - | Previsão de fim de vigência contratual. |
| Tipo Renovação | `patient_admin_info` | `renewal_type` | `enum` | Não | - | `renewal_type_enum` | |

### Grupo 2: Responsáveis Internos
*Quem cuida deste paciente dentro da empresa.*

| Label UI | Tabela Legado | Coluna Legado | Tipo | Obrigatório | Default | Validação/Enum | Obs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Supervisor | `patient_admin_info` | `supervisor_id` | `uuid` | Não | - | FK `auth.users` | |
| Enfermeiro Resp. | `patient_admin_info` | `nurse_responsible_id` | `uuid` | Não | - | FK `auth.users` | |
| Escalista | `patient_admin_info` | `escalista_id` | `uuid` | Não | - | FK `auth.users` | |
| Resp. Comercial | `patient_admin_info` | `commercial_responsible_id` | `uuid` | Não | - | FK `auth.users` | |
| Gerente Contrato | `patient_admin_info` | `contract_manager_id` | `uuid` | Não | - | FK `auth.users` | |
| Área Operação | `patient_admin_info` | `operation_area` | `text` | Não | - | - | Região/Filial. |

### Grupo 3: Dados Financeiros & Pagador
*Quem paga e como cobra.*

| Label UI | Tabela Legado | Coluna Legado | Tipo | Obrigatório | Default | Validação/Enum | Obs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Tipo Pagador | `patient_admin_info` | `primary_payer_type` | `text` | Sim | - | `Operadora`, `PessoaFisica`, `Empresa`... | Check constraint no banco. |
| Descrição Pagador | `patient_admin_info` | `primary_payer_description` | `text` | Não | - | - | Nome display do pagador. |
| Pessoa Relacionada | `patient_admin_info` | `primary_payer_related_person_id` | `uuid` | Não | - | FK `patient_related_persons` | Se pagador for PF. |
| Entidade Legal | `patient_admin_info` | `primary_payer_legal_entity_id` | `uuid` | Não | - | FK `legal_entities` (se existir) | Se pagador for PJ. |
| Tipo Vínculo | `patient_financial_profiles` | `bond_type` | `text` | Não | - | `Plano de Saúde`, `Particular`... | |
| Nome Convênio | `patient_financial_profiles` | `insurer_name` | `text` | Não | - | - | |
| Nome Plano | `patient_financial_profiles` | `plan_name` | `text` | Não | - | - | |
| Carteirinha | `patient_financial_profiles` | `insurance_card_number` | `text` | Não | - | - | |
| Validade Carteira | `patient_financial_profiles` | `insurance_card_validity` | `date` | Não | - | - | |
| Titular Cartão | `patient_financial_profiles` | `card_holder_name` | `text` | Não | - | - | |
| Resp. Financeiro | `patient_financial_profiles` | `financial_responsible_name` | `text` | Não | - | - | Nome texto livre (legado). |
| Contato Fin. | `patient_financial_profiles` | `financial_responsible_contact` | `text` | Não | - | - | |
| Centro Custo | `patient_admin_info` | `cost_center_id` | `text` | Não | - | - | ID para integração contábil. |
| Cód. Caso ERP | `patient_admin_info` | `erp_case_code` | `text` | Não | - | - | |

### Grupo 4: Configuração de Faturamento (Billing)
*Regras de cobrança.*

| Label UI | Tabela Legado | Coluna Legado | Tipo | Obrigatório | Default | Validação/Enum | Obs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Status Cobrança | `patient_financial_profiles` | `billing_status` | `text` | Sim | `'active'` | `active`, `suspended`, `defaulting` | |
| Modelo Cobrança | `patient_financial_profiles` | `billing_model` | `text` | Não | - | `Mensalidade`, `Diaria`, `Plantao_12h`... | |
| Valor Base | `patient_financial_profiles` | `billing_base_value` | `numeric` | Não | - | - | |
| Periodicidade | `patient_financial_profiles` | `billing_periodicity` | `text` | Não | - | - | |
| Dia Vencimento | `patient_financial_profiles` | `billing_due_day` | `int` | Não | - | 1-31 | |
| Método Pagto | `patient_financial_profiles` | `payment_method` | `text` | Não | - | `Boleto`, `Pix`, etc. | |
| Envio Fatura | `patient_financial_profiles` | `invoice_delivery_method` | `text` | Não | - | `Email`, `Portal`... | |
| Email Faturamento | `patient_financial_profiles` | `billing_email_list` | `text` | Não | - | Email válido | |
| Endereço Cobrança | `patient_financial_profiles` | `billing_street`... | `text` | Não | - | - | Campos: logradouro, num, cep, bairro, cidade, uf. |

### Grupo 5: Checklists e Controles (Auditoria)
*Rastreabilidade de documentos e processos.*

| Label UI | Tabela Legado | Coluna Legado | Tipo | Obrigatório | Default | Obs |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Contrato OK? | `patient_admin_info` | `chk_contract_ok` | `bool` | Não | `false` | |
| Data Contrato | `patient_admin_info` | `chk_contract_at` | `date` | Não | - | |
| Usuário Contrato | `patient_admin_info` | `chk_contract_by` | `text` | Não | - | Legado usa texto, idealmente migrar para UUID. |
| Doc Contrato | `patient_admin_info` | `chk_contract_doc_id` | `uuid` | Não | - | Link para arquivo. |
| Consentimento OK? | `patient_admin_info` | `chk_consent_ok` | `bool` | Não | `false` | |
| Laudo Médico OK? | `patient_admin_info` | `chk_medical_report_ok` | `bool` | Não | `false` | |
| Docs Legais OK? | `patient_admin_info` | `chk_legal_docs_ok` | `bool` | Não | `false` | |
| Docs Financ. OK? | `patient_admin_info` | `chk_financial_docs_ok` | `bool` | Não | `false` | |
| Judicial? | `patient_admin_info` | `chk_judicial_ok` | `bool` | Não | `false` | |
| Num. Processo | `patient_admin_info` | `judicial_case_number` | `text` | Não | - | |
| Notas Checklist | `patient_admin_info` | `checklist_notes_detailed` | `text` | Não | - | |

---

## 5. Auditoria e Imutabilidade

### Colunas de Controle
As tabelas legadas possuem `created_at` e `updated_at`.
- **Risco:** `patient_admin_info` não possui `updated_by` nativo (apenas nos checklists).
- **Ação:** Utilizar `system_audit_logs` (tabela de auditoria central) para rastrear alterações críticas (mudança de status, valores financeiros).

### Soft Delete
- **Status:** Não existe coluna `deleted_at` nas tabelas principais (`patient_admin_info`, `patient_financial_profiles`).
- **Mecanismo:** A exclusão lógica é realizada via alteração de status (`status = 'Cancelado'` ou `billing_status = 'suspended'`).
- **Regra:** A UI não deve permitir "Deletar" paciente, apenas "Arquivar/Encerrar Contrato".

---

## 6. Checklist de Validação (DoD)

- [ ] Todos os campos listados no Grupo 1 (Contrato) aparecem na UI e persistem em `patient_admin_info`.
- [ ] Todos os campos listados no Grupo 3/4 (Financeiro) persistem em `patient_financial_profiles`.
- [ ] Alteração de status gera log de auditoria.
- [ ] Checklists salvam data (`_at`) e usuário (`_by`) automaticamente no backend.
- [ ] RLS impede visualização de dados financeiros de outro tenant.
- [ ] Campos de endereço de cobrança são carregados corretamente (separados do endereço residencial da Aba 02).

---
**Validação Técnica:**
Executar `npm run verify` para garantir integridade dos types gerados.
