-- Conecta Care | Storage bucket básico para documentos do paciente (ABA03)
-- Contrato: docs/contracts/pacientes/ABA03_REDE_APOIO.md
-- Objetivo: habilitar upload básico local até configurar GED (Aba 05)

do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'patient-documents'
  ) then
    insert into storage.buckets (id, name, public)
    values ('patient-documents', 'patient-documents', false);
  end if;
end $$;

-- Policies básicas para upload/consulta de documentos do paciente
drop policy if exists "patient_documents_objects_insert" on storage.objects;
create policy "patient_documents_objects_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'patient-documents' and owner = auth.uid());

drop policy if exists "patient_documents_objects_select" on storage.objects;
create policy "patient_documents_objects_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'patient-documents' and owner = auth.uid());

drop policy if exists "patient_documents_objects_update" on storage.objects;
create policy "patient_documents_objects_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'patient-documents' and owner = auth.uid())
  with check (bucket_id = 'patient-documents' and owner = auth.uid());

drop policy if exists "patient_documents_objects_delete" on storage.objects;
create policy "patient_documents_objects_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'patient-documents' and owner = auth.uid());
