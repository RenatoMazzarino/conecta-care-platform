import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const personIdSchema = z.string().uuid();

export async function deleteRelatedPerson(personId: string) {
  const parsed = personIdSchema.safeParse(personId);
  if (!parsed.success) {
    throw new Error('ID do contato invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data, error } = await supabase
    .from('patient_related_persons')
    .update({
      deleted_at: new Date().toISOString(),
      updated_by: userId,
      is_legal_guardian: false,
    })
    .eq('id', parsed.data)
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
