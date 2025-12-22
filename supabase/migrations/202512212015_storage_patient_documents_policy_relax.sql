-- Conecta Care | Ajuste policy storage bucket patient-documents (upload basico local)

drop policy if exists "patient_documents_objects_insert" on storage.objects;
create policy "patient_documents_objects_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'patient-documents');
