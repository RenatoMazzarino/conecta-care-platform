import { z } from 'zod';
import type { Json } from '@/types/supabase';

export const administrativeStatusOptions = [
  'em_cadastro',
  'pendente_documentos',
  'pendente_autorizacao',
  'em_implantacao',
  'pronto_para_faturar',
  'faturamento_suspenso',
  'encerrado_administrativo',
] as const;

export const contractStatusOptions = [
  'Proposta',
  'Em_Implantacao',
  'Ativo',
  'Suspenso',
  'Encerrado',
  'Cancelado',
  'Recusado',
] as const;

export const admissionTypeOptions = ['home_care', 'paliativo', 'procedimento_pontual', 'reabilitacao'] as const;

export const contractCategoryOptions = ['Particular_Premium', 'Convenio_Padrao', 'Judicial', 'SUS', 'Cortesia'] as const;

export const renewalTypeOptions = ['Automatica', 'Periodo_Fixo', 'Por_Laudo', 'Judicial'] as const;

export const bondTypeOptions = ['Plano_Saude', 'Particular', 'Convenio', 'Publico'] as const;

export const billingStatusOptions = ['active', 'suspended', 'defaulting'] as const;

export const paymentMethodOptions = [
  'Boleto',
  'Pix',
  'Transferencia',
  'Debito_Automatico',
  'Cartao_Credito',
  'Dinheiro',
  'Outro',
] as const;

export const billingModelOptions = [
  'Mensalidade',
  'Diaria',
  'Plantao_12h',
  'Plantao_24h',
  'Visita',
  'Pacote_Fechado',
  'Outro',
] as const;

export const invoiceDeliveryMethodOptions = ['Email', 'Portal', 'WhatsApp', 'Correio', 'Nao_Envia'] as const;

export const billingEntityKindOptions = ['person', 'company', 'insurer', 'broker', 'public'] as const;

export const billingEntityKindLabels: Record<(typeof billingEntityKindOptions)[number], string> = {
  person: 'Pessoa (CPF)',
  company: 'Empresa (CNPJ)',
  insurer: 'Operadora',
  broker: 'Corretora',
  public: 'Orgao Publico/SUS',
};

export const checklistItemCodeOptions = [
  'CONTRACT',
  'CONSENT',
  'MEDICAL_REPORT',
  'LEGAL_DOCS',
  'FINANCIAL_DOCS',
  'JUDICIAL',
  'ADDRESS_PROOF',
  'LEGAL_GUARDIAN_DOCS',
  'FINANCIAL_RESPONSIBLE_DOCS',
  'OTHER_DOCS',
] as const;

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

const optionalText = (max: number, label: string) =>
  z.preprocess(emptyStringToNull, trimmedString(max, label).nullable().optional());

const optionalUuid = z.preprocess(emptyStringToNull, z.string().uuid().nullable().optional());

const optionalDate = z.preprocess(emptyStringToNull, z.string().nullable().optional());

const optionalNumber = z.preprocess(emptyStringToNull, z.coerce.number().nullable().optional());

export function normalizeText(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function normalizeDocNumber(value?: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits === '' ? null : digits;
}

export function normalizePhone(value?: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits === '' ? null : digits;
}

export function normalizeEmail(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed === '' ? null : trimmed;
}

export const billingEntitySchema = z
  .object({
    id: optionalUuid,
    kind: z.enum(billingEntityKindOptions, { message: 'Tipo de pagador invalido' }),
    name: trimmedString(160, 'Nome do pagador'),
    legal_name: optionalText(160, 'Razao social'),
    doc_type: optionalText(40, 'Tipo de documento'),
    doc_number: optionalText(40, 'Documento'),
    contact_email: z.preprocess(emptyStringToNull, z.string().email().nullable().optional()),
    contact_phone: optionalText(40, 'Telefone de contato'),
    billing_address_cep: optionalText(16, 'CEP de cobranca'),
    billing_address_street: optionalText(160, 'Rua de cobranca'),
    billing_address_number: optionalText(20, 'Numero de cobranca'),
    billing_address_neighborhood: optionalText(120, 'Bairro de cobranca'),
    billing_address_city: optionalText(120, 'Cidade de cobranca'),
    billing_address_state: optionalText(12, 'UF de cobranca'),
  })
  .superRefine((data, ctx) => {
    if (data.doc_number && !data.doc_type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['doc_type'],
        message: 'Tipo de documento obrigatorio quando o documento estiver preenchido',
      });
    }
  });

