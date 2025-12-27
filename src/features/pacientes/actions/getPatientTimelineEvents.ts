import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError } from './aba03/shared';

const patientIdSchema = z.string().uuid();

export async function getPatientTimelineEvents(patientId: string) {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { data, error } = await supabase
    .from('patient_timeline_events')
    .select('*')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('event_time', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return data ?? [];
}
