-- Conecta Care | ABA05 GED (custodia, artifacts, TSA, links seguros, importacao em massa)
-- Contrato: docs/contracts/pacientes/ABA05_GED.md
-- ADR: docs/architecture/decisions/ADR-007-ged-custodia-watermark-time-stamp.md

-- Ajustes em patient_documents para suportar GED (sem quebrar fluxos existentes)
alter table public.patient_documents
  drop constraint if exists patient_documents_document_status_chk;

alter table public.patient_documents
  add constraint patient_documents_document_status_chk check (
    document_status in (
      'uploaded',
      'ai_pending',
      'ai_failed',
      'ai_passed',
      'manual_pending',
      'manual_rejected',
      'manual_approved',
      'revoked',
      'expired',
      'Ativo',
      'Substituido',
      'Arquivado',
      'Rascunho',
      'ExcluidoLogicamente'
    )
  );

alter table public.patient_documents
  add constraint patient_documents_domain_type_chk check (
    domain_type is null
    or domain_type in ('Administrativo', 'Clinico', 'Misto')
  ) not valid;

alter table public.patient_documents
  add constraint patient_documents_source_module_chk check (
    source_module is null
    or source_module in ('Ficha', 'Prontuario', 'Portal', 'Importacao', 'Email')
  ) not valid;

alter table public.patient_documents
  add constraint patient_documents_origin_module_chk check (
    origin_module is null
    or origin_module in (
      'Ficha_Documentos',
      'Ficha_Administrativo',
      'Ficha_Financeiro',
      'Prontuario',
      'PortalPaciente',
      'Importacao',
      'Outro'
    )
  ) not valid;

alter table public.patient_documents
  add constraint patient_documents_status_chk check (
    status is null
    or status in ('Ativo', 'Substituido', 'Arquivado', 'Rascunho')
  ) not valid;

create unique index if not exists patient_documents_tenant_patient_uidx
  on public.patient_documents (tenant_id, patient_id, id);

create index if not exists patient_documents_category_idx
  on public.patient_documents (category);

create index if not exists patient_documents_document_status_idx
  on public.patient_documents (document_status);

create index if not exists patient_documents_origin_module_idx
  on public.patient_documents (origin_module);

create index if not exists patient_documents_uploaded_at_idx
  on public.patient_documents (uploaded_at);

create index if not exists patient_document_logs_document_happened_idx
  on public.patient_document_logs (document_id, happened_at);

-- Document artifacts (impressao/export)
create table public.document_artifacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid not null references public.patients(id),
  document_id uuid not null references public.patient_documents(id),
  document_log_id uuid not null references public.patient_document_logs(id),
  artifact_type text not null default 'print',
  storage_path text not null,
  file_hash text not null,
  file_size_bytes bigint null,
  mime_type text null,
  created_at timestamptz not null default now(),
  created_by uuid null references auth.users(id),
  deleted_at timestamptz null,
  constraint document_artifacts_type_chk check (artifact_type in ('print', 'export', 'render'))
);

create index document_artifacts_tenant_idx on public.document_artifacts (tenant_id);
create index document_artifacts_document_idx on public.document_artifacts (document_id, created_at desc);
create unique index document_artifacts_log_uidx
  on public.document_artifacts (document_log_id)
  where deleted_at is null;

alter table public.document_artifacts enable row level security;

create policy document_artifacts_select_tenant on public.document_artifacts
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy document_artifacts_insert_tenant on public.document_artifacts
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy document_artifacts_update_tenant on public.document_artifacts
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy document_artifacts_delete_tenant on public.document_artifacts
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

-- Carimbo do tempo (TSA SERPRO)
create table public.document_time_stamps (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  document_id uuid not null references public.patient_documents(id),
  document_hash text not null,
  provider text not null default 'SERPRO',
  receipt_payload jsonb not null,
  issued_at timestamptz not null,
  created_at timestamptz not null default now(),
  created_by uuid null references auth.users(id),
  deleted_at timestamptz null,
  constraint document_time_stamps_provider_chk check (provider in ('SERPRO'))
);

create index document_time_stamps_tenant_idx on public.document_time_stamps (tenant_id);
create unique index document_time_stamps_document_uidx
  on public.document_time_stamps (document_id)
  where deleted_at is null;

alter table public.document_time_stamps enable row level security;

create policy document_time_stamps_select_tenant on public.document_time_stamps
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy document_time_stamps_insert_tenant on public.document_time_stamps
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy document_time_stamps_update_tenant on public.document_time_stamps
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy document_time_stamps_delete_tenant on public.document_time_stamps
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

-- Links seguros para original
create table public.document_secure_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  document_id uuid not null references public.patient_documents(id),
  token_hash text not null,
  expires_at timestamptz not null,
  max_downloads integer not null default 1,
  downloads_count integer not null default 0,
  requested_by uuid null references auth.users(id),
  requested_at timestamptz null,
  issued_by uuid null references auth.users(id),
  issued_at timestamptz null,
  last_accessed_at timestamptz null,
  consumed_at timestamptz null,
  consumed_by uuid null references auth.users(id),
  revoked_at timestamptz null,
  revoked_by uuid null references auth.users(id),
  metadata jsonb null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint document_secure_links_downloads_chk check (max_downloads >= 1 and downloads_count >= 0)
);