export type BillingEntityInput = z.infer<typeof billingEntitySchema>;

const ruleSetSchema = z
  .object({
    billing_rules: z.custom<Json>().optional(),
    inventory_rules: z.custom<Json>().optional(),
    scale_rules: z.custom<Json>().optional(),
    document_rules: z.custom<Json>().optional(),
  })
  .passthrough();

export const carePolicyProfileSchema = z.object({
  id: optionalUuid,
  name: trimmedString(120, 'Nome do perfil'),
  description: optionalText(240, 'Descricao do perfil'),
  rule_set: ruleSetSchema,
  is_default: z.boolean().optional(),
  version: z.preprocess(emptyStringToNull, z.coerce.number().int().min(1).nullable().optional()),
});

export type CarePolicyProfileInput = z.infer<typeof carePolicyProfileSchema>;

export const adminFinancialProfileSchema = z.object({
  administrative_status: z.enum(administrativeStatusOptions).optional(),
  administrative_status_reason: optionalText(240, 'Motivo do status'),
  administrative_status_changed_at: optionalDate,
  admission_type: z.preprocess(emptyStringToNull, z.enum(admissionTypeOptions).nullable().optional()),
  admission_date: optionalDate,
  discharge_prediction_date: optionalDate,
  discharge_date: optionalDate,
  admission_source: optionalText(120, 'Origem da admissao'),
  demand_origin: optionalText(120, 'Origem da demanda'),
  demand_origin_description: optionalText(240, 'Descricao da origem'),
  acquisition_channel: optionalText(120, 'Canal de aquisicao'),
  service_package_name: optionalText(120, 'Pacote de servico'),
  service_package_description: optionalText(240, 'Descricao do pacote'),
  policy_profile_id: optionalUuid,
  contract_id: optionalText(120, 'Identificador do contrato'),
  external_contract_id: optionalText(120, 'Identificador externo'),
  contract_start_date: optionalDate,
  contract_end_date: optionalDate,
  contract_status: z.preprocess(emptyStringToNull, z.enum(contractStatusOptions).nullable().optional()),
  contract_status_reason: optionalText(240, 'Motivo do contrato'),
  contract_category: z.preprocess(emptyStringToNull, z.enum(contractCategoryOptions).nullable().optional()),
  renewal_type: z.preprocess(emptyStringToNull, z.enum(renewalTypeOptions).nullable().optional()),
  authorization_number: optionalText(120, 'Numero de autorizacao'),
  judicial_case_number: optionalText(120, 'Numero do processo'),
  official_letter_number: optionalText(120, 'Numero de oficio'),
  cost_center_id: optionalText(120, 'Centro de custo'),
  erp_case_code: optionalText(120, 'Codigo ERP'),
  commercial_responsible_id: optionalUuid,
  contract_manager_id: optionalUuid,
  payer_admin_contact_id: optionalUuid,
  payer_admin_contact_description: optionalText(240, 'Descricao do contato'),
  primary_payer_entity_id: optionalUuid,
  primary_payer_related_person_id: optionalUuid,
  payer_relation: optionalText(120, 'Relacao do pagador'),
  financial_responsible_name: optionalText(160, 'Responsavel financeiro'),
  financial_responsible_contact: optionalText(120, 'Contato financeiro'),
  bond_type: z.preprocess(emptyStringToNull, z.enum(bondTypeOptions).nullable().optional()),
  insurer_name: optionalText(160, 'Operadora'),
  plan_name: optionalText(160, 'Plano'),
  insurance_card_number: optionalText(80, 'Numero da carteirinha'),
  insurance_card_validity: optionalDate,
  monthly_fee: optionalNumber,
  billing_due_day: z.preprocess(emptyStringToNull, z.coerce.number().int().min(1).max(31).nullable().optional()),
  billing_status: z.preprocess(emptyStringToNull, z.enum(billingStatusOptions).nullable().optional()),
  payment_method: z.preprocess(emptyStringToNull, z.enum(paymentMethodOptions).nullable().optional()),
  billing_model: z.preprocess(emptyStringToNull, z.enum(billingModelOptions).nullable().optional()),
  billing_base_value: optionalNumber,
  billing_periodicity: optionalText(80, 'Periodicidade'),
  payment_terms: optionalText(160, 'Condicoes de pagamento'),
  grace_period_days: optionalNumber,
  copay_percent: optionalNumber,
  readjustment_index: optionalText(80, 'Indice de reajuste'),
  readjustment_month: optionalNumber,
  late_fee_percent: optionalNumber,
  daily_interest_percent: optionalNumber,
  discount_early_payment: optionalNumber,
  discount_days_limit: optionalNumber,
  card_holder_name: optionalText(160, 'Titular do cartao'),
  invoice_delivery_method: z.preprocess(emptyStringToNull, z.enum(invoiceDeliveryMethodOptions).nullable().optional()),
  receiving_account_info: optionalText(160, 'Conta de recebimento'),
  financial_notes: optionalText(500, 'Observacoes financeiras'),
  checklist_complete: z.boolean().optional(),
  checklist_notes: optionalText(240, 'Observacoes do checklist'),
  admin_notes: optionalText(500, 'Observacoes administrativas'),
});

