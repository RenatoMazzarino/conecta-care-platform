import { z } from 'zod';
import type { Json } from '@/types/supabase';

export const contactTypeOptions = [
  'ResponsavelLegal',
  'ResponsavelFinanceiro',
  'ContatoEmergencia24h',
  'Familiar',
  'Cuidador',
  'Vizinho',
  'Sindico',
  'Zelador',
  'Amigo',
  'Outro',
] as const;

export const contactTimePreferenceOptions = ['Manha', 'Tarde', 'Noite', 'Comercial', 'Qualquer Horario'] as const;
export const preferredContactOptions = ['whatsapp', 'phone', 'sms', 'email', 'other'] as const;
export const livesWithPatientOptions = ['Sim', 'Nao', 'VisitaFrequente', 'VisitaEventual'] as const;
export const careTeamStatusOptions = ['Ativo', 'Afastado', 'Encerrado', 'Standby'] as const;
export const careTeamRegimeOptions = ['Fixo', 'Variavel', 'Outro'] as const;
export const documentStatusOptions = [
  'uploaded',
  'ai_pending',
  'ai_failed',
  'ai_passed',
  'manual_pending',
  'manual_rejected',
  'manual_approved',
  'revoked',
  'expired',
] as const;
export const portalAccessLevelOptions = ['viewer', 'communicator', 'decision_authorized'] as const;

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

const phoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\D/g, '');
  },
  z.string().min(10, { message: 'Telefone invalido' }).max(13, { message: 'Telefone invalido' }),
);

const emailSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    return value.trim().toLowerCase();
  },
  z.string().email({ message: 'Email invalido' }),
);

export const relatedPersonUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: trimmedString(200, 'Nome'),
  relationship_degree: trimmedString(120, 'Parentesco'),
  contact_type: z.enum(contactTypeOptions, { message: 'Tipo de contato invalido' }).optional(),
  phone_primary: z.preprocess(emptyStringToNull, phoneSchema.nullable().optional()),
  phone_secondary: z.preprocess(emptyStringToNull, phoneSchema.nullable().optional()),
  email: z.preprocess(emptyStringToNull, emailSchema.nullable().optional()),
  contact_time_preference: z.preprocess(
    emptyStringToNull,
    z.enum(contactTimePreferenceOptions, { message: 'Horario de contato invalido' }).nullable().optional(),
  ),
  preferred_contact: z.preprocess(
    emptyStringToNull,
    z.enum(preferredContactOptions, { message: 'Canal preferido invalido' }).nullable().optional(),
  ),
  is_legal_guardian: z.boolean().optional(),
  is_emergency_contact: z.boolean().optional(),
  is_financial_responsible: z.boolean().optional(),
  can_authorize_clinical: z.boolean().optional(),
  can_authorize_financial: z.boolean().optional(),
  is_main_contact: z.boolean().optional(),
  lives_with_patient: z.preprocess(
    emptyStringToNull,
    z.enum(livesWithPatientOptions, { message: 'Status de convivencia invalido' }).nullable().optional(),
  ),
  visit_frequency: z.preprocess(emptyStringToNull, trimmedString(120, 'Frequencia de visitas').nullable().optional()),
  access_to_home: z.boolean().optional(),
  cpf: z.preprocess(emptyStringToNull, trimmedString(20, 'CPF').nullable().optional()),
  rg: z.preprocess(emptyStringToNull, trimmedString(20, 'RG').nullable().optional()),
  rg_issuer: z.preprocess(emptyStringToNull, trimmedString(60, 'Orgao emissor').nullable().optional()),
  rg_state: z.preprocess(emptyStringToNull, trimmedString(2, 'UF RG').nullable().optional()),
  birth_date: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  address_full: z.preprocess(emptyStringToNull, trimmedString(200, 'Endereco').nullable().optional()),
  address_street: z.preprocess(emptyStringToNull, trimmedString(200, 'Logradouro').nullable().optional()),
  address_number: z.preprocess(emptyStringToNull, trimmedString(40, 'Numero').nullable().optional()),
  address_city: z.preprocess(emptyStringToNull, trimmedString(120, 'Cidade').nullable().optional()),
  address_state: z.preprocess(emptyStringToNull, trimmedString(2, 'UF').nullable().optional()),
  address_summary: z.preprocess(emptyStringToNull, trimmedString(200, 'Resumo').nullable().optional()),
  relation_description: z.preprocess(emptyStringToNull, trimmedString(200, 'Descricao').nullable().optional()),
  allow_clinical_updates: z.boolean().optional(),
  allow_admin_notif: z.boolean().optional(),
  block_marketing: z.boolean().optional(),
  observations: z.preprocess(emptyStringToNull, trimmedString(500, 'Observacoes').nullable().optional()),
  observacoes_lgpd: z.preprocess(emptyStringToNull, trimmedString(500, 'Observacoes LGPD').nullable().optional()),
});

export const careTeamMemberSchema = z.object({
  id: z.string().uuid().optional(),
  professional_id: z.preprocess(emptyStringToNull, z.string().uuid().nullable().optional()),
  profissional_nome: z.preprocess(emptyStringToNull, trimmedString(200, 'Nome do profissional').nullable().optional()),
  role_in_case: trimmedString(120, 'Papel'),
  status: z.preprocess(
    emptyStringToNull,
    z.enum(careTeamStatusOptions, { message: 'Status invalido' }).nullable().optional(),
  ),
  regime: z.preprocess(emptyStringToNull, z.enum(careTeamRegimeOptions, { message: 'Regime invalido' }).nullable().optional()),
  contact_email: z.preprocess(emptyStringToNull, emailSchema.nullable().optional()),
  contact_phone: z.preprocess(emptyStringToNull, phoneSchema.nullable().optional()),
  notes: z.preprocess(emptyStringToNull, trimmedString(500, 'Notas').nullable().optional()),
});

export const legalDocumentUploadSchema = z.object({
  related_person_id: z.string().uuid(),
  title: trimmedString(200, 'Titulo'),
  category: trimmedString(40, 'Categoria'),
  file_name: trimmedString(200, 'Arquivo'),
  file_path: trimmedString(400, 'Path'),
  file_size_bytes: z.preprocess(emptyStringToNull, z.coerce.number().nonnegative().nullable().optional()),
  mime_type: z.preprocess(emptyStringToNull, trimmedString(120, 'Mime type').nullable().optional()),
  document_status: z.enum(documentStatusOptions, { message: 'Status invalido' }),
  document_validation_payload: z.custom<Json | null>().optional(),
});

export const portalAccessSchema = z.object({
  related_person_id: z.string().uuid(),
  portal_access_level: z.enum(portalAccessLevelOptions, { message: 'Nivel de acesso invalido' }),
  invite_expires_at: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
});

export type RelatedPersonUpsertInput = z.infer<typeof relatedPersonUpsertSchema>;
export type CareTeamMemberInput = z.infer<typeof careTeamMemberSchema>;
export type LegalDocumentUploadInput = z.infer<typeof legalDocumentUploadSchema>;
export type PortalAccessInput = z.infer<typeof portalAccessSchema>;

export function normalizeText(value?: string | null) {
  if (typeof value !== 'string') return value ?? null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function normalizePhone(value?: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length ? digits : null;
}

export function normalizeEmail(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length ? trimmed : null;
}

export function normalizeJsonObject(value?: Json | null) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'object') return value as Json;
  return null;
}
