import { z } from 'zod';
import type { Json } from '@/types/supabase';

export const genderOptions = ['M', 'F', 'Outro'] as const;
export const civilStatusOptions = ['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel'] as const;
export const genderIdentityOptions = [
  'Cisgenero',
  'Transgenero',
  'Nao Binario',
  'Outro',
  'Prefiro nao informar',
] as const;
export const pronounsOptions = ['Ele/Dele', 'Ela/Dela', 'Elu/Delu', 'Outro'] as const;
export const educationLevelOptions = [
  'Nao Alfabetizado',
  'Fundamental Incompleto',
  'Fundamental Completo',
  'Medio Incompleto',
  'Medio Completo',
  'Superior Incompleto',
  'Superior Completo',
  'Pos Graduacao',
  'Mestrado/Doutorado',
  'Nao Informado',
] as const;
export const raceColorOptions = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indigena', 'Nao declarado'] as const;
export const prefContactMethodOptions = ['whatsapp', 'phone', 'sms', 'email', 'other'] as const;
export const contactTimePreferenceOptions = [
  'Manha',
  'Tarde',
  'Noite',
  'Comercial',
  'Qualquer Horario',
] as const;
export const cpfStatusOptions = ['valid', 'invalid', 'unknown'] as const;
export const docValidationStatusOptions = [
  'Pendente',
  'Nao Validado',
  'Validado',
  'Inconsistente',
  'Em Analise',
] as const;
export const marketingConsentStatusOptions = ['pending', 'accepted', 'rejected'] as const;
export const marketingConsentSourceOptions = [
  'Portal Administrativo (Edicao Manual)',
  'Formulario Web',
  'Assinatura Digital',
  'Importacao de Legado',
  'Solicitacao Verbal',
] as const;
export const recordStatusOptions = [
  'draft',
  'onboarding',
  'active',
  'inactive',
  'deceased',
  'discharged',
  'pending_financial',
] as const;

function emptyStringToNull(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : value;
}

function trimmedString(max: number, label: string) {
  return z
    .string({ invalid_type_error: `${label} inválido` })
    .trim()
    .max(max, { message: `${label} muito longo` });
}

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data inválida' });

const contactPreferencesSchema = z.object({
  sms: z.boolean().default(true),
  email: z.boolean().default(true),
  whatsapp: z.boolean().default(true),
});

