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

  const { data: requestItems } = await supabase
    .from('ged_original_request_items')
    .update({ status: 'revoked' })
    .eq('secure_link_id', parsed.data)
    .is('deleted_at', null)
    .select('request_id');

  const requestId = requestItems?.[0]?.request_id ?? null;
  if (requestId) {
    const { data: items, error: statusError } = await supabase
      .from('ged_original_request_items')
      .select('status')
      .eq('request_id', requestId)
      .is('deleted_at', null);

    if (!statusError && items && items.length > 0) {
      const statuses = items.map((item) => item.status);
      const allConsumed = statuses.every((status) => status === 'consumed');
      const allRevoked = statuses.every((status) => status === 'revoked');
      const allExpired = statuses.every((status) => status === 'expired');

      let nextStatus = 'in_progress';
      if (allConsumed) nextStatus = 'completed';
      else if (allRevoked) nextStatus = 'revoked';
      else if (allExpired) nextStatus = 'expired';

      await supabase
        .from('ged_original_requests')
        .update({ status: nextStatus })
        .eq('id', requestId)
        .is('deleted_at', null);
    }
  }

  return { ok: true };
}
