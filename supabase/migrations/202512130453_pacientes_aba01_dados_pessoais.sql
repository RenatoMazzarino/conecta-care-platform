-- CONTRATO: docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null,
  updated_by uuid null,
  deleted_at timestamptz null,
  full_name text not null,
  social_name text null,
  cpf text null,
  rg text null,
  rg_issuer text null,
  date_of_birth date null,
  gender text null,
  civil_status text null,
  birth_place text null,
  nationality text null,
  naturalness text null,
  mother_name text null,
  father_name text null,
  photo_path text null,
  mobile_phone text not null,
  secondary_phone text null,
  phone_emergency text null,
  email text null,
  preferred_contact_method text null,
  observations text null,
  is_active boolean not null default true,
  constraint patients_cpf_format_chk check (cpf is null or cpf ~ '^[0-9]{11}$'),
  constraint patients_mobile_phone_format_chk check (mobile_phone ~ '^[0-9]{10,13}$'),
  constraint patients_secondary_phone_format_chk check (secondary_phone is null or secondary_phone ~ '^[0-9]{10,13}$'),
  constraint patients_phone_emergency_format_chk check (phone_emergency is null or phone_emergency ~ '^[0-9]{10,13}$'),
  constraint patients_email_format_chk check (email is null or email ~* '^[^@]+@[^@]+\\.[^@]+$'),
  constraint patients_date_of_birth_not_future_chk check (date_of_birth is null or date_of_birth <= current_date),
  constraint patients_gender_chk check (gender is null or gender in ('M', 'F', 'Outro')),
  constraint patients_preferred_contact_method_chk check (
    preferred_contact_method is null
    or preferred_contact_method in ('whatsapp', 'phone', 'sms', 'email', 'other')
  ),
  constraint patients_is_active_bool_chk check (is_active in (true, false)),
  constraint patients_civil_status_chk check (
    civil_status is null
    or civil_status in ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')
  )
);

create index patients_tenant_id_idx on public.patients (tenant_id);
create index patients_tenant_full_name_idx on public.patients (tenant_id, lower(full_name));
create unique index patients_tenant_cpf_uidx on public.patients (tenant_id, cpf) where cpf is not null;

select app_private.set_updated_at_trigger('public.patients'::regclass);

alter table public.patients enable row level security;

create policy patients_select_tenant on public.patients
  for select
  using (tenant_id = app_private.current_tenant_id());

create policy patients_insert_tenant on public.patients
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy patients_update_tenant on public.patients
  for update
  using (tenant_id = app_private.current_tenant_id())
  with check (tenant_id = app_private.current_tenant_id());

create policy patients_delete_tenant on public.patients
  for delete
  using (tenant_id = app_private.current_tenant_id());