export const patientDadosPessoaisUpdateSchema = z
  .object({
    photo_path: z.preprocess(emptyStringToNull, trimmedString(500, 'Foto').nullable().optional()),
    photo_consent: z.boolean().optional(),
    photo_consent_date: z.preprocess(emptyStringToNull, z.string().nullable().optional()),

    full_name: trimmedString(200, 'Nome completo').min(3, { message: 'Nome completo muito curto' }).optional(),
    social_name: z.preprocess(emptyStringToNull, trimmedString(200, 'Nome social').nullable().optional()),
    nickname: z.preprocess(emptyStringToNull, trimmedString(100, 'Apelido').nullable().optional()),
    salutation: z.preprocess(emptyStringToNull, trimmedString(60, 'Tratamento').nullable().optional()),

    cpf: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    cpf_status: z.preprocess(
      emptyStringToNull,
      z.enum(cpfStatusOptions, { message: 'Status do CPF inválido' }).nullable().optional(),
    ),

    rg: z.preprocess(emptyStringToNull, trimmedString(30, 'RG').nullable().optional()),
    rg_issuer: z.preprocess(emptyStringToNull, trimmedString(60, 'Órgão emissor').nullable().optional()),
    rg_issuer_state: z.preprocess(
      emptyStringToNull,
      z
        .string()
        .trim()
        .regex(/^[A-Z]{2}$/, { message: 'UF inválida' })
        .nullable()
        .optional(),
    ),
    rg_issued_at: z.preprocess(emptyStringToNull, dateString.nullable().optional()),

    cns: z.preprocess(emptyStringToNull, trimmedString(30, 'CNS').nullable().optional()),
    national_id: z.preprocess(emptyStringToNull, trimmedString(60, 'Documento nacional').nullable().optional()),

    date_of_birth: z.preprocess(emptyStringToNull, dateString.nullable().optional()),
    gender: z.preprocess(
      emptyStringToNull,
      z.enum(genderOptions, { message: 'Sexo inválido' }).nullable().optional(),
    ),
    civil_status: z.preprocess(
      emptyStringToNull,
      z.enum(civilStatusOptions, { message: 'Estado civil inválido' }).nullable().optional(),
    ),
    gender_identity: z.preprocess(
      emptyStringToNull,
      z.enum(genderIdentityOptions, { message: 'Identidade de gênero inválida' }).nullable().optional(),
    ),
    pronouns: z.preprocess(
      emptyStringToNull,
      z.enum(pronounsOptions, { message: 'Pronomes inválidos' }).nullable().optional(),
    ),

    nationality: z.preprocess(emptyStringToNull, trimmedString(100, 'Nacionalidade').nullable().optional()),
    preferred_language: z.preprocess(emptyStringToNull, trimmedString(60, 'Idioma preferido').nullable().optional()),
    education_level: z.preprocess(
      emptyStringToNull,
      z.enum(educationLevelOptions, { message: 'Escolaridade inválida' }).nullable().optional(),
    ),
    profession: z.preprocess(emptyStringToNull, trimmedString(120, 'Profissão').nullable().optional()),
    race_color: z.preprocess(
      emptyStringToNull,
      z.enum(raceColorOptions, { message: 'Raça/Cor inválida' }).nullable().optional(),
    ),
    is_pcd: z.boolean().optional(),

    birth_place: z.preprocess(emptyStringToNull, trimmedString(200, 'Local de nascimento').nullable().optional()),
    naturalness_city: z.preprocess(
      emptyStringToNull,
      trimmedString(120, 'Naturalidade (cidade)').nullable().optional(),
    ),
    naturalness_state: z.preprocess(
      emptyStringToNull,
      trimmedString(60, 'Naturalidade (UF/estado)').nullable().optional(),
    ),
    naturalness_country: z.preprocess(
      emptyStringToNull,
      trimmedString(60, 'Naturalidade (país)').nullable().optional(),
    ),
    mother_name: z.preprocess(emptyStringToNull, trimmedString(200, 'Nome da mãe').nullable().optional()),
    father_name: z.preprocess(emptyStringToNull, trimmedString(200, 'Nome do pai').nullable().optional()),

    mobile_phone: z.preprocess(emptyStringToNull, z.string({ message: 'Telefone inválido' }).optional()),
    secondary_phone: z.preprocess(emptyStringToNull, z.string({ message: 'Telefone inválido' }).nullable().optional()),
    secondary_phone_type: z.preprocess(emptyStringToNull, trimmedString(40, 'Tipo telefone secundário').nullable().optional()),
    email: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    email_verified: z.boolean().optional(),
    mobile_phone_verified: z.boolean().optional(),
    pref_contact_method: z.preprocess(
      emptyStringToNull,
      z.enum(prefContactMethodOptions, { message: 'Preferência de contato inválida' }).nullable().optional(),
    ),
    contact_time_preference: z.preprocess(
      emptyStringToNull,
      z.enum(contactTimePreferenceOptions, { message: 'Janela de contato inválida' }).nullable().optional(),
    ),
    contact_notes: z.preprocess(emptyStringToNull, trimmedString(5000, 'Notas de contato').nullable().optional()),
    communication_preferences: contactPreferencesSchema.optional(),

    doc_validation_status: z.preprocess(
      emptyStringToNull,
      z.enum(docValidationStatusOptions, { message: 'Status de validação inválido' }).nullable().optional(),
    ),
    doc_validation_method: z.preprocess(emptyStringToNull, trimmedString(120, 'Método de validação').nullable().optional()),
    doc_validation_source: z.preprocess(emptyStringToNull, trimmedString(120, 'Fonte de validação').nullable().optional()),
    doc_validated_at: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    doc_validated_by: z.preprocess(emptyStringToNull, z.string().uuid({ message: 'UUID inválido' }).nullable().optional()),

    accept_sms: z.boolean().optional(),
    accept_email: z.boolean().optional(),
    block_marketing: z.boolean().optional(),
    marketing_consent_status: z.preprocess(
      emptyStringToNull,
      z.enum(marketingConsentStatusOptions, { message: 'Status de marketing inválido' }).nullable().optional(),
    ),
    marketing_consented_at: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    marketing_consent_source: z.preprocess(
      emptyStringToNull,
      z.enum(marketingConsentSourceOptions, { message: 'Origem do consentimento inválida' }).nullable().optional(),
    ),
    marketing_consent_ip: z.preprocess(emptyStringToNull, trimmedString(64, 'IP').nullable().optional()),
    marketing_consent_history: z.preprocess(
      emptyStringToNull,
      trimmedString(5000, 'Histórico de consentimento').nullable().optional(),
    ),

    record_status: z.preprocess(
      emptyStringToNull,
      z.enum(recordStatusOptions, { message: 'Status do registro inválido' }).optional(),
    ),
    onboarding_step: z.coerce.number().int().min(1, { message: 'Onboarding deve ser >= 1' }).optional(),
    is_active: z.boolean().optional(),

    primary_contractor_id: z.preprocess(emptyStringToNull, z.string().uuid({ message: 'UUID inválido' }).nullable().optional()),
    external_ids: z.preprocess(emptyStringToNull, z.custom<Json>().nullable().optional()),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.cpf != null) {
      const digits = value.cpf.replace(/\D/g, '');
      if (digits.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cpf'],
          message: 'CPF inválido (precisa ter 11 dígitos)',
        });
      }
    }

    if (value.mobile_phone != null) {
      const digits = value.mobile_phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 13) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['mobile_phone'],
          message: 'Telefone principal inválido',
        });
      }
    }

    if (value.secondary_phone != null) {
      const digits = value.secondary_phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 13) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['secondary_phone'],
          message: 'Telefone secundário inválido',
        });
      }
    }

    if (value.email != null) {
      const email = value.email.trim().toLowerCase();
      if (email !== '' && !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'E-mail inválido',
        });
      }
    }

    if (value.date_of_birth != null) {
      const birth = new Date(value.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(birth.getTime()) || birth > today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['date_of_birth'],
          message: 'Data de nascimento inválida',
        });
      } else {
        const years = today.getFullYear() - birth.getFullYear();
        if (years > 130) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['date_of_birth'],
            message: 'Idade inválida',
          });
        }
      }
    }

    if (value.rg_issued_at != null) {
      const issued = new Date(value.rg_issued_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(issued.getTime()) || issued > today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['rg_issued_at'],
          message: 'Data de emissão inválida',
        });
      }
    }

    if (value.communication_preferences != null) {
      const { sms, email, whatsapp } = value.communication_preferences;
      if (typeof sms !== 'boolean' || typeof email !== 'boolean' || typeof whatsapp !== 'boolean') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['communication_preferences'],
          message: 'Preferências de comunicação inválidas',
        });
      }
    }

    if (value.is_active != null && value.record_status != null) {
      const recordStatus = value.record_status;
      const allowedOnboarding = new Set(['draft', 'onboarding']);
      const allowedActive = new Set(['active', 'inactive', 'deceased', 'discharged', 'pending_financial']);

      const ok = value.is_active
        ? allowedActive.has(recordStatus)
        : allowedOnboarding.has(recordStatus);

      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['record_status'],
          message: 'Status do registro incompatível com o marco de ativação',
        });
      }
    }
  });

export type PatientDadosPessoaisUpdateInput = z.input<typeof patientDadosPessoaisUpdateSchema>;
export type PatientDadosPessoaisUpdate = z.output<typeof patientDadosPessoaisUpdateSchema>;

export function normalizeCpf(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const digits = value.replace(/\D/g, '');
  return digits === '' ? null : digits;
}

export function normalizePhone(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const digits = value.replace(/\D/g, '');
  return digits === '' ? null : digits;
}

export function normalizeEmail(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const normalized = value.trim().toLowerCase();
  return normalized === '' ? null : normalized;
}

export function normalizeText(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function normalizeFullName(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const collapsed = value.trim().replace(/\s+/g, ' ');
  return collapsed === '' ? null : collapsed;
}

export function normalizeJsonObject(value: unknown): Json | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value as Json;
}
