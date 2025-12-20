import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import {
  patientAddressUpsertSchema,
  patientAddressLogisticsSchema,
  type PatientAddressUpsertInput,
  type PatientAddressLogisticsInput,
  normalizePostalCode,
  normalizeState,
  normalizeText,
  normalizeJsonObject,
} from '@/features/pacientes/schemas/aba02EnderecoLogistica.schema';

export type PatientAddressRow = Database['public']['Tables']['patient_addresses']['Row'];
export type PatientAddressLogisticsRow = Database['public']['Tables']['patient_address_logistics']['Row'];
export type PatientAddressWithLogistics = PatientAddressRow & { logistics: PatientAddressLogisticsRow | null };

const patientIdSchema = z.string().uuid();
const addressIdSchema = z.string().uuid();

const isDevBypassEnabled =
  process.env.NODE_ENV === 'development' && Boolean(process.env.NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN);

function makeActionError(code: string, message: string): Error {
  const error = new Error(message);
  (error as unknown as { code: string }).code = code;
  return error;
}

function isTenantMissingError(error: { code?: string | null; message?: string }) {
  return error.code === '22023' || Boolean(error.message?.includes('tenant_id ausente'));
}

function normalizeAddressPayload(payload: z.infer<typeof patientAddressUpsertSchema>) {
  const postalCode = normalizePostalCode(payload.postal_code) ?? payload.postal_code;
  const state = normalizeState(payload.state) ?? payload.state;
  const addressSource =
    payload.address_source ?? (payload.cep_last_lookup_source === 'brasilapi' ? 'brasilapi' : 'manual');

  return {
    ...payload,
    postal_code: postalCode,
    state,
    address_label: normalizeText(payload.address_label) ?? payload.address_label,
    address_purpose: payload.address_purpose,
    address_source: addressSource,
    street: normalizeText(payload.street) ?? payload.street,
    number: normalizeText(payload.number) ?? payload.number,
    complement: normalizeText(payload.complement),
    neighborhood: normalizeText(payload.neighborhood) ?? payload.neighborhood,
    city: normalizeText(payload.city) ?? payload.city,
    country: normalizeText(payload.country) ?? 'Brasil',
    reference_point: normalizeText(payload.reference_point),
    cep_lookup_payload: normalizeJsonObject(payload.cep_lookup_payload),
    geocode_precision: normalizeText(payload.geocode_precision),
    geocode_place_id: normalizeText(payload.geocode_place_id),
    geocode_payload: normalizeJsonObject(payload.geocode_payload),
    geocode_error_message: normalizeText(payload.geocode_error_message),
    risk_provider: normalizeText(payload.risk_provider),
    risk_payload: normalizeJsonObject(payload.risk_payload),
    risk_error_message: normalizeText(payload.risk_error_message),
  };
}

function normalizeLogisticsPayload(payload: z.infer<typeof patientAddressLogisticsSchema>) {
  return {
    ...payload,
    allowed_visit_hours: normalizeText(payload.allowed_visit_hours),
    travel_notes: normalizeText(payload.travel_notes),
    access_conditions: normalizeText(payload.access_conditions),
    entry_procedure: normalizeText(payload.entry_procedure),
    gate_identification: normalizeText(payload.gate_identification),
    parking: normalizeText(payload.parking),
    team_parking: normalizeText(payload.team_parking),
    external_stairs: normalizeText(payload.external_stairs),
    concierge_contact: normalizeText(payload.concierge_contact),
    condo_name: normalizeText(payload.condo_name),
    block_tower: normalizeText(payload.block_tower),
    unit_number: normalizeText(payload.unit_number),
    backup_power_desc: normalizeText(payload.backup_power_desc),
    pets_description: normalizeText(payload.pets_description),
    ventilation: normalizeText(payload.ventilation),
    lighting_quality: normalizeText(payload.lighting_quality),
    noise_level: normalizeText(payload.noise_level),
    hygiene_conditions: normalizeText(payload.hygiene_conditions),
    power_outlets_desc: normalizeText(payload.power_outlets_desc),
    facade_image_url: normalizeText(payload.facade_image_url),
    general_observations: normalizeText(payload.general_observations),
  };
}

export async function savePatientAddress(
  patientId: string,
  addressId: string | null,
  addressPayload: PatientAddressUpsertInput,
  logisticsPayload: PatientAddressLogisticsInput,
): Promise<PatientAddressWithLogistics> {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  if (addressId) {
    const parsedAddressId = addressIdSchema.safeParse(addressId);
    if (!parsedAddressId.success) {
      throw new Error('ID do endereco invalido (esperado UUID)');
    }
  }

  const parsedAddress = patientAddressUpsertSchema.parse(addressPayload);
  const parsedLogistics = patientAddressLogisticsSchema.parse(logisticsPayload);
  const normalizedAddress = normalizeAddressPayload(parsedAddress);
  const normalizedLogistics = normalizeLogisticsPayload(parsedLogistics);

  const supabase = getSupabaseClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('[auth] getSession failed', sessionError);
  }
  if (!session && !isDevBypassEnabled) {
    throw makeActionError('UNAUTHENTICATED', 'Faca login para acessar');
  }

  const { data: existingPrimary } = await supabase
    .from('patient_addresses')
    .select('id')
    .eq('patient_id', parsedPatientId.data)
    .eq('is_primary', true)
    .is('deleted_at', null)
    .maybeSingle();

  let shouldBePrimary = normalizedAddress.is_primary ?? false;
  const existingPrimaryId = existingPrimary?.id ?? null;
  if (!shouldBePrimary && (!existingPrimaryId || existingPrimaryId === addressId)) {
    shouldBePrimary = true;
  }

  let addressRow: PatientAddressRow | null = null;

  if (addressId) {
    const { data, error } = await supabase
      .from('patient_addresses')
      .update({
        ...normalizedAddress,
        is_primary: shouldBePrimary,
      })
      .eq('id', addressId)
      .is('deleted_at', null)
      .select('*')
      .maybeSingle();

    if (error) {
      if (isTenantMissingError(error)) {
        console.error('[patients] tenant_id ausente', error);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Endereco nao encontrado');
    }

    addressRow = data;
  } else {
    const { data, error } = await supabase
      .from('patient_addresses')
      .insert({
        ...normalizedAddress,
        is_primary: shouldBePrimary,
        patient_id: parsedPatientId.data,
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

    if (!data) {
      throw new Error('Falha ao criar endereco');
    }

    addressRow = data;
  }

  if (shouldBePrimary) {
    await supabase
      .from('patient_addresses')
      .update({ is_primary: false })
      .eq('patient_id', parsedPatientId.data)
      .is('deleted_at', null)
      .neq('id', addressRow.id);
  }

  const { data: logisticsRow, error: logisticsError } = await supabase
    .from('patient_address_logistics')
    .upsert(
      {
        address_id: addressRow.id,
        ...normalizedLogistics,
      },
      { onConflict: 'address_id' },
    )
    .select('*')
    .maybeSingle();

  if (logisticsError) {
    if (isTenantMissingError(logisticsError)) {
      console.error('[patients] tenant_id ausente', logisticsError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(logisticsError.message);
  }

  return {
    ...addressRow,
    logistics: logisticsRow ?? null,
  };
}
