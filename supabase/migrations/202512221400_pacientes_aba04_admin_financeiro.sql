-- CONTRATO: docs/contracts/pacientes/ABA04_ADMIN_FINANCEIRO.md
-- PR: N/A (local)
-- EVIDENCIA: docs/contracts/pacientes/README.md
-- DESCRICAO: cria tabelas canonicas ABA04 + ajustes de pagador e observabilidade

create table public.billing_entities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  kind text not null,
  name text not null,
  legal_name text null,
  doc_type text null,
  doc_number text null,
  contact_email text null,
  contact_phone text null,
  billing_address_cep text null,
  billing_address_street text null,
  billing_address_number text null,
  billing_address_neighborhood text null,
  billing_address_city text null,
  billing_address_state text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null references auth.users(id),
  updated_by uuid null references auth.users(id),
  deleted_at timestamptz null,
  constraint billing_entities_kind_chk check (kind in ('person', 'company', 'insurer', 'broker', 'public')),
  constraint billing_entities_doc_type_chk check (doc_number is null or doc_type is not null)
);

create index billing_entities_tenant_idx on public.billing_entities (tenant_id);
create index billing_entities_kind_idx on public.billing_entities (tenant_id, kind);
create index billing_entities_doc_number_idx on public.billing_entities (tenant_id, doc_number);
create index billing_entities_name_idx on public.billing_entities (tenant_id, lower(name));
create index billing_entities_legal_name_idx on public.billing_entities (tenant_id, lower(legal_name));
create unique index billing_entities_doc_uidx
  on public.billing_entities (tenant_id, kind, doc_type, regexp_replace(doc_number, '[^0-9]', '', 'g'))
  where deleted_at is null and doc_number is not null;

select app_private.set_updated_at_trigger('public.billing_entities'::regclass);

alter table public.billing_entities enable row level security;

create policy billing_entities_select_tenant on public.billing_entities
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy billing_entities_insert_tenant on public.billing_entities
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy billing_entities_update_tenant on public.billing_entities
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy billing_entities_delete_tenant on public.billing_entities
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create table public.care_policy_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  name text not null,
  description text null,
  rule_set jsonb not null,
  is_default boolean not null default false,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null references auth.users(id),
  updated_by uuid null references auth.users(id),
  deleted_at timestamptz null
);

create index care_policy_profiles_tenant_idx on public.care_policy_profiles (tenant_id);
create unique index care_policy_profiles_name_uidx
  on public.care_policy_profiles (tenant_id, name)
  where deleted_at is null;
create unique index care_policy_profiles_default_uidx
  on public.care_policy_profiles (tenant_id)
  where is_default = true and deleted_at is null;

select app_private.set_updated_at_trigger('public.care_policy_profiles'::regclass);

alter table public.care_policy_profiles enable row level security;

