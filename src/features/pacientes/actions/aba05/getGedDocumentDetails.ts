import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError } from '../aba03/shared';

const documentIdSchema = z.string().uuid();

export async function getGedDocumentDetails(documentId: string) {
  const parsed = documentIdSchema.safeParse(documentId);
  if (!parsed.success) {
    throw new Error('ID do documento invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const documentPromise = supabase
    .from('patient_documents')
    .select('*')
    .eq('id', parsed.data)
    .is('deleted_at', null)
    .maybeSingle();

  const logsPromise = supabase
    .from('patient_document_logs')
    .select('*')
    .eq('document_id', parsed.data)
    .order('happened_at', { ascending: false });

  const artifactsPromise = supabase
    .from('document_artifacts')
    .select('*')
    .eq('document_id', parsed.data)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const timestampsPromise = supabase
    .from('document_time_stamps')
    .select('*')
    .eq('document_id', parsed.data)
    .is('deleted_at', null)
    .maybeSingle();

  const secureLinksPromise = supabase
    .from('document_secure_links')
    .select('*')
    .eq('document_id', parsed.data)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  const [document, logs, artifacts, timestamp, secureLinks] = await Promise.all([
    documentPromise,
    logsPromise,
    artifactsPromise,
    timestampsPromise,
    secureLinksPromise,
  ]);

  for (const result of [document, logs, artifacts, timestamp, secureLinks]) {
    if (result?.error) {
      if (isTenantMissingError(result.error)) {
        console.error('[patients] tenant_id ausente', result.error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(result.error.message);
    }
  }

  if (!document.data) {
    throw new Error('Documento nao encontrado');
  }

  return {
    document: document.data,
    logs: logs.data ?? [],
    artifacts: artifacts.data ?? [],
    timeStamp: timestamp.data ?? null,
    secureLinks: secureLinks.data ?? [],
  };
}
