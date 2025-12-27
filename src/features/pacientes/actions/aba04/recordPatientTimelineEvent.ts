import { z } from 'zod';
import type { Json } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const patientIdSchema = z.string().uuid();

const eventSchema = z.object({
  event_type: z.string().min(1),
  event_category: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  tone: z.enum(['default', 'success', 'warning', 'critical']).optional(),
  payload: z.custom<Json | null>().optional(),
  event_time: z.string().optional(),
});

export type PatientTimelineEventInput = z.infer<typeof eventSchema>;

export async function recordPatientTimelineEvent(patientId: string, payload: PatientTimelineEventInput) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsed = eventSchema.parse(payload);

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data, error } = await supabase
    .from('patient_timeline_events')
    .insert({
      patient_id: parsedPatientId.data,
      event_type: parsed.event_type,
      event_category: parsed.event_category ?? null,
      title: parsed.title ?? null,
      description: parsed.description ?? null,
      tone: parsed.tone ?? 'default',
      payload: (parsed.payload ?? null) as Json | null,
      event_time: parsed.event_time ?? undefined,
      created_by: userId,
      updated_by: userId,
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

  return data ?? null;
}
