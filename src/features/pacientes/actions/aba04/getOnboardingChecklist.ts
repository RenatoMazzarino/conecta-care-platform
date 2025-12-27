import { z } from 'zod';
import type { Database } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError } from './shared';

const patientIdSchema = z.string().uuid();

type ChecklistRow = Database['public']['Tables']['patient_onboarding_checklist']['Row'];

export async function getOnboardingChecklist(patientId: string): Promise<ChecklistRow[]> {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { data, error } = await supabase
    .from('patient_onboarding_checklist')
    .select('*')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('item_code', { ascending: true });

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return (data ?? []) as ChecklistRow[];
}
