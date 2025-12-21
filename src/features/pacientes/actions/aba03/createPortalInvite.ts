import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { portalAccessSchema, type PortalAccessInput } from '@/features/pacientes/schemas/aba03RedeApoio.schema';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const patientIdSchema = z.string().uuid();

const defaultExpiryHours = 72;

function buildToken() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function hashToken(token: string) {
  if (!globalThis.crypto?.subtle) return token;
  const data = new TextEncoder().encode(token);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

function resolveExpiry(input?: string | null) {
  if (input) return new Date(input);
  const now = new Date();
  now.setHours(now.getHours() + defaultExpiryHours);
  return now;
}

export async function createPortalInvite(patientId: string, payload: PortalAccessInput) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsed = portalAccessSchema.parse(payload);

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: legalDoc, error: legalDocError } = await supabase
    .from('patient_documents')
    .select('id, document_status, related_object_id')
    .eq('patient_id', parsedPatientId.data)
    .eq('related_object_id', parsed.related_person_id)
    .eq('category', 'legal')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (legalDocError) {
    if (isTenantMissingError(legalDocError)) {
      console.error('[patients] tenant_id ausente', legalDocError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(legalDocError.message);
  }

  if (!legalDoc || legalDoc.document_status !== 'manual_approved') {
    throw new Error('Responsavel legal nao esta validado (manual_approved)');
  }

  const token = buildToken();
  const tokenHash = await hashToken(token);
  const expiresAt = resolveExpiry(parsed.invite_expires_at ?? null);

  await supabase
    .from('patient_portal_access')
    .update({ revoked_at: new Date().toISOString(), revoked_by: userId, updated_by: userId })
    .eq('patient_id', parsedPatientId.data)
    .eq('related_person_id', parsed.related_person_id)
    .is('deleted_at', null)
    .is('revoked_at', null);

  const { data: portalAccess, error } = await supabase
    .from('patient_portal_access')
    .insert({
      patient_id: parsedPatientId.data,
      related_person_id: parsed.related_person_id,
      portal_access_level: parsed.portal_access_level,
      invite_token: tokenHash,
      invite_expires_at: expiresAt.toISOString(),
      invited_by: userId,
      created_by: userId,
    })
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
    throw new Error('Falha ao criar convite');
  }

  const { data: log, error: logError } = await supabase
    .from('patient_document_logs')
    .insert({
      document_id: legalDoc.id,
      action: 'portal_invite_created',
      user_id: userId,
      details: {
        portal_access_id: portalAccess.id,
        portal_access_level: portalAccess.portal_access_level,
        invite_expires_at: portalAccess.invite_expires_at,
      },
    })
    .select('*')
    .maybeSingle();

  if (logError) {
    if (isTenantMissingError(logError)) {
      console.error('[patients] tenant_id ausente', logError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(logError.message);
  }

  return {
    portalAccess,
    token,
    expiresAt: portalAccess.invite_expires_at,
    log,
  };
}
