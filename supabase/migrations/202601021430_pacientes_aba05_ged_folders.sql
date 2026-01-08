-- Conecta Care | ABA05 GED vNext (pastas persistidas + requisicoes de original + bundles atomicos)
-- Contrato: docs/contracts/pacientes/ABA05_GED.md
-- ADR: docs/architecture/decisions/ADR-007-ged-custodia-watermark-time-stamp.md

-- Pastas persistidas do GED
create table public.patient_ged_folders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid not null references public.patients(id),
  parent_id uuid null references public.patient_ged_folders(id),
  name text not null,
  name_norm text not null,
  path text not null,
  depth integer not null default 0,
  is_system boolean not null default false,
  sort_order integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create unique index if not exists patient_ged_folders_unique_idx
  on public.patient_ged_folders (tenant_id, patient_id, parent_id, name_norm)
  where deleted_at is null;

create index if not exists patient_ged_folders_path_idx
  on public.patient_ged_folders (tenant_id, patient_id, path);

create index if not exists patient_ged_folders_deleted_idx
  on public.patient_ged_folders (tenant_id, patient_id, deleted_at);

select app_private.set_updated_at_trigger('public.patient_ged_folders'::regclass);

create or replace function app_private.set_ged_folder_path()
returns trigger
language plpgsql
as $$
declare
  parent_path text;
  parent_depth integer;
begin
  new.name_norm := lower(new.name);

  if new.parent_id is null then
    new.path := new.id::text;
    new.depth := 0;
  else
    select path, depth
      into parent_path, parent_depth
      from public.patient_ged_folders
     where id = new.parent_id
       and deleted_at is null;

    if parent_path is null then
      raise exception 'parent folder not found';
    end if;

    new.path := parent_path || '.' || new.id::text;
    new.depth := parent_depth + 1;
  end if;

  return new;
end;
$$;

create or replace function app_private.normalize_ged_folder_name()
returns trigger
language plpgsql
as $$
begin
  new.name_norm := lower(new.name);
  return new;
end;
$$;

drop trigger if exists trg_patient_ged_folders_set_path on public.patient_ged_folders;
create trigger trg_patient_ged_folders_set_path
  before insert on public.patient_ged_folders
  for each row
  execute function app_private.set_ged_folder_path();

drop trigger if exists trg_patient_ged_folders_normalize_name on public.patient_ged_folders;
create trigger trg_patient_ged_folders_normalize_name
  before update on public.patient_ged_folders
  for each row
  execute function app_private.normalize_ged_folder_name();

alter table public.patient_ged_folders enable row level security;

create policy patient_ged_folders_select_tenant on public.patient_ged_folders
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy patient_ged_folders_insert_tenant on public.patient_ged_folders
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy patient_ged_folders_update_tenant on public.patient_ged_folders
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null and is_system = false)
  with check (tenant_id = app_private.current_tenant_id() and is_system = false);

create policy patient_ged_folders_delete_tenant on public.patient_ged_folders
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null and is_system = false);

-- Move de pastas (subarvore)
create or replace function public.move_ged_folder(folder_id uuid, new_parent_id uuid)
returns void
language plpgsql
as $$
declare
  old_path text;
  old_depth integer;
  new_path text;
  new_depth integer;
  parent_path text;
  parent_depth integer;
  folder_tenant uuid;
  folder_patient uuid;
  folder_is_system boolean;
  parent_tenant uuid;
  parent_patient uuid;
begin
  select path, depth, tenant_id, patient_id, is_system
    into old_path, old_depth, folder_tenant, folder_patient, folder_is_system
    from public.patient_ged_folders
   where id = folder_id
     and deleted_at is null;

  if not found then
    raise exception 'folder not found';
  end if;

  if folder_is_system then
    raise exception 'system folders cannot be moved';
  end if;

  if new_parent_id is null then
    new_path := folder_id::text;
    new_depth := 0;
  else
    select path, depth, tenant_id, patient_id
      into parent_path, parent_depth, parent_tenant, parent_patient
      from public.patient_ged_folders
     where id = new_parent_id
       and deleted_at is null;

    if parent_path is null then
      raise exception 'parent folder not found';
    end if;

    if parent_tenant <> folder_tenant or parent_patient <> folder_patient then
      raise exception 'folder tenant mismatch';
    end if;

    if parent_path = old_path or parent_path like old_path || '.%' then
      raise exception 'cannot move folder into its subtree';
    end if;

    new_path := parent_path || '.' || folder_id::text;
    new_depth := parent_depth + 1;
  end if;

  update public.patient_ged_folders
     set parent_id = new_parent_id,
         path = new_path,
         depth = new_depth,
         updated_at = now()
   where id = folder_id;

  update public.patient_ged_folders
     set path = new_path || substring(path from length(old_path) + 1),
         depth = new_depth + (depth - old_depth),
         updated_at = now()
   where path like old_path || '.%'
     and deleted_at is null;
end;
$$;

-- Vinculo de pasta no documento
alter table public.patient_documents
  add column if not exists folder_id uuid null references public.patient_ged_folders(id);

create index if not exists patient_documents_folder_idx
  on public.patient_documents (tenant_id, patient_id, folder_id);

-- Requisicoes de originais (mae + itens)
create table public.ged_original_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  patient_id uuid not null references public.patients(id),
  requested_by_user_id uuid not null references auth.users(id),
  status text not null default 'open',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint ged_original_requests_status_chk check (
    status in ('open', 'in_progress', 'completed', 'expired', 'revoked')
  )
);

