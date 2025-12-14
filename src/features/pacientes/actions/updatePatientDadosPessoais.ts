import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import {
  patientDadosPessoaisUpdateSchema,
  type PatientDadosPessoaisUpdate,
  type PatientDadosPessoaisUpdateInput,
  normalizeCpf,
  normalizeEmail,
  normalizeFullName,
  normalizeJsonObject,
  normalizePhone,
  normalizeText,
} from '@/features/pacientes/schemas/aba01DadosPessoais';

export type PatientRow = Database['public']['Tables']['patients']['Row'];
type PatientsUpdate = Database['public']['Tables']['patients']['Update'];

const patientIdSchema = z.string().uuid();

export type UpdatePatientDadosPessoaisPayload = PatientDadosPessoaisUpdateInput;

function normalizePayload(payload: PatientDadosPessoaisUpdate): PatientsUpdate {
  return {
    ...payload,
    full_name: payload.full_name ? (normalizeFullName(payload.full_name) ?? undefined) : undefined,
    social_name: normalizeText(payload.social_name),
    nickname: normalizeText(payload.nickname),
    salutation: normalizeText(payload.salutation),
    cpf: normalizeCpf(payload.cpf),
    rg: normalizeText(payload.rg),
    rg_issuer: normalizeText(payload.rg_issuer),
    rg_issuer_state: normalizeText(payload.rg_issuer_state),
    cns: normalizeText(payload.cns),
    national_id: normalizeText(payload.national_id),
    nationality: normalizeText(payload.nationality),
    preferred_language: normalizeText(payload.preferred_language),
    profession: normalizeText(payload.profession),
    birth_place: normalizeText(payload.birth_place),
    naturalness_city: normalizeText(payload.naturalness_city),
    naturalness_state: normalizeText(payload.naturalness_state),
    naturalness_country: normalizeText(payload.naturalness_country),
    mother_name: normalizeText(payload.mother_name),
    father_name: normalizeText(payload.father_name),
    mobile_phone: payload.mobile_phone ? normalizePhone(payload.mobile_phone) ?? undefined : undefined,
    secondary_phone: normalizePhone(payload.secondary_phone),
    secondary_phone_type: normalizeText(payload.secondary_phone_type),
    email: normalizeEmail(payload.email),
    contact_notes: normalizeText(payload.contact_notes),
    doc_validation_method: normalizeText(payload.doc_validation_method),
    doc_validation_source: normalizeText(payload.doc_validation_source),
    marketing_consent_source: normalizeText(payload.marketing_consent_source),
    marketing_consent_history: normalizeText(payload.marketing_consent_history),
    photo_path: normalizeText(payload.photo_path),
    marketing_consent_ip: normalizeText(payload.marketing_consent_ip) as unknown,
    external_ids: normalizeJsonObject(payload.external_ids),
  };
}

export async function updatePatientDadosPessoais(
  patientId: string,
  payload: UpdatePatientDadosPessoaisPayload,
): Promise<PatientRow> {
  const parsedPatientId = patientIdSchema.parse(patientId);
  const parsedPayload = patientDadosPessoaisUpdateSchema.parse(payload);
  const normalizedPayload = normalizePayload(parsedPayload);

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('patients')
    .update(normalizedPayload)
    .eq('id', parsedPatientId)
    .is('deleted_at', null)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Paciente não encontrado');
  }

  return data;
}
