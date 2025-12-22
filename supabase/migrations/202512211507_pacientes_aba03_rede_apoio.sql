-- CONTRATO: docs/contracts/pacientes/ABA03_REDE_APOIO.md
-- PR: TBD
-- DESCRICAO: cria tabelas ABA03 (rede de apoio) + portal_access + view resumo do responsavel legal

create table public.patient_related_persons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid not null references public.patients(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null,
  updated_by uuid null,
  deleted_at timestamptz null,
  name text not null,
  relationship_degree text null,
  role_type text null default 'Familiar',
  is_legal_guardian boolean not null default false,
  is_financial_responsible boolean not null default false,
  is_emergency_contact boolean not null default false,
  lives_with_patient text null,
  visit_frequency text null,
  access_to_home boolean not null default false,
  can_authorize_clinical boolean not null default false,
  can_authorize_financial boolean not null default false,
  phone_primary text null,
  phone_secondary text null,
  email text null,
  contact_time_preference text null,
  priority_order integer not null default 99,
  cpf text null,
  rg text null,
  address_full text null,
  allow_clinical_updates boolean not null default true,
  allow_admin_notif boolean not null default true,
  block_marketing boolean not null default false,
  observations text null,
  is_whatsapp boolean not null default false,
  birth_date date null,
  rg_issuer text null,
  rg_state text null,
  address_street text null,
  address_number text null,
  address_city text null,
  address_state text null,
  contact_type text null,
  is_main_contact boolean not null default false,
  relation_description text null,
  preferred_contact text null,
  address_summary text null,
  observacoes_lgpd text null,
  constraint patient_related_persons_lives_with_chk check (
    lives_with_patient is null or lives_with_patient in ('Sim', 'Nao', 'VisitaFrequente', 'VisitaEventual')
  ),
  constraint patient_related_persons_contact_time_chk check (
    contact_time_preference is null
    or contact_time_preference in ('Manha', 'Tarde', 'Noite', 'Comercial', 'Qualquer Horario')
  ),
  constraint patient_related_persons_contact_type_chk check (
    contact_type is null
    or contact_type in (
      'ResponsavelLegal',
      'ResponsavelFinanceiro',
      'ContatoEmergencia24h',
      'Familiar',
      'Cuidador',
      'Vizinho',
      'Sindico',
      'Zelador',
      'Amigo',
      'Outro'
    )
  ),
  constraint patient_related_persons_preferred_contact_chk check (
    preferred_contact is null
    or preferred_contact in ('whatsapp', 'phone', 'sms', 'email', 'other')
  )
);

create index patient_related_persons_tenant_idx on public.patient_related_persons (tenant_id);
create index patient_related_persons_patient_idx on public.patient_related_persons (tenant_id, patient_id);
create index patient_related_persons_patient_guardian_idx on public.patient_related_persons (patient_id, is_legal_guardian);
create unique index patient_related_persons_active_guardian_uidx
  on public.patient_related_persons (patient_id)
  where is_legal_guardian = true and deleted_at is null;

select app_private.set_updated_at_trigger('public.patient_related_persons'::regclass);

alter table public.patient_related_persons enable row level security;

create policy patient_related_persons_select_tenant on public.patient_related_persons
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy patient_related_persons_insert_tenant on public.patient_related_persons
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_related_persons_update_tenant on public.patient_related_persons
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_related_persons_delete_tenant on public.patient_related_persons
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create table public.patient_household_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid not null references public.patients(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null,
  updated_by uuid null,
  deleted_at timestamptz null,
  name text not null,
  role text not null,
  type text not null,
  schedule_note text null,
  constraint patient_household_members_type_chk check (type in ('resident', 'caregiver'))
);

create index patient_household_members_tenant_idx on public.patient_household_members (tenant_id);
create index patient_household_members_patient_idx on public.patient_household_members (tenant_id, patient_id);

select app_private.set_updated_at_trigger('public.patient_household_members'::regclass);

alter table public.patient_household_members enable row level security;

create policy patient_household_members_select_tenant on public.patient_household_members
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy patient_household_members_insert_tenant on public.patient_household_members
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_household_members_update_tenant on public.patient_household_members
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_household_members_delete_tenant on public.patient_household_members
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create table public.care_team_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid not null references public.patients(id),
  professional_id uuid null,
  user_profile_id uuid null,
  role_in_case text not null,
  is_reference_professional boolean not null default false,
  regime text null default 'Fixo',
  work_window_summary text null,
  status text not null default 'Ativo',
  start_date date not null default current_date,
  end_date date null,
  contact_info_override text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null,
  updated_by uuid null,
  deleted_at timestamptz null,
  professional_category text null,
  is_technical_responsible boolean not null default false,
  is_family_focal_point boolean not null default false,
  contact_email text null,
  contact_phone text null,
  work_window text null,
  employment_type text null,
  internal_extension text null,
  corporate_cell text null,
  profissional_nome text null,
  constraint care_team_members_status_chk check (status in ('Ativo', 'Afastado', 'Encerrado', 'Standby'))
);

create index care_team_members_tenant_idx on public.care_team_members (tenant_id);
create index care_team_members_patient_idx on public.care_team_members (tenant_id, patient_id);

select app_private.set_updated_at_trigger('public.care_team_members'::regclass);

alter table public.care_team_members enable row level security;

