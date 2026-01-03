import { z } from 'zod';

export const gedCategoryOptions = ['identity', 'legal', 'financial', 'clinical', 'consent', 'other'] as const;
export type GedCategory = (typeof gedCategoryOptions)[number];

export const gedDocDomainOptions = ['Administrativo', 'Clinico', 'Misto'] as const;
export type GedDocDomain = (typeof gedDocDomainOptions)[number];

export const gedDocSourceOptions = ['Ficha', 'Prontuario', 'Portal', 'Importacao', 'Email'] as const;
export type GedDocSource = (typeof gedDocSourceOptions)[number];

export const gedDocOriginOptions = [
  'Ficha_Documentos',
  'Ficha_Administrativo',
  'Ficha_Financeiro',
  'Prontuario',
  'PortalPaciente',
  'Importacao',
  'Outro',
] as const;
export type GedDocOrigin = (typeof gedDocOriginOptions)[number];

export const gedDocStatusOptions = ['Ativo', 'Substituido', 'Arquivado', 'Rascunho'] as const;
export type GedDocStatus = (typeof gedDocStatusOptions)[number];

export const gedDocStatusEnumOptions = ['Ativo', 'Substituido', 'Arquivado', 'Rascunho', 'ExcluidoLogicamente'] as const;
export type GedDocStatusEnum = (typeof gedDocStatusEnumOptions)[number];

export const gedDocTypeOptions = [
  'receita',
  'exame',
  'laudo',
  'evolucao',
  'prescricao',
  'contrato',
  'autorizacao',
  'fatura',
  'comprovante',
  'identidade',
  'consentimento',
  'juridico_operadora',
  'outros',
] as const;
export type GedDocType = (typeof gedDocTypeOptions)[number];

function emptyStringToNull(value: unknown) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : value;
}

const optionalText = (max: number, label: string) =>
  z.preprocess(
    emptyStringToNull,
    z
      .string({ invalid_type_error: `${label} invalido` })
      .trim()
      .max(max, { message: `${label} muito longo` })
      .nullable()
      .optional(),
  );

export const gedDocumentInputSchema = z.object({
  title: z.string().min(1, 'Titulo obrigatorio').max(160, 'Titulo muito longo').trim(),
  category: z.enum(gedCategoryOptions, { message: 'Categoria invalida' }),
  doc_type: z.enum(gedDocTypeOptions, { message: 'Tipo de documento invalido' }),
  doc_domain: z.enum(gedDocDomainOptions, { message: 'Dominio invalido' }),
  doc_source: z.enum(gedDocSourceOptions, { message: 'Fonte invalida' }),
  doc_origin: z.enum(gedDocOriginOptions, { message: 'Origem invalida' }),
  description: optionalText(240, 'Descricao'),
  tags: z.array(z.string().trim().min(1)).max(12).optional(),
});

export type GedDocumentInput = z.infer<typeof gedDocumentInputSchema>;

export const gedManifestItemSchema = z.object({
  file_path: z.string().min(1, 'file_path obrigatorio').trim(),
  title: z.string().min(1, 'title obrigatorio').trim(),
  category: z.enum(gedCategoryOptions, { message: 'category invalida' }),
  doc_type: z.enum(gedDocTypeOptions, { message: 'doc_type invalido' }),
  doc_domain: z.enum(gedDocDomainOptions, { message: 'doc_domain invalido' }),
  doc_source: z.enum(gedDocSourceOptions, { message: 'doc_source invalido' }),
  doc_origin: z.enum(gedDocOriginOptions, { message: 'doc_origin invalido' }),
  patient_id: z.string().uuid().optional().nullable(),
  description: optionalText(240, 'description'),
  tags: z
    .array(z.string().trim().min(1))
    .max(12)
    .optional()
    .nullable(),
});

export type GedManifestItem = z.infer<typeof gedManifestItemSchema>;

export function resolveCategoryFromDocType(docType: GedDocType): GedCategory {
  switch (docType) {
    case 'receita':
    case 'exame':
    case 'laudo':
    case 'evolucao':
    case 'prescricao':
      return 'clinical';
    case 'contrato':
    case 'autorizacao':
    case 'juridico_operadora':
      return 'legal';
    case 'fatura':
    case 'comprovante':
      return 'financial';
    case 'identidade':
      return 'identity';
    case 'consentimento':
      return 'consent';
    case 'outros':
    default:
      return 'other';
  }
}

export function resolveDomainFromCategory(category: GedCategory): GedDocDomain {
  switch (category) {
    case 'clinical':
      return 'Clinico';
    case 'financial':
    case 'legal':
    case 'identity':
    case 'consent':
      return 'Administrativo';
    case 'other':
    default:
      return 'Misto';
  }
}
