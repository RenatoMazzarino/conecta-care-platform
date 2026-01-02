import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError } from '../aba03/shared';

const patientIdSchema = z.string().uuid();

export async function listGedCustodyOverview(patientId: string) {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const linksPromise = supabase
    .from('document_secure_links')
    .select(
      [
        '*',
        'document:patient_documents!inner(id, title, domain_type, subcategory, category, uploaded_at)',
      ].join(','),
    )
    .eq('document.patient_id', parsed.data)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const artifactsPromise = supabase
    .from('document_artifacts')
    .select(
      [
        '*',
        'document:patient_documents(id, title, domain_type, subcategory, category, uploaded_at)',
        'log:patient_document_logs(id, action, happened_at, user_id, details)',
      ].join(','),
    )
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const [links, artifacts] = await Promise.all([linksPromise, artifactsPromise]);

  for (const result of [links, artifacts]) {
    if (result?.error) {
      if (isTenantMissingError(result.error)) {
        console.error('[patients] tenant_id ausente', result.error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(result.error.message);
    }
  }

  return {
    links: links.data ?? [],
    artifacts: artifacts.data ?? [],
  };
}