create policy care_team_members_select_tenant on public.care_team_members
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy care_team_members_insert_tenant on public.care_team_members
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy care_team_members_update_tenant on public.care_team_members
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy care_team_members_delete_tenant on public.care_team_members
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create table public.patient_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid not null references public.patients(id),
  related_object_id uuid null,
  file_name text not null,
  file_path text not null,
  file_size_bytes bigint null,
  mime_type text null,
  title text not null,
  category text not null,
  description text null,
  tags text[] null,
  is_verified boolean not null default false,
  verified_at timestamptz null,
  verified_by uuid null,
  expires_at date null,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid null,
  deleted_at timestamptz null,
  domain_type text null,
  subcategory text null,
  source_module text null,
  file_name_original text null,
  file_extension text null,
  file_hash text null,
  version integer not null default 1,
  contract_id text null,
  financial_record_id uuid null,
  clinical_event_id uuid null,
  is_visible_clinical boolean not null default true,
  is_visible_admin boolean not null default true,
  is_confidential boolean not null default false,
  min_role_level text null,
  status text null,
  last_updated_by uuid null,
  last_updated_at timestamptz not null default now(),
  internal_notes text null,
  external_ref text null,
  storage_provider text null,
  storage_path text null,
  original_file_name text null,
  previous_document_id uuid null,
  origin_module text null,
  admin_contract_id text null,
  finance_entry_id uuid null,
  clinical_visit_id uuid null,
  clinical_evolution_id uuid null,
  prescription_id uuid null,
  clinical_visible boolean not null default true,
  admin_fin_visible boolean not null default true,
  min_access_role text null,
  document_status text not null default 'uploaded',
  document_validation_payload jsonb null,
  uploaded_by uuid null,
  deleted_by uuid null,
  signature_type text null,
  signature_date timestamptz null,
  signature_summary text null,
  external_signature_id text null,
  public_notes text null,
  signed_at timestamptz null,
  signers_summary text null,
  uploaded_at timestamptz not null default now(),
  extension text null,
  constraint patient_documents_category_chk check (
    category in ('identity', 'legal', 'financial', 'clinical', 'consent', 'other')
  ),
  constraint patient_documents_document_status_chk check (
    document_status in (
      'uploaded',
      'ai_pending',
      'ai_failed',
      'ai_passed',
      'manual_pending',
      'manual_rejected',
      'manual_approved',
      'revoked',
      'expired'
    )
  )
);

create index patient_documents_tenant_idx on public.patient_documents (tenant_id);
create index patient_documents_patient_idx on public.patient_documents (tenant_id, patient_id);
create index patient_documents_related_object_idx on public.patient_documents (related_object_id);

select app_private.set_updated_at_trigger('public.patient_documents'::regclass);

alter table public.patient_documents enable row level security;

create policy patient_documents_select_tenant on public.patient_documents
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy patient_documents_insert_tenant on public.patient_documents
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_documents_update_tenant on public.patient_documents
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_documents_delete_tenant on public.patient_documents
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create table public.patient_document_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  document_id uuid not null references public.patient_documents(id),
  happened_at timestamptz not null default now(),
  user_id uuid null,
  action text not null,
  details jsonb null,
  created_at timestamptz not null default now()
);

create index patient_document_logs_tenant_idx on public.patient_document_logs (tenant_id);
create index patient_document_logs_document_idx on public.patient_document_logs (document_id);

alter table public.patient_document_logs enable row level security;

create policy patient_document_logs_select_tenant on public.patient_document_logs
  for select
  using (tenant_id = app_private.current_tenant_id());

create policy patient_document_logs_insert_tenant on public.patient_document_logs
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_document_logs_update_tenant on public.patient_document_logs
  for update
  using (tenant_id = app_private.current_tenant_id())
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_document_logs_delete_tenant on public.patient_document_logs
  for delete
  using (tenant_id = app_private.current_tenant_id());

create table public.patient_portal_access (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid not null references public.patients(id),
  related_person_id uuid not null references public.patient_related_persons(id),
  portal_access_level text not null default 'viewer',
  invite_token text not null,
  invite_expires_at timestamptz null,
  invited_at timestamptz not null default now(),
  invited_by uuid null,
  revoked_at timestamptz null,
  revoked_by uuid null,
  last_login_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null,
  updated_by uuid null,
  deleted_at timestamptz null,
  constraint patient_portal_access_level_chk check (
    portal_access_level in ('viewer', 'communicator', 'decision_authorized')
  )
);

create index patient_portal_access_tenant_idx on public.patient_portal_access (tenant_id);
create index patient_portal_access_patient_idx on public.patient_portal_access (tenant_id, patient_id);
create index patient_portal_access_related_idx on public.patient_portal_access (related_person_id);
create unique index patient_portal_access_invite_token_uidx on public.patient_portal_access (invite_token);

select app_private.set_updated_at_trigger('public.patient_portal_access'::regclass);

alter table public.patient_portal_access enable row level security;

create policy patient_portal_access_select_tenant on public.patient_portal_access
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy patient_portal_access_insert_tenant on public.patient_portal_access
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_portal_access_update_tenant on public.patient_portal_access
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_portal_access_delete_tenant on public.patient_portal_access
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create or replace view public.view_patient_legal_guardian_summary as
  select distinct on (pr.patient_id)
    pr.patient_id,
    pr.id as related_person_id,
    pr.name as legal_guardian_name,
    pr.relationship_degree as legal_guardian_relationship,
    pr.phone_primary as legal_guardian_phone,
    true as has_legal_guardian,
    pd.document_status as legal_doc_status,
    greatest(pr.updated_at, coalesce(pd.updated_at, pr.updated_at)) as updated_at
  from public.patient_related_persons pr
  left join lateral (
    select d.document_status, d.updated_at
    from public.patient_documents d
    where d.patient_id = pr.patient_id
      and d.related_object_id = pr.id
      and d.deleted_at is null
    order by d.updated_at desc nulls last
    limit 1
  ) pd on true
  where pr.is_legal_guardian = true
    and pr.deleted_at is null
  order by pr.patient_id, pr.is_main_contact desc, pr.priority_order asc, pr.created_at desc;
