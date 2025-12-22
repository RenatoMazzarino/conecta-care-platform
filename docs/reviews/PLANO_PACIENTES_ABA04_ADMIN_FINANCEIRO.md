# Plano de Implementação: Pacientes - Aba 04 (Administrativo e Financeiro)

**Objetivo:** Implementar a interface de edição de dados administrativos e financeiros do paciente, garantindo integridade com o legado e separação clara de responsabilidades.

**Status:** Draft  
**Data:** 22/12/2025  
**Base:** Snapshot `conectacare-2025-11-29.sql`

---

## 1. Estratégia de Interface (UI Cards)

A tela será dividida em cards lógicos para facilitar a visualização por perfis diferentes (Administrativo vs Financeiro).

### Card 1: Identificação Contratual
*Foco: Status e Vigência*

- **Campos (Read/Edit):**
    - **Status Atual:** Select (Ativo, Suspenso, Encerrado...). *Origem: `patient_admin_info.status`*.
    - **Motivo Status:** Text (se status != Ativo). *Origem: `patient_admin_info.status_reason`*.
    - **Tipo de Admissão:** Select (Home Care, Paliativo...). *Origem: `patient_admin_info.admission_type`*.
    - **Data de Início:** DatePicker. *Origem: `patient_admin_info.start_date`*.
    - **Data Prevista Alta/Fim:** DatePicker. *Origem: `patient_admin_info.end_date`*.
    - **Número do Contrato Interno:** Input (somente leitura para user básico). *Origem: `patient_admin_info.contract_id`*.
    - **Número do Contrato Externo:** Input. *Origem: `patient_admin_info.external_contract_id`*.
    - **Categoria:** Select. *Origem: `patient_admin_info.contract_category`*.

- **Conflito Legado:**
    - A tabela `patient_administrative_profiles` possui `admission_date` e `contract_number`.
    - **Decisão:** A UI lerá e gravará prioritariamente em `patient_admin_info` (`start_date` e `contract_id`). Se `patient_administrative_profiles` existir, um trigger ou serviço de backend deverá manter a sincronia, mas o frontend foca na tabela principal.

### Card 2: Origem e Captação
*Foco: Marketing e Comercial*

- **Campos:**
    - **Origem da Demanda:** Select/Input. *Origem: `patient_admin_info.demand_origin`*.
    - **Canal de Aquisição:** Input. *Origem: `patient_admin_info.acquisition_channel`*.
    - **Responsável Comercial:** Select (Busca User). *Origem: `patient_admin_info.commercial_responsible_id`*.
    - **Gerente de Contrato:** Select (Busca User). *Origem: `patient_admin_info.contract_manager_id`*.

### Card 3: Dados do Pagador (Financeiro)
*Foco: Quem paga a conta*

- **Campos:**
    - **Tipo de Pagador:** Select (Operadora, Particular, etc.). *Origem: `patient_admin_info.primary_payer_type`*.
    - **Pagador (Pessoa/Empresa):** Componente de busca polimórfica (PF ou PJ).
        - Salva em: `patient_admin_info.primary_payer_related_person_id` (se PF) ou `primary_payer_legal_entity_id` (se PJ).
        - *Nota:* Se for Operadora, buscar na tabela de Operadoras (se existir) ou usar campo texto `insurer_name` em `patient_financial_profiles` como fallback legado.
    - **Convênio/Seguradora:** Input Texto (Legado). *Origem: `patient_financial_profiles.insurer_name`*.
    - **Nome do Plano:** Input. *Origem: `patient_financial_profiles.plan_name`*.
    - **Carteirinha:** Input. *Origem: `patient_financial_profiles.insurance_card_number`*.
    - **Validade Carteira:** Date. *Origem: `patient_financial_profiles.insurance_card_validity`*.

### Card 4: Configuração de Faturamento
*Foco: Regras de Cobrança (Não operaciona, apenas configura)*

- **Campos:**
    - **Status Financeiro:** Select (Ativo, Inadimplente...). *Origem: `patient_financial_profiles.billing_status`*.
    - **Modelo de Cobrança:** Select (Mensalidade, Plantão...). *Origem: `patient_financial_profiles.billing_model`*.
    - **Dia de Vencimento:** Input Number (1-31). *Origem: `patient_financial_profiles.billing_due_day`*.
    - **Forma de Pagamento:** Select (Boleto, Pix...). *Origem: `patient_financial_profiles.payment_method`*.
    - **Envio de Fatura:** Checkbox/Select (Email, Correio). *Origem: `patient_financial_profiles.invoice_delivery_method`*.
    - **Emails para Cobrança:** Input (Multiple). *Origem: `patient_financial_profiles.billing_email_list`*.

