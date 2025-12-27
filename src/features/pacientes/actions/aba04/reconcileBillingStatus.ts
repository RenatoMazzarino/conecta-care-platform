import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { resolveBillingIntegrationProvider } from '@/features/pacientes/services/aba04/billingIntegrationProvider';
import { recordPatientTimelineEvent } from './recordPatientTimelineEvent';
import { ensureSession } from './shared';

const patientIdSchema = z.string().uuid();

const billingReconcileSchema = z.object({
  provider: z.string().nullable().optional(),
  reference: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export type BillingReconcileInput = z.infer<typeof billingReconcileSchema>;

export async function reconcileBillingStatus(patientId: string, payload: BillingReconcileInput) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsed = billingReconcileSchema.parse(payload);
  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const provider = resolveBillingIntegrationProvider(parsed.provider);
  const reconcileResult = await provider.reconcileStatus({
    patientId: parsedPatientId.data,
    provider: parsed.provider ?? provider.name,
    reference: parsed.reference ?? null,
  });

  await recordPatientTimelineEvent(parsedPatientId.data, {
    event_type: 'billing_reconciliation_requested',
    event_category: 'billing',
    title: 'Reconciliacao de faturamento solicitada',
    payload: {
      provider: reconcileResult.provider,
      reconciliation_id: reconcileResult.reconciliation_id,
      status: reconcileResult.status,
      reference: parsed.reference ?? null,
      note: parsed.note ?? null,
    },
  });

  return reconcileResult;
}
