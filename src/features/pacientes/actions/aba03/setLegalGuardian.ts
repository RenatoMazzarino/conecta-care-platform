import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const patientIdSchema = z.string().uuid();
const relatedPersonIdSchema = z.string().uuid();

export async function setLegalGuardian(patientId: string, relatedPersonId: string) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsedRelated = relatedPersonIdSchema.safeParse(relatedPersonId);
  if (!parsedRelated.success) {
    throw new Error('ID do contato invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { error: clearError } = await supabase
    .from('patient_related_persons')
    .update({ is_legal_guardian: false })
    .eq('patient_id', parsedPatientId.data)
    .is('deleted_at', null)
    .neq('id', parsedRelated.data);

  if (clearError) {
    if (isTenantMissingError(clearError)) {
      console.error('[patients] tenant_id ausente', clearError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(clearError.message);
  }

  const { data, error } = await supabase
    .from('patient_related_persons')
    .update({ is_legal_guardian: true, updated_by: userId })
    .eq('patient_id', parsedPatientId.data)
    .eq('id', parsedRelated.data)
    .is('deleted_at', null)
    .select('*')
    .maybeSingle();

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Contato nao encontrado');
  }

  return data;
}