create index if not exists ged_original_requests_tenant_idx
  on public.ged_original_requests (tenant_id, patient_id, status, created_at);

select app_private.set_updated_at_trigger('public.ged_original_requests'::regclass);

alter table public.ged_original_requests enable row level security;

create policy ged_original_requests_select_tenant on public.ged_original_requests
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy ged_original_requests_insert_tenant on public.ged_original_requests
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy ged_original_requests_update_tenant on public.ged_original_requests
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy ged_original_requests_delete_tenant on public.ged_original_requests
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create table public.ged_original_request_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null default app_private.current_tenant_id(),
  request_id uuid not null references public.ged_original_requests(id),
  document_id uuid not null references public.patient_documents(id),
  secure_link_id uuid null references public.document_secure_links(id),
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint ged_original_request_items_status_chk check (
    status in ('open', 'issued', 'consumed', 'expired', 'revoked')
  )
);

create index if not exists ged_original_request_items_idx
  on public.ged_original_request_items (request_id, status);

select app_private.set_updated_at_trigger('public.ged_original_request_items'::regclass);

alter table public.ged_original_request_items enable row level security;

create policy ged_original_request_items_select_tenant on public.ged_original_request_items
  for select
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

create policy ged_original_request_items_insert_tenant on public.ged_original_request_items
  for insert
  with check (tenant_id = app_private.current_tenant_id());

create policy ged_original_request_items_update_tenant on public.ged_original_request_items
  for update
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null)
  with check (tenant_id = app_private.current_tenant_id());

create policy ged_original_request_items_delete_tenant on public.ged_original_request_items
  for delete
  using (tenant_id = app_private.current_tenant_id() and deleted_at is null);

-- Bundles atomicos (evitar documentos/artefatos fantasmas)
create or replace function public.create_ged_document_bundle(
  p_document_id uuid,
  p_patient_id uuid,
  p_folder_id uuid,
  p_file_name text,
  p_storage_path text,
  p_storage_provider text,
  p_file_size_bytes bigint,
  p_mime_type text,
  p_title text,
  p_description text,
  p_category text,
  p_doc_type text,
  p_doc_domain text,
  p_doc_source text,
  p_doc_origin text,
  p_tags text[],
  p_file_hash text,
  p_file_extension text,
  p_extension text,
  p_original_file_name text,
  p_uploaded_by uuid,
  p_created_by uuid,
  p_tsa_provider text,
  p_tsa_payload jsonb,
  p_tsa_issued_at timestamptz,
  p_document_status text default 'Ativo',
  p_status text default 'Ativo',
  p_document_validation_payload jsonb default null,
  p_log_action text default 'upload',
  p_log_details jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_document_id uuid;
begin
  insert into public.patient_documents (
    id,
    patient_id,
    folder_id,
    file_name,
    file_path,
    storage_path,
    storage_provider,
    file_size_bytes,
    mime_type,
    title,
    description,
    category,
    subcategory,
    domain_type,
    source_module,
    origin_module,
    tags,
    file_hash,
    file_extension,
    extension,
    original_file_name,
    file_name_original,
    document_status,
    status,
    document_validation_payload,
    uploaded_by,
    created_by
  ) values (
    p_document_id,
    p_patient_id,
    p_folder_id,
    p_file_name,
    p_storage_path,
    p_storage_path,
    p_storage_provider,
    p_file_size_bytes,
    p_mime_type,
    p_title,
    p_description,
    p_category,
    p_doc_type,
    p_doc_domain,
    p_doc_source,
    p_doc_origin,
    p_tags,
    p_file_hash,
    p_file_extension,
    p_extension,
    p_original_file_name,
    p_original_file_name,
    p_document_status,
    p_status,
    p_document_validation_payload,
    p_uploaded_by,
    p_created_by
  ) returning id into v_document_id;

  insert into public.document_time_stamps (
    document_id,
    document_hash,
    provider,
    receipt_payload,
    issued_at,
    created_by
  ) values (
    v_document_id,
    p_file_hash,
    p_tsa_provider,
    p_tsa_payload,
    p_tsa_issued_at,
    p_created_by
  );

  insert into public.patient_document_logs (
    document_id,
    action,
    user_id,
    details
  ) values (
    v_document_id,
    p_log_action,
    p_created_by,
    p_log_details
  );

  return v_document_id;
end;
$$;

create or replace function public.create_ged_artifact_bundle(
  p_document_id uuid,
  p_patient_id uuid,
  p_artifact_id uuid,
  p_artifact_type text,
  p_storage_path text,
  p_file_hash text,
  p_file_size_bytes bigint,
  p_mime_type text,
  p_created_by uuid,
  p_log_action text,
  p_log_details jsonb
)
returns table (artifact_id uuid, log_id uuid)
language plpgsql
as $$
declare
  v_log_id uuid;
begin
  insert into public.patient_document_logs (
    document_id,
    action,
    user_id,
    details
  ) values (
    p_document_id,
    p_log_action,
    p_created_by,
    p_log_details
  ) returning id into v_log_id;

  insert into public.document_artifacts (
    id,
    patient_id,
    document_id,
    document_log_id,
    artifact_type,
    storage_path,
    file_hash,
    file_size_bytes,
    mime_type,
    created_by
  ) values (
    p_artifact_id,
    p_patient_id,
    p_document_id,
    v_log_id,
    p_artifact_type,
    p_storage_path,
    p_file_hash,
    p_file_size_bytes,
    p_mime_type,
    p_created_by
  );

  return query select p_artifact_id, v_log_id;
end;
$$;
