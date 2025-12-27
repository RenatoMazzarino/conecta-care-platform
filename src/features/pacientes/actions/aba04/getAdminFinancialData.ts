import { z } from 'zod';
import type { Database } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { buildPatientContextSnapshot } from '@/features/pacientes/services/aba04/contextSnapshot';
import { ensureSession, isTenantMissingError, makeActionError } from './shared';

type AdminFinancialProfileRow = Database['public']['Tables']['patient_admin_financial_profile']['Row'];
type BillingEntityRow = Database['public']['Tables']['billing_entities']['Row'];
type CarePolicyProfileRow = Database['public']['Tables']['care_policy_profiles']['Row'];
type OnboardingChecklistRow = Database['public']['Tables']['patient_onboarding_checklist']['Row'];
type RelatedPersonRow = Database['public']['Tables']['patient_related_persons']['Row'];

type AdminFinancialData = {
  profile: AdminFinancialProfileRow | null;
  payer: BillingEntityRow | null;
  policyProfile: CarePolicyProfileRow | null;
  checklist: OnboardingChecklistRow[];
  billingEntities: BillingEntityRow[];
  policyProfiles: CarePolicyProfileRow[];
  relatedPersons: RelatedPersonRow[];
  contextSnapshot: ReturnType<typeof buildPatientContextSnapshot> | null;
};

const patientIdSchema = z.string().uuid();

export async function getAdminFinancialData(patientId: string): Promise<AdminFinancialData> {
  const parsed = patientIdSchema.safeParse(patientId);
  if (!parsed.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const profilePromise = supabase
    .from('patient_admin_financial_profile')
    .select('*')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .maybeSingle();

  const checklistPromise = supabase
    .from('patient_onboarding_checklist')
    .select('*')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('item_code', { ascending: true });

  const billingEntitiesPromise = supabase
    .from('billing_entities')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  const policyProfilesPromise = supabase
    .from('care_policy_profiles')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  const relatedPersonsPromise = supabase
    .from('patient_related_persons')
    .select('*')
    .eq('patient_id', parsed.data)
    .is('deleted_at', null)
    .order('priority_order', { ascending: true });

  const [profileResult, checklistResult, billingEntitiesResult, policyProfilesResult, relatedPersonsResult] =
    await Promise.all([profilePromise, checklistPromise, billingEntitiesPromise, policyProfilesPromise, relatedPersonsPromise]);

  for (const result of [profileResult, checklistResult, billingEntitiesResult, policyProfilesResult, relatedPersonsResult]) {
    if (result?.error) {
      if (isTenantMissingError(result.error)) {
        console.error('[patients] tenant_id ausente', result.error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(result.error.message);
    }
  }

  const profile = profileResult.data ?? null;
  const checklist = (checklistResult.data ?? []) as OnboardingChecklistRow[];
  const billingEntities = (billingEntitiesResult.data ?? []) as BillingEntityRow[];
  const policyProfiles = (policyProfilesResult.data ?? []) as CarePolicyProfileRow[];
  const relatedPersons = (relatedPersonsResult.data ?? []) as RelatedPersonRow[];

  let payer: BillingEntityRow | null = null;
  let policyProfile: CarePolicyProfileRow | null = null;

  if (profile?.primary_payer_entity_id) {
    const { data, error } = await supabase
      .from('billing_entities')
      .select('*')
      .eq('id', profile.primary_payer_entity_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      if (isTenantMissingError(error)) {
        console.error('[patients] tenant_id ausente', error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(error.message);
    }

    payer = (data ?? null) as BillingEntityRow | null;
  }

  if (profile?.policy_profile_id) {
    const { data, error } = await supabase
      .from('care_policy_profiles')
      .select('*')
      .eq('id', profile.policy_profile_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      if (isTenantMissingError(error)) {
        console.error('[patients] tenant_id ausente', error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(error.message);
    }

    policyProfile = (data ?? null) as CarePolicyProfileRow | null;
  }

  const contextSnapshot = profile
    ? buildPatientContextSnapshot({
        patientId: parsed.data,
        profile,
        payer,
        policy: policyProfile,
        checklist,
      })
    : null;

  return {
    profile,
    payer,
    policyProfile,
    checklist,
    billingEntities,
    policyProfiles,
    relatedPersons,
    contextSnapshot,
  };
}
