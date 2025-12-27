import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  adminInfoSchema,
  type AdminInfoInput,
  normalizeText,
  normalizePhone,
} from '@/features/pacientes/schemas/aba04AdminFinanceiro.schema';
import { recordPatientTimelineEvent } from './recordPatientTimelineEvent';
import { ensureSession, safeUserId } from './shared';
import { upsertAdminFinancialProfile } from './profileHelpers';

const patientIdSchema = z.string().uuid();

function normalizePayload(payload: AdminInfoInput) {
  return {
    ...payload,
    administrative_status_reason: normalizeText(payload.administrative_status_reason),
    admission_source: normalizeText(payload.admission_source),
    demand_origin: normalizeText(payload.demand_origin),
    demand_origin_description: normalizeText(payload.demand_origin_description),
    acquisition_channel: normalizeText(payload.acquisition_channel),
    service_package_name: normalizeText(payload.service_package_name),
    service_package_description: normalizeText(payload.service_package_description),
    contract_id: normalizeText(payload.contract_id),
    external_contract_id: normalizeText(payload.external_contract_id),
    contract_status_reason: normalizeText(payload.contract_status_reason),
    authorization_number: normalizeText(payload.authorization_number),
    judicial_case_number: normalizeText(payload.judicial_case_number),
    official_letter_number: normalizeText(payload.official_letter_number),
    cost_center_id: normalizeText(payload.cost_center_id),
    erp_case_code: normalizeText(payload.erp_case_code),
    payer_admin_contact_description: normalizeText(payload.payer_admin_contact_description),
    payer_relation: normalizeText(payload.payer_relation),
    financial_responsible_name: normalizeText(payload.financial_responsible_name),
    financial_responsible_contact: normalizePhone(payload.financial_responsible_contact),
    checklist_notes: normalizeText(payload.checklist_notes),
    admin_notes: normalizeText(payload.admin_notes),
  };
}

export async function updateAdminInfo(patientId: string, payload: AdminInfoInput) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsed = adminInfoSchema.parse(payload);
  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: existing } = await supabase
    .from('patient_admin_financial_profile')
    .select('administrative_status, contract_status, policy_profile_id')
    .eq('patient_id', parsedPatientId.data)
    .maybeSingle();

  let administrativeStatusChangedAt = parsed.administrative_status_changed_at ?? null;

  if (parsed.administrative_status && existing?.administrative_status !== parsed.administrative_status) {
    administrativeStatusChangedAt = new Date().toISOString();
  }

  const normalized = normalizePayload({
    ...parsed,
    administrative_status_changed_at: administrativeStatusChangedAt ?? parsed.administrative_status_changed_at,
  });

  const updated = await upsertAdminFinancialProfile(supabase, parsedPatientId.data, normalized, userId);

  if (parsed.administrative_status && existing?.administrative_status !== parsed.administrative_status) {
    await recordPatientTimelineEvent(parsedPatientId.data, {
      event_type: 'administrative_status_changed',
      event_category: 'status',
      title: 'Status administrativo atualizado',
      payload: {
        from: existing?.administrative_status ?? null,
        to: parsed.administrative_status,
      },
    });
  }

  if (parsed.contract_status && existing?.contract_status !== parsed.contract_status) {
    await recordPatientTimelineEvent(parsedPatientId.data, {
      event_type: 'contract_status_changed',
      event_category: 'status',
      title: 'Status do contrato atualizado',
      payload: {
        from: existing?.contract_status ?? null,
        to: parsed.contract_status,
      },
    });
  }

  if (parsed.policy_profile_id && existing?.policy_profile_id !== parsed.policy_profile_id) {
    await recordPatientTimelineEvent(parsedPatientId.data, {
      event_type: 'policy_profile_changed',
      event_category: 'policy',
      title: 'Perfil de regras aplicado',
      payload: {
        from: existing?.policy_profile_id ?? null,
        to: parsed.policy_profile_id,
      },
    });
  }

  return updated;
}
