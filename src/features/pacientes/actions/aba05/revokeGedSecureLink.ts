import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from '../aba03/shared';

const linkIdSchema = z.string().uuid();

export async function revokeGedSecureLink(linkId: string) {
  const parsed = linkIdSchema.safeParse(linkId);
  if (!parsed.success) {
    throw new Error('ID do link invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { error } = await supabase
    .from('document_secure_links')
    .update({
      revoked_at: new Date().toISOString(),
      revoked_by: userId,
    })
    .eq('id', parsed.data)
    .is('deleted_at', null);

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return { ok: true };
}
