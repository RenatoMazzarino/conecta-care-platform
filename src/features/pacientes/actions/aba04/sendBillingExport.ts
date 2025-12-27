import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { resolveBillingIntegrationProvider } from '@/features/pacientes/services/aba04/billingIntegrationProvider';
import { recordPatientTimelineEvent } from './recordPatientTimelineEvent';
import { ensureSession } from './shared';

const patientIdSchema = z.string().uuid();

const billingExportSchema = z.object({
  provider: z.string().nullable().optional(),
  reference: z.string().nullable().optional(),
  period_start: z.string().nullable().optional(),
  period_end: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export type BillingExportInput = z.infer<typeof billingExportSchema>;

export async function sendBillingExport(patientId: string, payload: BillingExportInput) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsed = billingExportSchema.parse(payload);
  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const provider = resolveBillingIntegrationProvider(parsed.provider);
  const exportResult = await provider.sendExport({
    patientId: parsedPatientId.data,
    provider: parsed.provider ?? provider.name,
    reference: parsed.reference ?? null,
  });

  await recordPatientTimelineEvent(parsedPatientId.data, {
    event_type: 'billing_export_requested',
    event_category: 'billing',
    title: 'Exportacao de faturamento solicitada',
    payload: {
      provider: exportResult.provider,
      export_id: exportResult.export_id,
      status: exportResult.status,
      reference: parsed.reference ?? null,
      period_start: parsed.period_start ?? null,
      period_end: parsed.period_end ?? null,
      note: parsed.note ?? null,
    },
  });

  return exportResult;
}