export type AdminFinancialProfileInput = z.infer<typeof adminFinancialProfileSchema>;

export const adminInfoSchema = adminFinancialProfileSchema.pick({
  administrative_status: true,
  administrative_status_reason: true,
  administrative_status_changed_at: true,
  admission_type: true,
  admission_date: true,
  discharge_prediction_date: true,
  discharge_date: true,
  admission_source: true,
  demand_origin: true,
  demand_origin_description: true,
  acquisition_channel: true,
  service_package_name: true,
  service_package_description: true,
  policy_profile_id: true,
  contract_id: true,
  external_contract_id: true,
  contract_start_date: true,
  contract_end_date: true,
  contract_status: true,
  contract_status_reason: true,
  contract_category: true,
  renewal_type: true,
  authorization_number: true,
  judicial_case_number: true,
  official_letter_number: true,
  cost_center_id: true,
  erp_case_code: true,
  commercial_responsible_id: true,
  contract_manager_id: true,
  payer_admin_contact_id: true,
  payer_admin_contact_description: true,
  payer_relation: true,
  financial_responsible_name: true,
  financial_responsible_contact: true,
  checklist_complete: true,
  checklist_notes: true,
  admin_notes: true,
});

export type AdminInfoInput = z.infer<typeof adminInfoSchema>;

export const financialProfileSchema = adminFinancialProfileSchema.pick({
  bond_type: true,
  insurer_name: true,
  plan_name: true,
  insurance_card_number: true,
  insurance_card_validity: true,
  monthly_fee: true,
  billing_due_day: true,
  billing_status: true,
  payment_method: true,
  billing_model: true,
  billing_base_value: true,
  billing_periodicity: true,
  payment_terms: true,
  grace_period_days: true,
  copay_percent: true,
  readjustment_index: true,
  readjustment_month: true,
  late_fee_percent: true,
  daily_interest_percent: true,
  discount_early_payment: true,
  discount_days_limit: true,
  card_holder_name: true,
  invoice_delivery_method: true,
  receiving_account_info: true,
  financial_notes: true,
});

export type FinancialProfileInput = z.infer<typeof financialProfileSchema>;

export const onboardingChecklistItemSchema = z.object({
  item_code: z.enum(checklistItemCodeOptions),
  item_description: optionalText(240, 'Descricao do item'),
  is_completed: z.boolean().optional(),
  completed_at: optionalDate,
  completed_by_user_id: optionalUuid,
  completed_by_label: optionalText(120, 'Responsavel'),
  document_id: optionalUuid,
});

export const onboardingChecklistUpdateSchema = z.array(onboardingChecklistItemSchema);

export type OnboardingChecklistItemInput = z.infer<typeof onboardingChecklistItemSchema>;
