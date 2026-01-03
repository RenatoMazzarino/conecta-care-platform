import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError } from '../aba03/shared';

const patientIdSchema = z.string().uuid();

export type GedImportPathItem = {
  document_id: string | null;
  file_path: string;
};

export async function listGedImportPaths(patientId: string) {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { data, error } = await supabase
    .from('document_import_job_items')
    .select('document_id, file_path')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .not('document_id', 'is', null);

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return (data ?? []) as GedImportPathItem[];
}