create policy care_policy_profiles_select_tenant on public.care_policy_profiles
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy care_policy_profiles_insert_tenant on public.care_policy_profiles
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy care_policy_profiles_update_tenant on public.care_policy_profiles
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy care_policy_profiles_delete_tenant on public.care_policy_profiles
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create table public.patient_admin_financial_profile (
  patient_id uuid primary key references public.patients(id),
  tenant_id uuid not null default app_private.current_tenant_id(),
  administrative_status text not null default 'em_cadastro',
  administrative_status_reason text null,
  administrative_status_changed_at timestamptz null,
  admission_type text null,
  admission_date date null,
  discharge_prediction_date date null,
  discharge_date date null,
  admission_source text null,
  demand_origin text null,
  demand_origin_description text null,
  acquisition_channel text null,
  service_package_name text null,
  service_package_description text null,
  policy_profile_id uuid null references public.care_policy_profiles(id),
  contract_id text null,
  external_contract_id text null,
  contract_start_date date null,
  contract_end_date date null,
  contract_status text null,
  contract_status_reason text null,
  contract_category text null,
  renewal_type text null,
  authorization_number text null,
  judicial_case_number text null,
  official_letter_number text null,
  cost_center_id text null,
  erp_case_code text null,
  commercial_responsible_id uuid null references auth.users(id),
  contract_manager_id uuid null references auth.users(id),
  payer_admin_contact_id uuid null references public.patient_related_persons(id),
  payer_admin_contact_description text null,
  primary_payer_entity_id uuid null references public.billing_entities(id),
  primary_payer_related_person_id uuid null references public.patient_related_persons(id),
  payer_relation text null,
  financial_responsible_name text null,
  financial_responsible_contact text null,
  bond_type text null,
  insurer_name text null,
  plan_name text null,
  insurance_card_number text null,
  insurance_card_validity date null,
  monthly_fee numeric(10,2) null default 0,
  billing_due_day integer null,
  billing_status text null default 'active',
  payment_method text null,
  billing_model text null,
  billing_base_value numeric null,
  billing_periodicity text null,
  payment_terms text null,
  grace_period_days integer null default 0,
  copay_percent numeric null,
  readjustment_index text null,
  readjustment_month integer null,
  late_fee_percent numeric null default 0,
  daily_interest_percent numeric null default 0,
  discount_early_payment numeric null default 0,
  discount_days_limit integer null,
  card_holder_name text null,
  invoice_delivery_method text null,
  receiving_account_info text null,
  financial_notes text null,
  checklist_complete boolean not null default false,
  checklist_notes text null,
  admin_notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null references auth.users(id),
  updated_by uuid null references auth.users(id),
  deleted_at timestamptz null,
  constraint patient_admin_financial_profile_admin_status_chk check (
    administrative_status in (
      'em_cadastro',
      'pendente_documentos',
      'pendente_autorizacao',
      'em_implantacao',
      'pronto_para_faturar',
      'faturamento_suspenso',
      'encerrado_administrativo'
    )
  ),
  constraint patient_admin_financial_profile_contract_status_chk check (
    contract_status is null
    or contract_status in ('Proposta', 'Em_Implantacao', 'Ativo', 'Suspenso', 'Encerrado', 'Cancelado', 'Recusado')
  ),
  constraint patient_admin_financial_profile_admission_type_chk check (
    admission_type is null
    or admission_type in ('home_care', 'paliativo', 'procedimento_pontual', 'reabilitacao')
  ),
  constraint patient_admin_financial_profile_contract_category_chk check (
    contract_category is null
    or contract_category in ('Particular_Premium', 'Convenio_Padrao', 'Judicial', 'SUS', 'Cortesia')
  ),
  constraint patient_admin_financial_profile_renewal_type_chk check (
    renewal_type is null
    or renewal_type in ('Automatica', 'Periodo_Fixo', 'Por_Laudo', 'Judicial')
  ),
  constraint patient_admin_financial_profile_bond_type_chk check (
    bond_type is null
    or bond_type in ('Plano_Saude', 'Particular', 'Convenio', 'Publico')
  ),
  constraint patient_admin_financial_profile_billing_status_chk check (
    billing_status is null
    or billing_status in ('active', 'suspended', 'defaulting')
  ),
  constraint patient_admin_financial_profile_payment_method_chk check (
    payment_method is null
    or payment_method in ('Boleto', 'Pix', 'Transferencia', 'Debito_Automatico', 'Cartao_Credito', 'Dinheiro', 'Outro')
  ),
  constraint patient_admin_financial_profile_billing_model_chk check (
    billing_model is null
    or billing_model in ('Mensalidade', 'Diaria', 'Plantao_12h', 'Plantao_24h', 'Visita', 'Pacote_Fechado', 'Outro')
  ),
  constraint patient_admin_financial_profile_invoice_delivery_chk check (
    invoice_delivery_method is null
    or invoice_delivery_method in ('Email', 'Portal', 'WhatsApp', 'Correio', 'Nao_Envia')
  ),
  constraint patient_admin_financial_profile_billing_due_day_chk check (
    billing_due_day is null or billing_due_day between 1 and 31
  ),
  constraint patient_admin_financial_profile_contract_dates_chk check (
    contract_end_date is null
    or contract_start_date is null
    or contract_end_date >= contract_start_date
  ),
  constraint patient_admin_financial_profile_discharge_dates_chk check (
    discharge_date is null
    or admission_date is null
    or discharge_date >= admission_date
  )
);