### Card 5: Responsáveis Internos (Operacional)
*Foco: Quem cuida do caso*

- **Campos:**
    - **Filial/Área:** Select. *Origem: `patient_admin_info.operation_area`*.
    - **Supervisor Técnico:** Select (User). *Origem: `patient_admin_info.supervisor_id`*.
    - **Enfermeiro Responsável:** Select (User). *Origem: `patient_admin_info.nurse_responsible_id`*.
    - **Escalista:** Select (User). *Origem: `patient_admin_info.escalista_id`*.

### Card 6: Checklist de Implantação
*Foco: Compliance*

- **Estrutura:** Lista de itens com Checkbox + Data Auto + User Auto + Link Upload.
- **Itens Mapeados (`patient_admin_info`):**
    1.  **Contrato Assinado:** `chk_contract_ok`
    2.  **Termo de Consentimento:** `chk_consent_ok`
    3.  **Laudo Médico:** `chk_medical_report_ok`
    4.  **Documentos Pessoais:** `chk_legal_docs_ok`
    5.  **Comprovante Endereço:** `chk_address_proof_ok`
    6.  **Liminar Judicial:** `chk_judicial_ok` (com campo extra `judicial_case_number`)
- **Comportamento:** Ao marcar "OK", o sistema preenche `_at` e `_by` no backend. O front permite upload do arquivo (`_doc_id`).

---

## 2. Mapa de APIs e Integrações

Para esta etapa (Aba 04), as integrações são apenas **pontos de dados**, sem execução transacional complexa.

### Internas (Supabase)
1.  **GET /patient/:id/admin-financial**:
    - Query unificada (JOIN) entre `patient_admin_info` e `patient_financial_profiles`.
2.  **UPDATE /patient/:id/admin**:
    - Atualiza `patient_admin_info`.
3.  **UPDATE /patient/:id/financial**:
    - Atualiza `patient_financial_profiles`.
4.  **Upload de Documentos (Checklist)**:
    - Bucket: `patient-documents`.
    - Path: `/{tenant_id}/{patient_id}/admin/{doc_type}/{filename}`.

### Externas (Stubs/Futuro)
-   **Consulta ANS (Operadoras):** Validar se o nome da operadora existe na base oficial.
    -   *Ação Agora:* Apenas campo texto livre ou select simples.
-   **Validação de CPF/CNPJ (Pagador):**
    -   *Ação Agora:* Função utilitária no front (`utils/validators.ts`).
-   **ERP Financeiro (Omie/Totvs):**
    -   *Ação Agora:* Campo `erp_case_code` e `cost_center_id` disponíveis para preenchimento manual ou integração futura via Job.

---

## 3. Plano de Migrations

Não serão criadas novas tabelas. As tabelas `patient_admin_info` e `patient_financial_profiles` já existem no snapshot.
A migration necessária será apenas de **Policies (RLS)** se ainda não existirem, e **Triggers** para auditoria.

1.  **Migration 01:** Garantir índices em `patient_id` e `tenant_id` (já existem nas PKs).
2.  **Migration 02 (Opcional):** Criar trigger para atualizar `updated_at` automaticamente se o Postgres não tiver nativo.

---

## 4. Definição de Pronto (DoD)

### Documental
- [x] Contrato (ABA04_ADMIN_FINANCEIRO.md) revisado e aprovado.
- [x] Plano de UI mapeado com origem de dados.

### Técnico
- [ ] Types TypeScript gerados (`database.types.ts`) refletindo as colunas exatas.
- [ ] Zod Schemas criados para validação de formulário (AdminSchema, FinancialSchema).
- [ ] Componentes de UI (Cards) implementados usando `React Hook Form`.
- [ ] Integração com Supabase (Hooks `usePatientAdmin`, `usePatientFinancial`).

### Testes Manuais
- `npm run verify`: Deve passar sem erros de tipagem.
- Validar salvamento de Checklist: Marcar checkbox -> Recarregar página -> Checkbox persiste e campos `_at`/`_by` preenchidos.
- Validar RLS: Tentar acessar paciente de outro tenant via ID na URL -> Deve retornar 404/403.