create index document_secure_links_tenant_idx on public.document_secure_links (tenant_id);
create unique index document_secure_links_token_uidx
  on public.document_secure_links (token_hash)
  where deleted_at is null;
create index document_secure_links_document_idx
  on public.document_secure_links (document_id, expires_at);

alter table public.document_secure_links enable row level security;

create policy document_secure_links_select_tenant on public.document_secure_links
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy document_secure_links_insert_tenant on public.document_secure_links
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy document_secure_links_update_tenant on public.document_secure_links
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy document_secure_links_delete_tenant on public.document_secure_links
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

-- Jobs de importacao (bulk import ZIP)
create table public.document_import_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid null references public.patients(id),
  status text not null default 'queued',
  source text not null default 'bulk_import',
  manifest_type text null,
  manifest_path text null,
  zip_storage_path text not null,
  total_items integer not null default 0,
  processed_items integer not null default 0,
  failed_items integer not null default 0,
  needs_review_items integer not null default 0,
  started_at timestamptz null,
  finished_at timestamptz null,
  created_by uuid null references auth.users(id),
  created_at timestamptz not null default now(),
  metadata jsonb null,
  deleted_at timestamptz null,
  constraint document_import_jobs_status_chk check (
    status in ('queued', 'processing', 'completed', 'completed_with_errors', 'failed')
  ),
  constraint document_import_jobs_source_chk check (source in ('bulk_import')),
  constraint document_import_jobs_manifest_type_chk check (
    manifest_type is null or manifest_type in ('json', 'csv', 'none')
  )
);

create index document_import_jobs_tenant_idx on public.document_import_jobs (tenant_id);
create index document_import_jobs_status_idx on public.document_import_jobs (tenant_id, patient_id, status);
create unique index document_import_jobs_tenant_uidx
  on public.document_import_jobs (tenant_id, id)
  where deleted_at is null;

alter table public.document_import_jobs enable row level security;

create policy document_import_jobs_select_tenant on public.document_import_jobs
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy document_import_jobs_insert_tenant on public.document_import_jobs
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy document_import_jobs_update_tenant on public.document_import_jobs
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy document_import_jobs_delete_tenant on public.document_import_jobs
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

-- Itens do job de importacao
create table public.document_import_job_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  job_id uuid not null references public.document_import_jobs(id),
  patient_id uuid null references public.patients(id),
  file_path text not null,
  original_file_name text null,
  file_size_bytes bigint null,
  mime_type text null,
  checksum_sha256 text null,
  status text not null default 'queued',
  document_id uuid null references public.patient_documents(id),
  attempts integer not null default 0,
  error_code text null,
  error_detail text null,
  manifest_payload jsonb null,
  inferred_taxonomy jsonb null,
  created_at timestamptz not null default now(),
  processed_at timestamptz null,
  deleted_at timestamptz null,
  constraint document_import_job_items_status_chk check (
    status in ('queued', 'processing', 'imported', 'needs_review', 'failed')
  )
);

create index document_import_job_items_job_idx on public.document_import_job_items (job_id, status);
create index document_import_job_items_tenant_patient_idx
  on public.document_import_job_items (tenant_id, patient_id);

alter table public.document_import_job_items enable row level security;

create policy document_import_job_items_select_tenant on public.document_import_job_items
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy document_import_job_items_insert_tenant on public.document_import_job_items
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy document_import_job_items_update_tenant on public.document_import_job_items
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy document_import_job_items_delete_tenant on public.document_import_job_items
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

-- Storage bucket GED (privado)
-- Usa prefixo de tenant_id no storage_path para enforce RLS via policy.
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'ged-documents'
  ) then
    insert into storage.buckets (id, name, public)
    values ('ged-documents', 'ged-documents', false);
  end if;
end $$;

drop policy if exists "ged_documents_objects_insert" on storage.objects;
create policy "ged_documents_objects_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'ged-documents'
    and split_part(name, '/', 1) = app_private.current_tenant_id()::text
  );

drop policy if exists "ged_documents_objects_select" on storage.objects;
create policy "ged_documents_objects_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'ged-documents'
    and split_part(name, '/', 1) = app_private.current_tenant_id()::text
  );

drop policy if exists "ged_documents_objects_update" on storage.objects;
create policy "ged_documents_objects_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'ged-documents'
    and split_part(name, '/', 1) = app_private.current_tenant_id()::text
  )
  with check (
    bucket_id = 'ged-documents'
    and split_part(name, '/', 1) = app_private.current_tenant_id()::text
  );

drop policy if exists "ged_documents_objects_delete" on storage.objects;
create policy "ged_documents_objects_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'ged-documents'
    and split_part(name, '/', 1) = app_private.current_tenant_id()::text
  );
