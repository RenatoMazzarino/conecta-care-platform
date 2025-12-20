import { z } from 'zod';
import type { Json } from '@/types/supabase';

export const addressPurposeOptions = ['atendimento', 'cobranca', 'entrega', 'outro'] as const;
export const addressSourceOptions = ['manual', 'brasilapi', 'outro'] as const;
export const cepLookupSourceOptions = ['brasilapi', 'manual'] as const;
export const geocodeStatusOptions = ['pending', 'success', 'failed', 'not_configured'] as const;
export const geocodeProviderOptions = ['google', 'mapbox', 'osm', 'none'] as const;
export const riskStatusOptions = ['success', 'failed', 'not_configured'] as const;
export const riskLevelOptions = ['low', 'medium', 'high', 'unknown'] as const;

export const ambulanceAccessOptions = ['Total', 'Parcial', 'Dificil', 'Nao_acessa', 'Nao_informado'] as const;
export const nightAccessRiskOptions = ['Baixo', 'Medio', 'Alto', 'Nao_avaliado'] as const;
export const areaRiskTypeOptions = ['Urbana', 'Rural', 'Periurbana', 'Comunidade', 'Risco', 'Nao_informada'] as const;
export const zoneTypeOptions = ['Urbana', 'Rural', 'Periurbana', 'Comunidade', 'Risco', 'Nao_informada'] as const;
export const streetAccessTypeOptions = ['Rua_larga', 'Rua_estreita', 'Rua_sem_saida', 'Viela', 'Nao_informado'] as const;
export const elevatorStatusOptions = ['Nao_tem', 'Tem_nao_comporta_maca', 'Tem_comporta_maca', 'Nao_informado'] as const;
export const wheelchairAccessOptions = ['Livre', 'Com_restricao', 'Incompativel', 'Nao_avaliado'] as const;
export const propertyTypeOptions = [
  'Casa',
  'Apartamento',
  'Chacara_Sitio',
  'ILPI',
  'Pensao',
  'Comercial',
  'Outro',
  'Nao_informado',
] as const;
export const bedTypeOptions = ['Hospitalar', 'Articulada', 'Comum', 'Colchao_no_chao', 'Outro', 'Nao_informado'] as const;
export const mattressTypeOptions = ['Pneumatico', 'Viscoelastico', 'Espuma_comum', 'Mola', 'Outro', 'Nao_informado'] as const;
export const backupPowerSourceOptions = ['Nenhuma', 'Gerador', 'Nobreak', 'Outros', 'Nao_informado'] as const;
export const electricVoltageOptions = ['110', '220', 'Bivolt', 'Nao_informada'] as const;
export const animalsBehaviorOptions = ['Doces', 'Bravos', 'Necessitam_contencao', 'Nao_informado'] as const;
export const waterSourceOptions = ['Rede_publica', 'Poco_artesiano', 'Cisterna', 'Outro', 'Nao_informado'] as const;
export const equipmentSpaceOptions = ['Adequado', 'Restrito', 'Critico', 'Nao_avaliado'] as const;
export const cellSignalQualityOptions = ['Bom', 'Razoavel', 'Ruim', 'Nao_informado'] as const;

function emptyStringToNull(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : value;
}

function trimmedString(max: number, label: string) {
  return z
    .string({ invalid_type_error: `${label} invalido` })
    .trim()
    .max(max, { message: `${label} muito longo` });
}

const postalCodeSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\D/g, '');
  },
  z.string().regex(/^\d{8}$/, { message: 'CEP invalido' }),
);

const stateSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    return value.trim().toUpperCase();
  },
  z.string().regex(/^[A-Z]{2}$/, { message: 'UF invalida' }),
);

const latitudeSchema = z
  .number({ invalid_type_error: 'Latitude invalida' })
  .min(-90, { message: 'Latitude invalida' })
  .max(90, { message: 'Latitude invalida' });

const longitudeSchema = z
  .number({ invalid_type_error: 'Longitude invalida' })
  .min(-180, { message: 'Longitude invalida' })
  .max(180, { message: 'Longitude invalida' });

