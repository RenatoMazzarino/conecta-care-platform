import type { Database } from '@/types/supabase';
import { resolvePolicyRules } from './policyEngine';

type AdminFinancialProfileRow = Database['public']['Tables']['patient_admin_financial_profile']['Row'];
type BillingEntityRow = Database['public']['Tables']['billing_entities']['Row'];
type CarePolicyProfileRow = Database['public']['Tables']['care_policy_profiles']['Row'];
type OnboardingChecklistRow = Database['public']['Tables']['patient_onboarding_checklist']['Row'];

export interface PatientContextSnapshot {
  patient_id: string;
  statuses: {
    contract_status: string | null;
    administrative_status: string | null;
    billing_status: string | null;
  };
  payer: {
    id: string | null;
    kind: string | null;
    name: string | null;
    doc_type: string | null;
    doc_number: string | null;
  };
  policy_profile: {
    id: string | null;
    name: string | null;
    is_default: boolean | null;
    version: number | null;
  };
  checklist: {
    complete: boolean;
    items: Array<{ item_code: string; is_completed: boolean; document_id: string | null }>;
  };
  policy_rules: ReturnType<typeof resolvePolicyRules> | null;
  generated_at: string;
}

export function buildPatientContextSnapshot(params: {
  patientId: string;
  profile: AdminFinancialProfileRow | null;
  payer: BillingEntityRow | null;
  policy: CarePolicyProfileRow | null;
  checklist: OnboardingChecklistRow[];
}): PatientContextSnapshot {
  const { patientId, profile, payer, policy, checklist } = params;

  const statuses = {
    contract_status: profile?.contract_status ?? null,
    administrative_status: profile?.administrative_status ?? null,
    billing_status: profile?.billing_status ?? null,
  };

  return {
    patient_id: patientId,
    statuses,
    payer: {
      id: payer?.id ?? null,
      kind: payer?.kind ?? null,
      name: payer?.name ?? null,
      doc_type: payer?.doc_type ?? null,
      doc_number: payer?.doc_number ?? null,
    },
    policy_profile: {
      id: policy?.id ?? null,
      name: policy?.name ?? null,
      is_default: policy?.is_default ?? null,
      version: policy?.version ?? null,
    },
    checklist: {
      complete: Boolean(profile?.checklist_complete),
      items: checklist.map((item) => ({
        item_code: item.item_code,
        is_completed: Boolean(item.is_completed),
        document_id: item.document_id ?? null,
      })),
    },
    policy_rules: policy ? resolvePolicyRules(policy.rule_set) : null,
    generated_at: new Date().toISOString(),
  };
}
