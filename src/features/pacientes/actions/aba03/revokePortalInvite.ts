import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const portalAccessIdSchema = z.string().uuid();

export async function revokePortalInvite(portalAccessId: string) {
  const parsed = portalAccessIdSchema.safeParse(portalAccessId);
  if (!parsed.success) {
    throw new Error('ID do convite invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: portalAccess, error } = await supabase
    .from('patient_portal_access')
    .update({ revoked_at: new Date().toISOString(), revoked_by: userId, updated_by: userId })
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

  if (!portalAccess) {
    throw new Error('Convite nao encontrado');
  }

  const { data: legalDoc } = await supabase
    .from('patient_documents')
    .select('id')
    .eq('patient_id', portalAccess.patient_id)
    .eq('related_object_id', portalAccess.related_person_id)
    .eq('category', 'legal')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (legalDoc?.id) {
    const { error: logError } = await supabase
      .from('patient_document_logs')
      .insert({
        document_id: legalDoc.id,
        action: 'portal_invite_revoked',
        user_id: userId,
        details: {
          portal_access_id: portalAccess.id,
          portal_access_level: portalAccess.portal_access_level,
        },
      });

    if (logError) {
      if (isTenantMissingError(logError)) {
        console.error('[patients] tenant_id ausente', logError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(logError.message);
    }
  }

  return portalAccess;
}