export const patientAddressUpsertSchema = z.object({
  address_label: trimmedString(120, 'Identificador do endereco'),
  address_purpose: z.enum(addressPurposeOptions, { message: 'Finalidade invalida' }),
  is_primary: z.boolean().optional(),
  postal_code: postalCodeSchema,
  street: trimmedString(200, 'Logradouro'),
  number: trimmedString(20, 'Numero'),
  complement: z.preprocess(emptyStringToNull, trimmedString(120, 'Complemento').nullable().optional()),
  neighborhood: trimmedString(120, 'Bairro'),
  city: trimmedString(120, 'Cidade'),
  state: stateSchema,
  country: z.preprocess(emptyStringToNull, trimmedString(80, 'Pais').nullable().optional()),
  reference_point: z.preprocess(emptyStringToNull, trimmedString(200, 'Referencia').nullable().optional()),
  address_source: z.preprocess(
    emptyStringToNull,
    z.enum(addressSourceOptions, { message: 'Origem do CEP invalida' }).optional(),
  ),
  latitude: z.preprocess(emptyStringToNull, latitudeSchema.nullable().optional()),
  longitude: z.preprocess(emptyStringToNull, longitudeSchema.nullable().optional()),
  cep_last_lookup_at: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  cep_last_lookup_source: z.preprocess(
    emptyStringToNull,
    z.enum(cepLookupSourceOptions, { message: 'Origem da consulta invalida' }).nullable().optional(),
  ),
  cep_lookup_payload: z.custom<Json | null>().optional(),
  geocode_status: z.preprocess(
    emptyStringToNull,
    z.enum(geocodeStatusOptions, { message: 'Status geocode invalido' }).nullable().optional(),
  ),
  geocode_provider: z.preprocess(
    emptyStringToNull,
    z.enum(geocodeProviderOptions, { message: 'Provider geocode invalido' }).nullable().optional(),
  ),
  geocode_refreshed_at: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  geocode_cache_until: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  geocode_precision: z.preprocess(emptyStringToNull, trimmedString(80, 'Precisao').nullable().optional()),
  geocode_place_id: z.preprocess(emptyStringToNull, trimmedString(120, 'Place ID').nullable().optional()),
  geocode_payload: z.custom<Json | null>().optional(),
  geocode_error_message: z.preprocess(emptyStringToNull, trimmedString(200, 'Erro geocode').nullable().optional()),
  risk_status: z.preprocess(
    emptyStringToNull,
    z.enum(riskStatusOptions, { message: 'Status risco invalido' }).nullable().optional(),
  ),
  risk_provider: z.preprocess(emptyStringToNull, trimmedString(80, 'Provider risco').nullable().optional()),
  risk_score: z.preprocess(emptyStringToNull, z.coerce.number().min(0).nullable().optional()),
  risk_level: z.preprocess(
    emptyStringToNull,
    z.enum(riskLevelOptions, { message: 'Nivel de risco invalido' }).nullable().optional(),
  ),
  risk_refreshed_at: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  risk_cache_until: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  risk_payload: z.custom<Json | null>().optional(),
  risk_error_message: z.preprocess(emptyStringToNull, trimmedString(200, 'Erro risco').nullable().optional()),
});

