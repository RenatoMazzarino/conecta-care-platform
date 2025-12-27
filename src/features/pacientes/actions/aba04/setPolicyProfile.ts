import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { recordPatientTimelineEvent } from './recordPatientTimelineEvent';
import { ensureSession, safeUserId } from './shared';
import { upsertAdminFinancialProfile } from './profileHelpers';

const patientIdSchema = z.string().uuid();
const profileIdSchema = z.string().uuid();

export async function setPolicyProfile(patientId: string, profileId: string) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsedProfileId = profileIdSchema.safeParse(profileId);
  if (!parsedProfileId.success) {
    throw new Error('ID do perfil invalido');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const updated = await upsertAdminFinancialProfile(
    supabase,
    parsedPatientId.data,
    { policy_profile_id: parsedProfileId.data },
    userId,
  );

  await recordPatientTimelineEvent(parsedPatientId.data, {
    event_type: 'policy_profile_changed',
    event_category: 'policy',
    title: 'Perfil de regras aplicado',
    payload: {
      policy_profile_id: parsedProfileId.data,
    },
  });

  return updated;
}