create index patient_admin_financial_profile_tenant_idx on public.patient_admin_financial_profile (tenant_id);
create index patient_admin_financial_profile_contract_id_idx on public.patient_admin_financial_profile (contract_id);
create index patient_admin_financial_profile_external_contract_idx on public.patient_admin_financial_profile (external_contract_id);
create index patient_admin_financial_profile_policy_profile_idx on public.patient_admin_financial_profile (policy_profile_id);
create index patient_admin_financial_profile_payer_entity_idx on public.patient_admin_financial_profile (primary_payer_entity_id);

select app_private.set_updated_at_trigger('public.patient_admin_financial_profile'::regclass);

alter table public.patient_admin_financial_profile enable row level security;

create policy patient_admin_financial_profile_select_tenant on public.patient_admin_financial_profile
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy patient_admin_financial_profile_insert_tenant on public.patient_admin_financial_profile
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_admin_financial_profile_update_tenant on public.patient_admin_financial_profile
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_admin_financial_profile_delete_tenant on public.patient_admin_financial_profile
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create table public.patient_onboarding_checklist (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid not null references public.patients(id),
  item_code text not null,
  item_description text null,
  is_completed boolean not null default false,
  completed_at timestamptz null,
  completed_by_user_id uuid null references auth.users(id),
  completed_by_label text null,
  document_id uuid null references public.patient_documents(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null references auth.users(id),
  updated_by uuid null references auth.users(id),
  deleted_at timestamptz null,
  constraint patient_onboarding_checklist_item_code_chk check (
    item_code in (
      'CONTRACT',
      'CONSENT',
      'MEDICAL_REPORT',
      'LEGAL_DOCS',
      'FINANCIAL_DOCS',
      'JUDICIAL',
      'ADDRESS_PROOF',
      'LEGAL_GUARDIAN_DOCS',
      'FINANCIAL_RESPONSIBLE_DOCS',
      'OTHER_DOCS'
    )
  )
);

create index patient_onboarding_checklist_tenant_idx on public.patient_onboarding_checklist (tenant_id);
create index patient_onboarding_checklist_patient_idx on public.patient_onboarding_checklist (tenant_id, patient_id);
create index patient_onboarding_checklist_item_idx on public.patient_onboarding_checklist (patient_id, item_code);
create unique index patient_onboarding_checklist_uidx
  on public.patient_onboarding_checklist (patient_id, item_code)
  where deleted_at is null;

select app_private.set_updated_at_trigger('public.patient_onboarding_checklist'::regclass);

alter table public.patient_onboarding_checklist enable row level security;

create policy patient_onboarding_checklist_select_tenant on public.patient_onboarding_checklist
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy patient_onboarding_checklist_insert_tenant on public.patient_onboarding_checklist
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_onboarding_checklist_update_tenant on public.patient_onboarding_checklist
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_onboarding_checklist_delete_tenant on public.patient_onboarding_checklist
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create table public.patient_timeline_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid not null references public.patients(id),
  event_time timestamptz not null default now(),
  event_type text not null,
  event_category text null,
  title text null,
  description text null,
  tone text not null default 'default',
  payload jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null references auth.users(id),
  updated_by uuid null references auth.users(id),
  deleted_at timestamptz null,
  constraint patient_timeline_events_tone_chk check (tone in ('default', 'success', 'warning', 'critical'))
);

create index patient_timeline_events_tenant_idx on public.patient_timeline_events (tenant_id);
create index patient_timeline_events_patient_idx on public.patient_timeline_events (tenant_id, patient_id, event_time desc);
create index patient_timeline_events_type_idx on public.patient_timeline_events (event_type);

select app_private.set_updated_at_trigger('public.patient_timeline_events'::regclass);

alter table public.patient_timeline_events enable row level security;

create policy patient_timeline_events_select_tenant on public.patient_timeline_events
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy patient_timeline_events_insert_tenant on public.patient_timeline_events
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_timeline_events_update_tenant on public.patient_timeline_events
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_timeline_events_delete_tenant on public.patient_timeline_events
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

alter table public.patient_related_persons
  add column if not exists is_payer boolean not null default false;

create index if not exists patient_related_persons_payer_idx
  on public.patient_related_persons (patient_id, is_payer)
  where deleted_at is null;