export const patientAddressLogisticsSchema = z.object({
  allowed_visit_hours: z.preprocess(emptyStringToNull, trimmedString(120, 'Horario de visita').nullable().optional()),
  travel_time_min: z.preprocess(emptyStringToNull, z.coerce.number().min(0).nullable().optional()),
  distance_km: z.preprocess(emptyStringToNull, z.coerce.number().min(0).nullable().optional()),
  travel_notes: z.preprocess(emptyStringToNull, trimmedString(500, 'Notas de deslocamento').nullable().optional()),
  access_conditions: z.preprocess(emptyStringToNull, trimmedString(200, 'Condicoes de acesso').nullable().optional()),
  entry_procedure: z.preprocess(emptyStringToNull, trimmedString(200, 'Procedimento de entrada').nullable().optional()),
  gate_identification: z.preprocess(emptyStringToNull, trimmedString(120, 'Identificacao no portao').nullable().optional()),
  parking: z.preprocess(emptyStringToNull, trimmedString(120, 'Estacionamento').nullable().optional()),
  team_parking: z.preprocess(emptyStringToNull, trimmedString(120, 'Estacionamento equipe').nullable().optional()),
  ambulance_access: z.preprocess(
    emptyStringToNull,
    z.enum(ambulanceAccessOptions, { message: 'Acesso de ambulancia invalido' }).nullable().optional(),
  ),
  night_access_risk: z.preprocess(
    emptyStringToNull,
    z.enum(nightAccessRiskOptions, { message: 'Risco noturno invalido' }).nullable().optional(),
  ),
  area_risk_type: z.preprocess(
    emptyStringToNull,
    z.enum(areaRiskTypeOptions, { message: 'Tipo de area invalido' }).nullable().optional(),
  ),
  zone_type: z.preprocess(
    emptyStringToNull,
    z.enum(zoneTypeOptions, { message: 'Zona invalida' }).nullable().optional(),
  ),
  street_access_type: z.preprocess(
    emptyStringToNull,
    z.enum(streetAccessTypeOptions, { message: 'Tipo de rua invalido' }).nullable().optional(),
  ),
  external_stairs: z.preprocess(emptyStringToNull, trimmedString(120, 'Escadas externas').nullable().optional()),
  elevator_status: z.preprocess(
    emptyStringToNull,
    z.enum(elevatorStatusOptions, { message: 'Elevador invalido' }).nullable().optional(),
  ),
  wheelchair_access: z.preprocess(
    emptyStringToNull,
    z.enum(wheelchairAccessOptions, { message: 'Acesso cadeirante invalido' }).nullable().optional(),
  ),
  has_24h_concierge: z.boolean().optional(),
  concierge_contact: z.preprocess(emptyStringToNull, trimmedString(120, 'Contato portaria').nullable().optional()),
  cell_signal_quality: z.preprocess(
    emptyStringToNull,
    z.enum(cellSignalQualityOptions, { message: 'Sinal celular invalido' }).nullable().optional(),
  ),
  property_type: z.preprocess(
    emptyStringToNull,
    z.enum(propertyTypeOptions, { message: 'Tipo de imovel invalido' }).nullable().optional(),
  ),
  condo_name: z.preprocess(emptyStringToNull, trimmedString(120, 'Condominio').nullable().optional()),
  block_tower: z.preprocess(emptyStringToNull, trimmedString(60, 'Bloco/Torre').nullable().optional()),
  floor_number: z.preprocess(emptyStringToNull, z.coerce.number().min(0).nullable().optional()),
  unit_number: z.preprocess(emptyStringToNull, trimmedString(40, 'Unidade').nullable().optional()),
  bed_type: z.preprocess(
    emptyStringToNull,
    z.enum(bedTypeOptions, { message: 'Tipo de cama invalido' }).nullable().optional(),
  ),
  mattress_type: z.preprocess(
    emptyStringToNull,
    z.enum(mattressTypeOptions, { message: 'Tipo de colchao invalido' }).nullable().optional(),
  ),
  adapted_bathroom: z.boolean().optional(),
  electric_voltage: z.preprocess(
    emptyStringToNull,
    z.enum(electricVoltageOptions, { message: 'Tensao invalida' }).nullable().optional(),
  ),
  backup_power_source: z.preprocess(
    emptyStringToNull,
    z.enum(backupPowerSourceOptions, { message: 'Fonte reserva invalida' }).nullable().optional(),
  ),
  backup_power_desc: z.preprocess(emptyStringToNull, trimmedString(200, 'Detalhes energia').nullable().optional()),
  water_source: z.preprocess(
    emptyStringToNull,
    z.enum(waterSourceOptions, { message: 'Fonte de agua invalida' }).nullable().optional(),
  ),
  has_wifi: z.boolean().optional(),
  has_smokers: z.boolean().optional(),
  animals_behavior: z.preprocess(
    emptyStringToNull,
    z.enum(animalsBehaviorOptions, { message: 'Comportamento dos animais invalido' }).nullable().optional(),
  ),
  pets_description: z.preprocess(emptyStringToNull, trimmedString(200, 'Descricao pets').nullable().optional()),
  ventilation: z.preprocess(emptyStringToNull, trimmedString(120, 'Ventilacao').nullable().optional()),
  lighting_quality: z.preprocess(emptyStringToNull, trimmedString(120, 'Iluminacao').nullable().optional()),
  noise_level: z.preprocess(emptyStringToNull, trimmedString(120, 'Nivel de ruido').nullable().optional()),
  hygiene_conditions: z.preprocess(emptyStringToNull, trimmedString(120, 'Condicoes de higiene').nullable().optional()),
  equipment_space: z.preprocess(
    emptyStringToNull,
    z.enum(equipmentSpaceOptions, { message: 'Espaco equipamento invalido' }).nullable().optional(),
  ),
  power_outlets_desc: z.preprocess(emptyStringToNull, trimmedString(200, 'Tomadas').nullable().optional()),
  facade_image_url: z.preprocess(emptyStringToNull, trimmedString(500, 'URL fachada').nullable().optional()),
  general_observations: z.preprocess(emptyStringToNull, trimmedString(5000, 'Observacoes').nullable().optional()),
});

export type PatientAddressUpsertInput = z.input<typeof patientAddressUpsertSchema>;
export type PatientAddressUpsert = z.infer<typeof patientAddressUpsertSchema>;
export type PatientAddressLogisticsInput = z.input<typeof patientAddressLogisticsSchema>;
export type PatientAddressLogistics = z.infer<typeof patientAddressLogisticsSchema>;

export function normalizePostalCode(value?: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length ? digits : null;
}

export function normalizeState(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.toUpperCase();
}

export function normalizeText(value?: string | null) {
  if (typeof value !== 'string') return value ?? null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function normalizeJsonObject(value?: Json | null | undefined): Json | null {
  if (value == null) return null;
  return value as Json;
}
