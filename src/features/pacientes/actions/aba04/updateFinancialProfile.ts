import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  financialProfileSchema,
  type FinancialProfileInput,
  normalizeText,
} from '@/features/pacientes/schemas/aba04AdminFinanceiro.schema';
import { recordPatientTimelineEvent } from './recordPatientTimelineEvent';
import { ensureSession, safeUserId } from './shared';
import { upsertAdminFinancialProfile } from './profileHelpers';

const patientIdSchema = z.string().uuid();

function normalizePayload(payload: FinancialProfileInput) {
  return {
    ...payload,
    insurer_name: normalizeText(payload.insurer_name),
    plan_name: normalizeText(payload.plan_name),
    insurance_card_number: normalizeText(payload.insurance_card_number),
    payment_terms: normalizeText(payload.payment_terms),
    readjustment_index: normalizeText(payload.readjustment_index),
    card_holder_name: normalizeText(payload.card_holder_name),
    receiving_account_info: normalizeText(payload.receiving_account_info),
    financial_notes: normalizeText(payload.financial_notes),
    billing_periodicity: normalizeText(payload.billing_periodicity),
  };
}

export async function updateFinancialProfile(patientId: string, payload: FinancialProfileInput) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsed = financialProfileSchema.parse(payload);
  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: existing } = await supabase
    .from('patient_admin_financial_profile')
    .select('billing_status')
    .eq('patient_id', parsedPatientId.data)
    .maybeSingle();

  const normalized = normalizePayload(parsed);
  const updated = await upsertAdminFinancialProfile(supabase, parsedPatientId.data, normalized, userId);

  if (parsed.billing_status && existing?.billing_status !== parsed.billing_status) {
    await recordPatientTimelineEvent(parsedPatientId.data, {
      event_type: 'billing_status_changed',
      event_category: 'billing',
      title: 'Status de cobranca atualizado',
      payload: {
        from: existing?.billing_status ?? null,
        to: parsed.billing_status,
      },
    });
  }

  return updated;
}
