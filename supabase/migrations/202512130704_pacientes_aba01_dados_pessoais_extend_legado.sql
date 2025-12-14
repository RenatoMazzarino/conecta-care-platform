-- CONTRATO: docs/contracts/pacientes/ABA01_DADOS_PESSOAIS.md
-- Extensão da tabela public.patients para compatibilidade com o legado.
-- Regra: não reescreve migrations já aplicadas; apenas evolui o schema via ALTER TABLE.

alter table public.patients
  rename column birth_place to place_of_birth;

alter table public.patients
  rename column naturalness to place_of_birth_city;

alter table public.patients
  rename column photo_path to photo_url;

alter table public.patients
  rename column preferred_contact_method to pref_contact_method;

alter table public.patients
  rename column observations to contact_notes;

alter table public.patients
  drop column phone_emergency;

alter table public.patients
  add column nickname text null,
  add column salutation text null,
  add column pronouns text null,
  add column gender_identity text null,
  add column preferred_language text null default 'Português',
  add column education_level text null,
  add column profession text null,
  add column race_color text null,
  add column is_pcd boolean not null default false,
  add column place_of_birth_state text null,
  add column place_of_birth_country text null default 'Brasil',
  add column national_id text null,
  add column cns text null,
  add column rg_issuer_state text null,
  add column rg_issued_at date null,
  add column cpf_status text null default 'valid',
  add column doc_validation_status text null default 'Pendente',
  add column doc_validation_method text null,
  add column doc_validation_source text null,
  add column doc_validated_at timestamptz null,
  add column doc_validated_by uuid null,
  add column email_verified boolean not null default false,
  add column mobile_phone_verified boolean not null default false,
  add column secondary_phone_type text null,
  add column contact_time_preference text null,
  add column communication_preferences jsonb not null default '{"sms": true, "email": true, "whatsapp": true}'::jsonb,
  add column accept_email boolean not null default true,
  add column accept_sms boolean not null default true,
  add column block_marketing boolean not null default false,
  add column marketing_consent_status text null default 'pending',
  add column marketing_consented_at timestamptz null,
  add column marketing_consent_source text null,
  add column marketing_consent_ip inet null,
  add column marketing_consent_history text null,
  add column photo_consent boolean not null default false,
  add column photo_consent_date timestamptz null,
  add column primary_contractor_id uuid null,
  add column external_ids jsonb null,
  add column onboarding_step integer not null default 1;

alter table public.patients
  alter column nationality set default 'Brasileira',
  alter column is_active set default false;

alter table public.patients
  add column record_status text null;

update public.patients
set record_status = case when is_active then 'active' else 'draft' end
where record_status is null;

alter table public.patients
  alter column record_status set not null,
  alter column record_status set default 'draft';

alter table public.patients
  add constraint patients_pronouns_check
    check (pronouns is null or pronouns in ('Ele/Dele', 'Ela/Dela', 'Elu/Delu', 'Outro')),
  add constraint patients_gender_identity_check
    check (
      gender_identity is null
      or gender_identity in ('Cisgenero', 'Transgenero', 'Nao Binario', 'Outro', 'Prefiro nao informar')
    ),
  add constraint patients_education_level_check
    check (
      education_level is null
      or education_level in (
        'Nao Alfabetizado',
        'Fundamental Incompleto',
        'Fundamental Completo',
        'Medio Incompleto',
        'Medio Completo',
        'Superior Incompleto',
        'Superior Completo',
        'Pos Graduacao',
        'Mestrado/Doutorado',
        'Nao Informado'
      )
    ),
  add constraint patients_race_color_check
    check (
      race_color is null
      or race_color in ('Branca', 'Preta', 'Parda', 'Amarela', 'Indigena', 'Nao declarado')
    ),
  add constraint patients_contact_time_preference_check
    check (
      contact_time_preference is null
      or contact_time_preference in ('Manha', 'Tarde', 'Noite', 'Comercial', 'Qualquer Horario')
    ),
  add constraint patients_cpf_status_check
    check (cpf_status is null or cpf_status in ('valid', 'invalid', 'unknown')),
  add constraint patients_doc_validation_status_check
    check (
      doc_validation_status is null
      or doc_validation_status in ('Pendente', 'Nao Validado', 'Validado', 'Inconsistente', 'Em Analise')
    ),
  add constraint patients_marketing_consent_status_check
    check (
      marketing_consent_status is null
      or marketing_consent_status in ('pending', 'accepted', 'rejected')
    ),
  add constraint patients_marketing_consent_source_check
    check (
      marketing_consent_source is null
      or marketing_consent_source in (
        'Portal Administrativo (Edicao Manual)',
        'Formulario Web',
        'Assinatura Digital',
        'Importacao de Legado',
        'Solicitacao Verbal'
      )
    ),
  add constraint patients_rg_issuer_state_check
    check (rg_issuer_state is null or rg_issuer_state ~* '^[A-Z]{2}$'),
  add constraint patients_photo_consent_check
    check (photo_consent in (true, false)),
  add constraint patients_record_status_check
    check (
      record_status in ('draft', 'onboarding', 'active', 'inactive', 'deceased', 'discharged', 'pending_financial')
    ),
  add constraint patients_record_status_phase_check
    check (
      (is_active = false and record_status in ('draft', 'onboarding'))
      or (
        is_active = true
        and record_status in ('active', 'inactive', 'deceased', 'discharged', 'pending_financial')
      )
    );

create index patients_tenant_record_status_idx on public.patients (tenant_id, record_status);
create index patients_tenant_onboarding_step_idx on public.patients (tenant_id, onboarding_step);

alter policy patients_select_tenant on public.patients
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

alter policy patients_update_tenant on public.patients
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

alter policy patients_delete_tenant on public.patients
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);
