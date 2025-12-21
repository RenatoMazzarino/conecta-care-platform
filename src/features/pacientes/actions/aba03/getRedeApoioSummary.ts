import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError } from './shared';

const patientIdSchema = z.string().uuid();

export interface RedeApoioSummary {
  relatedPersons: Record<string, unknown>[];
  careTeamMembers: Record<string, unknown>[];
  legalDocuments: Record<string, unknown>[];
  portalAccess: Record<string, unknown> | null;
  legalGuardianSummary: Record<string, unknown> | null;
}

export async function getRedeApoioSummary(patientId: string): Promise<RedeApoioSummary> {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const relatedPersonsPromise = supabase
    .from('patient_related_persons')
    .select('*')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('priority_order', { ascending: true })
    .order('created_at', { ascending: true });

  const careTeamPromise = supabase
    .from('care_team_members')
    .select('*')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  const legalDocsPromise = supabase
    .from('patient_documents')
    .select('*')
    .eq('patient_id', parsed.data)
    .eq('category', 'legal')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  const portalAccessPromise = supabase
    .from('patient_portal_access')
    .select('*')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('invited_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const guardianSummaryPromise = supabase
    .from('view_patient_legal_guardian_summary')
    .select('*')
    .eq('patient_id', parsed.data)
    .maybeSingle();

  const [relatedPersons, careTeamMembers, legalDocuments, portalAccess, legalGuardianSummary] = await Promise.all([
    relatedPersonsPromise,
    careTeamPromise,
    legalDocsPromise,
    portalAccessPromise,
    guardianSummaryPromise,
  ]);

  for (const result of [relatedPersons, careTeamMembers, legalDocuments, portalAccess, legalGuardianSummary]) {
    if (result?.error) {
      if (isTenantMissingError(result.error)) {
        console.error('[patients] tenant_id ausente', result.error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(result.error.message);
    }
  }

  return {
    relatedPersons: relatedPersons.data ?? [],
    careTeamMembers: careTeamMembers.data ?? [],
    legalDocuments: legalDocuments.data ?? [],
    portalAccess: portalAccess.data ?? null,
    legalGuardianSummary: legalGuardianSummary.data ?? null,
  };
}
