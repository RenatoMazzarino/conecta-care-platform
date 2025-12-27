'use client';

import {
  Badge,
  Button,
  Checkbox,
  Field,
  Input,
  Select,
  Spinner,
  Textarea,
  Toaster,
  Toast,
  ToastTitle,
  makeStyles,
  tokens,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { AddRegular, ArrowClockwiseRegular } from '@fluentui/react-icons';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { FieldPath } from 'react-hook-form';
import type { Database } from '@/types/supabase';
import { getAdminFinancialData } from '@/features/pacientes/actions/aba04/getAdminFinancialData';
import { reconcileBillingStatus } from '@/features/pacientes/actions/aba04/reconcileBillingStatus';
import { requestChecklistDocumentIngestion } from '@/features/pacientes/actions/aba04/requestChecklistDocumentIngestion';
import { sendBillingExport } from '@/features/pacientes/actions/aba04/sendBillingExport';
import { sendContractForSignature } from '@/features/pacientes/actions/aba04/sendContractForSignature';
import { updateAdminInfo } from '@/features/pacientes/actions/aba04/updateAdminInfo';
import { updateFinancialProfile } from '@/features/pacientes/actions/aba04/updateFinancialProfile';
import { updateOnboardingChecklist } from '@/features/pacientes/actions/aba04/updateOnboardingChecklist';
import { upsertBillingEntity } from '@/features/pacientes/actions/aba04/upsertBillingEntity';
import { setPrimaryPayerEntity } from '@/features/pacientes/actions/aba04/setPrimaryPayerEntity';
import {
  adminFinancialProfileSchema,
  admissionTypeOptions,
  administrativeStatusOptions,
  billingEntityKindLabels,
  billingEntityKindOptions,
  billingModelOptions,
  billingStatusOptions,
  bondTypeOptions,
  checklistItemCodeOptions,
  contractCategoryOptions,
  contractStatusOptions,
  invoiceDeliveryMethodOptions,
  paymentMethodOptions,
  renewalTypeOptions,
  type AdminFinancialProfileInput,
  type BillingEntityInput,
  type OnboardingChecklistItemInput,
} from '@/features/pacientes/schemas/aba04AdminFinanceiro.schema';

const useStyles = makeStyles({
  container: {
    padding: '0 0 32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '16px',
    alignItems: 'start',
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1fr',
    },
  },
  leftCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1fr',
    },
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,.08)',
    overflow: 'hidden',
  },
  cardSpan: {
    gridColumn: '1 / -1',
  },
  cardHeader: {
    padding: '14px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  cardTitle: {
    fontSize: '12px',
    letterSpacing: '.6px',
    textTransform: 'uppercase',
    fontWeight: 900,
    color: tokens.colorNeutralForeground1,
  },
  cardBody: {
    padding: '14px 16px',
  },
  definitionList: {
    margin: 0,
    display: 'grid',
    gridTemplateColumns: '180px 1fr',
    rowGap: '10px',
    columnGap: '12px',
    '& dt': {
      color: tokens.colorNeutralForeground3,
      fontSize: '12px',
      margin: 0,
    },
    '& dd': {
      margin: 0,
      fontWeight: tokens.fontWeightSemibold,
      fontSize: '12.5px',
      overflowWrap: 'anywhere',
      color: tokens.colorNeutralForeground1,
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '140px 1fr',
    },
  },
  formGrid: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    '@media (max-width: 720px)': {
      gridTemplateColumns: '1fr',
    },
  },
  formGridFull: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: '1fr',
  },
  muted: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  checklistList: {
    display: 'grid',
    gap: '10px',
  },
  checklistItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingBottom: '8px',
    ':last-child': {
      borderBottom: 'none',
      paddingBottom: 0,
    },
  },
  checklistMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  inlineActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  integrationBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  integrationDivider: {
    borderTop: `1px dashed ${tokens.colorNeutralStroke2}`,
    marginTop: '14px',
    paddingTop: '14px',
  },
});

type AdminFinancialProfileRow = Database['public']['Tables']['patient_admin_financial_profile']['Row'];
export interface AdminFinancialStatusSummary {
  contract_status?: string | null;
  administrative_status?: string | null;
  billing_status?: string | null;
  checklist_complete?: boolean;
  policy_profile_name?: string | null;
}

export interface AdminFinancialTabHandle {
  save: () => void;
  startEdit: () => void;
  cancelEdit: () => void;
  reload: () => void;
}

interface AdminFinancialTabProps {
  patientId: string;
  onStatusChange?: (status: { isEditing: boolean; isSaving: boolean }) => void;
  onStatusSummary?: (summary: AdminFinancialStatusSummary) => void;
}

function formatEnum(value: string | null | undefined) {
  if (!value) return '—';
  return value.replace(/_/g, ' ');
}

function resolveBillingEntityKindLabel(kind?: string | null) {
  if (!kind) return '—';
  return billingEntityKindLabels[kind as keyof typeof billingEntityKindLabels] ?? kind;
}

function coerceEnum<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): T[number] | null {
  if (!value) return null;
  return options.includes(value as T[number]) ? (value as T[number]) : null;
}

function buildDefaultValues(profile: AdminFinancialProfileRow | null): AdminFinancialProfileInput {
  return {
    administrative_status: coerceEnum(profile?.administrative_status, administrativeStatusOptions) ?? 'em_cadastro',
    administrative_status_reason: profile?.administrative_status_reason ?? null,
    administrative_status_changed_at: profile?.administrative_status_changed_at ?? null,
    admission_type: coerceEnum(profile?.admission_type, admissionTypeOptions),
    admission_date: profile?.admission_date ?? null,
    discharge_prediction_date: profile?.discharge_prediction_date ?? null,
    discharge_date: profile?.discharge_date ?? null,
    admission_source: profile?.admission_source ?? null,
    demand_origin: profile?.demand_origin ?? null,
    demand_origin_description: profile?.demand_origin_description ?? null,
    acquisition_channel: profile?.acquisition_channel ?? null,
    service_package_name: profile?.service_package_name ?? null,
    service_package_description: profile?.service_package_description ?? null,
    policy_profile_id: profile?.policy_profile_id ?? null,
    contract_id: profile?.contract_id ?? null,
    external_contract_id: profile?.external_contract_id ?? null,
    contract_start_date: profile?.contract_start_date ?? null,
    contract_end_date: profile?.contract_end_date ?? null,
    contract_status: coerceEnum(profile?.contract_status, contractStatusOptions),
    contract_status_reason: profile?.contract_status_reason ?? null,
    contract_category: coerceEnum(profile?.contract_category, contractCategoryOptions),
    renewal_type: coerceEnum(profile?.renewal_type, renewalTypeOptions),
    authorization_number: profile?.authorization_number ?? null,
    judicial_case_number: profile?.judicial_case_number ?? null,
    official_letter_number: profile?.official_letter_number ?? null,
    cost_center_id: profile?.cost_center_id ?? null,
    erp_case_code: profile?.erp_case_code ?? null,
    commercial_responsible_id: profile?.commercial_responsible_id ?? null,
    contract_manager_id: profile?.contract_manager_id ?? null,
    payer_admin_contact_id: profile?.payer_admin_contact_id ?? null,
    payer_admin_contact_description: profile?.payer_admin_contact_description ?? null,
    primary_payer_entity_id: profile?.primary_payer_entity_id ?? null,
    primary_payer_related_person_id: profile?.primary_payer_related_person_id ?? null,
    payer_relation: profile?.payer_relation ?? null,
    financial_responsible_name: profile?.financial_responsible_name ?? null,
    financial_responsible_contact: profile?.financial_responsible_contact ?? null,
    bond_type: coerceEnum(profile?.bond_type, bondTypeOptions),
    insurer_name: profile?.insurer_name ?? null,
    plan_name: profile?.plan_name ?? null,
    insurance_card_number: profile?.insurance_card_number ?? null,
    insurance_card_validity: profile?.insurance_card_validity ?? null,
    monthly_fee: profile?.monthly_fee ?? null,
    billing_due_day: profile?.billing_due_day ?? null,
    billing_status: coerceEnum(profile?.billing_status, billingStatusOptions),
    payment_method: coerceEnum(profile?.payment_method, paymentMethodOptions),
    billing_model: coerceEnum(profile?.billing_model, billingModelOptions),
    billing_base_value: profile?.billing_base_value ?? null,
    billing_periodicity: profile?.billing_periodicity ?? null,
    payment_terms: profile?.payment_terms ?? null,
    grace_period_days: profile?.grace_period_days ?? null,
    copay_percent: profile?.copay_percent ?? null,
    readjustment_index: profile?.readjustment_index ?? null,
    readjustment_month: profile?.readjustment_month ?? null,
    late_fee_percent: profile?.late_fee_percent ?? null,
    daily_interest_percent: profile?.daily_interest_percent ?? null,
    discount_early_payment: profile?.discount_early_payment ?? null,
    discount_days_limit: profile?.discount_days_limit ?? null,
    card_holder_name: profile?.card_holder_name ?? null,
    invoice_delivery_method: coerceEnum(profile?.invoice_delivery_method, invoiceDeliveryMethodOptions),
    receiving_account_info: profile?.receiving_account_info ?? null,
    financial_notes: profile?.financial_notes ?? null,
    checklist_complete: profile?.checklist_complete ?? false,
    checklist_notes: profile?.checklist_notes ?? null,
    admin_notes: profile?.admin_notes ?? null,
  };
}

const checklistLabels: Record<(typeof checklistItemCodeOptions)[number], string> = {
  CONTRACT: 'Contrato assinado',
  CONSENT: 'Consentimento',
  MEDICAL_REPORT: 'Relatorio medico',
  LEGAL_DOCS: 'Documentos legais',
  FINANCIAL_DOCS: 'Documentos financeiros',
  JUDICIAL: 'Documentacao judicial',
  ADDRESS_PROOF: 'Comprovante de endereco',
  LEGAL_GUARDIAN_DOCS: 'Docs responsavel legal',
  FINANCIAL_RESPONSIBLE_DOCS: 'Docs responsavel financeiro',
  OTHER_DOCS: 'Outros documentos',
};

export const AdminFinancialTab = forwardRef<AdminFinancialTabHandle, AdminFinancialTabProps>(function AdminFinancialTab(
  { patientId, onStatusChange, onStatusSummary },
  ref,
) {
  const styles = useStyles();
  const toasterId = useId('aba04-toaster');
  const { dispatchToast } = useToastController(toasterId);
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminFinancialData>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [checklistDraft, setChecklistDraft] = useState<OnboardingChecklistItemInput[]>([]);
  const [newPayerDraft, setNewPayerDraft] = useState<BillingEntityInput | null>(null);
  const [signatureTitle, setSignatureTitle] = useState('Contrato');
  const [signatureProvider, setSignatureProvider] = useState('');
  const [ingestionItemCode, setIngestionItemCode] = useState<OnboardingChecklistItemInput['item_code']>(
    checklistItemCodeOptions[0],
  );
  const [ingestionTitle, setIngestionTitle] = useState('');
  const [ingestionProvider, setIngestionProvider] = useState('');
  const [billingProvider, setBillingProvider] = useState('');
  const [billingReference, setBillingReference] = useState('');
  const [billingPeriodStart, setBillingPeriodStart] = useState('');
  const [billingPeriodEnd, setBillingPeriodEnd] = useState('');
  const [billingNote, setBillingNote] = useState('');
  const [isIntegrationBusy, setIsIntegrationBusy] = useState(false);

  const { control, handleSubmit, reset, setError } = useForm<AdminFinancialProfileInput>({
    defaultValues: buildDefaultValues(null),
  });

  const profile = data?.profile ?? null;
  const billingEntities = data?.billingEntities ?? [];
  const policyProfiles = data?.policyProfiles ?? [];
  const relatedPersons = data?.relatedPersons ?? [];
  const integrationDisabled = isSaving || isIntegrationBusy;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const loaded = await getAdminFinancialData(patientId);
      setData(loaded);
      reset(buildDefaultValues(loaded.profile));
      setChecklistDraft(
        (loaded.checklist ?? []).map((item) => ({
          item_code: item.item_code as OnboardingChecklistItemInput['item_code'],
          item_description: item.item_description ?? null,
          is_completed: Boolean(item.is_completed),
          completed_at: item.completed_at ?? null,
          completed_by_user_id: item.completed_by_user_id ?? null,
          completed_by_label: item.completed_by_label ?? null,
          document_id: item.document_id ?? null,
        })),
      );
      setNewPayerDraft(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Falha ao carregar administrativo/financeiro');
    } finally {
      setIsLoading(false);
    }
  }, [patientId, reset]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    onStatusChange?.({ isEditing, isSaving });
  }, [isEditing, isSaving, onStatusChange]);

  useEffect(() => {
    if (!onStatusSummary) return;
    const profileRow = data?.profile ?? null;
    const policyName = data?.policyProfiles.find((item) => item.id === profileRow?.policy_profile_id)?.name ?? null;
    onStatusSummary({
      contract_status: profileRow?.contract_status ?? null,
      administrative_status: profileRow?.administrative_status ?? null,
      billing_status: profileRow?.billing_status ?? null,
      checklist_complete: profileRow?.checklist_complete ?? false,
      policy_profile_name: policyName,
    });
  }, [data, onStatusSummary]);

  const handleSendSignature = useCallback(async () => {
    setIsIntegrationBusy(true);
    try {
      const title = signatureTitle.trim() || 'Contrato';
      await sendContractForSignature(patientId, {
        title,
        provider: signatureProvider.trim() || undefined,
        category: 'legal',
      });
      dispatchToast(
        <Toast>
          <ToastTitle>Contrato enviado para assinatura.</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      await loadData();
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao enviar para assinatura'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setIsIntegrationBusy(false);
    }
  }, [dispatchToast, loadData, patientId, signatureProvider, signatureTitle]);

  const handleRequestIngestion = useCallback(async () => {
    setIsIntegrationBusy(true);
    try {
      const itemCode = ingestionItemCode;
      const title = ingestionTitle.trim() || checklistLabels[itemCode];
      const existing = data?.checklist?.find((item) => item.item_code === itemCode) ?? null;

      if (!existing) {
        await updateOnboardingChecklist(patientId, [
          {
            item_code: itemCode,
            item_description: title,
            is_completed: false,
          },
        ]);
      }

      await requestChecklistDocumentIngestion(patientId, {
        item_code: itemCode,
        title,
        provider: ingestionProvider.trim() || undefined,
        document_id: existing?.document_id ?? null,
      });

      dispatchToast(
        <Toast>
          <ToastTitle>Ingestao de documento solicitada.</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      await loadData();
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao solicitar ingestao'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setIsIntegrationBusy(false);
    }
  }, [data?.checklist, dispatchToast, ingestionItemCode, ingestionProvider, ingestionTitle, loadData, patientId]);

  const handleBillingExport = useCallback(async () => {
    setIsIntegrationBusy(true);
    try {
      await sendBillingExport(patientId, {
        provider: billingProvider.trim() || undefined,
        reference: billingReference.trim() || undefined,
        period_start: billingPeriodStart || undefined,
        period_end: billingPeriodEnd || undefined,
        note: billingNote.trim() || undefined,
      });
      dispatchToast(
        <Toast>
          <ToastTitle>Exportacao enviada para o provedor.</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      await loadData();
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao exportar faturamento'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setIsIntegrationBusy(false);
    }
  }, [
    billingNote,
    billingPeriodEnd,
    billingPeriodStart,
    billingProvider,
    billingReference,
    dispatchToast,
    loadData,
    patientId,
  ]);

  const handleBillingReconcile = useCallback(async () => {
    setIsIntegrationBusy(true);
    try {
      await reconcileBillingStatus(patientId, {
        provider: billingProvider.trim() || undefined,
        reference: billingReference.trim() || undefined,
        note: billingNote.trim() || undefined,
      });
      dispatchToast(
        <Toast>
          <ToastTitle>Reconciliacao solicitada.</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      await loadData();
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao reconciliar faturamento'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setIsIntegrationBusy(false);
    }
  }, [billingNote, billingProvider, billingReference, dispatchToast, loadData, patientId]);

  const renderDefinitionList = useCallback(
    (items: { label: string; value?: string | number | null }[]) => (
      <dl className={styles.definitionList}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'contents' }}>
            <dt>{item.label}</dt>
            <dd>{item.value ?? '—'}</dd>
          </div>
        ))}
      </dl>
    ),
    [styles.definitionList],
  );

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    reset(buildDefaultValues(profile));
    setChecklistDraft(
      (data?.checklist ?? []).map((item) => ({
        item_code: item.item_code as OnboardingChecklistItemInput['item_code'],
        item_description: item.item_description ?? null,
        is_completed: Boolean(item.is_completed),
        completed_at: item.completed_at ?? null,
        completed_by_user_id: item.completed_by_user_id ?? null,
        completed_by_label: item.completed_by_label ?? null,
        document_id: item.document_id ?? null,
      })),
    );
    setNewPayerDraft(null);
    setIsEditing(false);
  }, [data?.checklist, profile, reset]);

  const handleSave = useCallback(() => {
    void handleSubmit(async (values) => {
      const parsed = adminFinancialProfileSchema.safeParse(values);
      if (!parsed.success) {
        parsed.error.errors.forEach((issue) => {
          const field = issue.path[0] as FieldPath<AdminFinancialProfileInput> | undefined;
          if (field) {
            setError(field, { message: issue.message });
          }
        });
        dispatchToast(
          <Toast>
            <ToastTitle>Confira os campos obrigatorios antes de salvar.</ToastTitle>
          </Toast>,
          { intent: 'warning' },
        );
        return;
      }

      setIsSaving(true);
      try {
        const initialPayerId = profile?.primary_payer_entity_id ?? null;
        await updateAdminInfo(patientId, parsed.data);
        await updateFinancialProfile(patientId, parsed.data);

        if (newPayerDraft?.name && newPayerDraft.kind) {
          const created = await upsertBillingEntity(newPayerDraft);
          await setPrimaryPayerEntity(patientId, created.id);
          parsed.data.primary_payer_entity_id = created.id;
        } else if (parsed.data.primary_payer_entity_id && parsed.data.primary_payer_entity_id !== initialPayerId) {
          await setPrimaryPayerEntity(patientId, parsed.data.primary_payer_entity_id);
        }

        if (checklistDraft.length > 0) {
          await updateOnboardingChecklist(patientId, checklistDraft);
        }

        dispatchToast(
          <Toast>
            <ToastTitle>Administrativo e financeiro atualizados.</ToastTitle>
          </Toast>,
          { intent: 'success' },
        );

        setIsEditing(false);
        await loadData();
      } catch (error) {
        dispatchToast(
          <Toast>
            <ToastTitle>
              {error instanceof Error ? error.message : 'Falha ao salvar administrativo/financeiro'}
            </ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
      } finally {
        setIsSaving(false);
      }
    })();
  }, [
    checklistDraft,
    dispatchToast,
    handleSubmit,
    loadData,
    newPayerDraft,
    patientId,
    profile?.primary_payer_entity_id,
    setError,
  ]);

  const handleReload = useCallback(() => {
    void loadData();
  }, [loadData]);

  useImperativeHandle(
    ref,
    () => ({
      save: handleSave,
      startEdit: handleStartEdit,
      cancelEdit: handleCancelEdit,
      reload: handleReload,
    }),
    [handleCancelEdit, handleReload, handleSave, handleStartEdit],
  );

  const fieldInput = (
    name: FieldPath<AdminFinancialProfileInput>,
    label: string,
    type: 'text' | 'date' | 'number' = 'text',
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field label={label} validationMessage={fieldState.error?.message}>
          <Input
            value={field.value ? String(field.value) : ''}
            type={type}
            onChange={(event) => {
              if (type === 'number') {
                const value = event.target.value;
                field.onChange(value === '' ? null : Number(value));
              } else {
                field.onChange(event.target.value);
              }
            }}
            disabled={!isEditing}
          />
        </Field>
      )}
    />
  );

  const fieldSelect = (
    name: FieldPath<AdminFinancialProfileInput>,
    label: string,
    options: readonly string[],
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field label={label}>
          <Select
            value={typeof field.value === 'string' ? field.value : ''}
            onChange={(event) => field.onChange(event.target.value || null)}
            disabled={!isEditing}
          >
            <option value="">—</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {formatEnum(option)}
              </option>
            ))}
          </Select>
        </Field>
      )}
    />
  );

  const fieldTextarea = (name: FieldPath<AdminFinancialProfileInput>, label: string) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field label={label}>
          <Textarea
            value={field.value ? String(field.value) : ''}
            onChange={(event) => field.onChange(event.target.value)}
            disabled={!isEditing}
          />
        </Field>
      )}
    />
  );

  if (isLoading) {
    return (
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Spinner size="medium" />
        <div>Carregando administrativo/financeiro...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Erro ao carregar</div>
          <Button appearance="subtle" icon={<ArrowClockwiseRegular />} onClick={handleReload}>
            Recarregar
          </Button>
        </div>
        <div className={styles.cardBody}>
          <p className={styles.muted}>{loadError}</p>
        </div>
      </section>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster toasterId={toasterId} />
      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <section className={`${styles.card} ${styles.cardSpan}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Identificacao contratual / status</div>
              {!isEditing && (
                <div className={styles.badgeRow}>
                  <Badge appearance="outline">{formatEnum(profile?.contract_status)}</Badge>
                  <Badge appearance="outline">{formatEnum(profile?.administrative_status)}</Badge>
                  <Badge appearance="outline">{formatEnum(profile?.billing_status)}</Badge>
                </div>
              )}
            </div>
            <div className={styles.cardBody}>
              {!isEditing && (
                <>
                  {renderDefinitionList([
                    { label: 'Status administrativo', value: formatEnum(profile?.administrative_status) },
                    { label: 'Motivo', value: profile?.administrative_status_reason },
                    { label: 'Status contrato', value: formatEnum(profile?.contract_status) },
                    { label: 'Motivo contrato', value: profile?.contract_status_reason },
                    { label: 'Categoria contrato', value: formatEnum(profile?.contract_category) },
                    { label: 'Tipo renovacao', value: formatEnum(profile?.renewal_type) },
                    { label: 'Inicio contrato', value: profile?.contract_start_date },
                    { label: 'Fim contrato', value: profile?.contract_end_date },
                    { label: 'Inicio admissao', value: profile?.admission_date },
                    { label: 'Previsao alta', value: profile?.discharge_prediction_date },
                    { label: 'Data alta', value: profile?.discharge_date },
                    { label: 'Origem admissao', value: profile?.admission_source },
                    { label: 'Origem demanda', value: profile?.demand_origin },
                    { label: 'Canal aquisicao', value: profile?.acquisition_channel },
                    { label: 'Pacote servico', value: profile?.service_package_name },
                    { label: 'Descricao pacote', value: profile?.service_package_description },
                  ])}
                </>
              )}
              {isEditing && (
                <div className={styles.formGrid}>
                  {fieldSelect('administrative_status', 'Status administrativo', administrativeStatusOptions)}
                  {fieldInput('administrative_status_reason', 'Motivo do status')}
                  {fieldSelect('contract_status', 'Status do contrato', contractStatusOptions)}
                  {fieldInput('contract_status_reason', 'Motivo do contrato')}
                  {fieldSelect('contract_category', 'Categoria do contrato', contractCategoryOptions)}
                  {fieldSelect('renewal_type', 'Tipo de renovacao', renewalTypeOptions)}
                  {fieldInput('contract_id', 'Identificador do contrato')}
                  {fieldInput('external_contract_id', 'Contrato externo')}
                  {fieldInput('contract_start_date', 'Inicio contrato', 'date')}
                  {fieldInput('contract_end_date', 'Fim contrato', 'date')}
                  {fieldSelect('admission_type', 'Tipo de admissao', admissionTypeOptions)}
                  {fieldInput('admission_date', 'Data admissao', 'date')}
                  {fieldInput('discharge_prediction_date', 'Previsao alta', 'date')}
                  {fieldInput('discharge_date', 'Data alta', 'date')}
                  {fieldInput('admission_source', 'Origem admissao')}
                  {fieldInput('demand_origin', 'Origem demanda')}
                  {fieldInput('demand_origin_description', 'Descricao origem')}
                  {fieldInput('acquisition_channel', 'Canal aquisicao')}
                  {fieldInput('service_package_name', 'Pacote servico')}
                  {fieldInput('service_package_description', 'Descricao pacote')}
                  {fieldInput('authorization_number', 'Numero autorizacao')}
                  {fieldInput('judicial_case_number', 'Processo judicial')}
                  {fieldInput('official_letter_number', 'Numero de oficio')}
                  {fieldInput('cost_center_id', 'Centro de custo')}
                  {fieldInput('erp_case_code', 'Codigo ERP')}
                  <Controller
                    name="policy_profile_id"
                    control={control}
                    render={({ field }) => (
                      <Field label="Perfil de regras">
                        <Select
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value || null)}
                          disabled={!isEditing}
                        >
                          <option value="">—</option>
                          {policyProfiles.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    )}
                  />
                </div>
              )}
            </div>
          </section>

          <section className={`${styles.card} ${styles.cardSpan}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Configuracao de faturamento</div>
            </div>
            <div className={styles.cardBody}>
              {!isEditing && (
                <>
                  {renderDefinitionList([
                    { label: 'Tipo vinculo', value: formatEnum(profile?.bond_type) },
                    { label: 'Operadora', value: profile?.insurer_name },
                    { label: 'Plano', value: profile?.plan_name },
                    { label: 'Carteirinha', value: profile?.insurance_card_number },
                    { label: 'Validade carteirinha', value: profile?.insurance_card_validity },
                    { label: 'Mensalidade', value: profile?.monthly_fee ?? '—' },
                    { label: 'Dia vencimento', value: profile?.billing_due_day ?? '—' },
                    { label: 'Status cobranca', value: formatEnum(profile?.billing_status) },
                    { label: 'Forma pagamento', value: formatEnum(profile?.payment_method) },
                    { label: 'Modelo cobranca', value: formatEnum(profile?.billing_model) },
                    { label: 'Valor base', value: profile?.billing_base_value ?? '—' },
                    { label: 'Periodicidade', value: profile?.billing_periodicity },
                    { label: 'Condicoes pagamento', value: profile?.payment_terms },
                    { label: 'Carencia (dias)', value: profile?.grace_period_days ?? '—' },
                    { label: 'Coparticipacao %', value: profile?.copay_percent ?? '—' },
                    { label: 'Indice reajuste', value: profile?.readjustment_index },
                    { label: 'Mes reajuste', value: profile?.readjustment_month ?? '—' },
                    { label: 'Multa atraso %', value: profile?.late_fee_percent ?? '—' },
                    { label: 'Juros diarios %', value: profile?.daily_interest_percent ?? '—' },
                    { label: 'Desconto antecipado', value: profile?.discount_early_payment ?? '—' },
                    { label: 'Limite desconto (dias)', value: profile?.discount_days_limit ?? '—' },
                    { label: 'Titular cartao', value: profile?.card_holder_name },
                    { label: 'Envio fatura', value: formatEnum(profile?.invoice_delivery_method) },
                    { label: 'Conta recebimento', value: profile?.receiving_account_info },
                  ])}
                </>
              )}
              {isEditing && (
                <div className={styles.formGrid}>
                  {fieldSelect('bond_type', 'Tipo vinculo', bondTypeOptions)}
                  {fieldInput('insurer_name', 'Operadora')}
                  {fieldInput('plan_name', 'Plano')}
                  {fieldInput('insurance_card_number', 'Carteirinha')}
                  {fieldInput('insurance_card_validity', 'Validade', 'date')}
                  {fieldInput('monthly_fee', 'Mensalidade', 'number')}
                  {fieldInput('billing_due_day', 'Dia vencimento', 'number')}
                  {fieldSelect('billing_status', 'Status cobranca', billingStatusOptions)}
                  {fieldSelect('payment_method', 'Forma pagamento', paymentMethodOptions)}
                  {fieldSelect('billing_model', 'Modelo cobranca', billingModelOptions)}
                  {fieldInput('billing_base_value', 'Valor base', 'number')}
                  {fieldInput('billing_periodicity', 'Periodicidade')}
                  {fieldInput('payment_terms', 'Condicoes pagamento')}
                  {fieldInput('grace_period_days', 'Carencia (dias)', 'number')}
                  {fieldInput('copay_percent', 'Coparticipacao %', 'number')}
                  {fieldInput('readjustment_index', 'Indice reajuste')}
                  {fieldInput('readjustment_month', 'Mes reajuste', 'number')}
                  {fieldInput('late_fee_percent', 'Multa %', 'number')}
                  {fieldInput('daily_interest_percent', 'Juros %', 'number')}
                  {fieldInput('discount_early_payment', 'Desconto antecipado', 'number')}
                  {fieldInput('discount_days_limit', 'Limite desconto (dias)', 'number')}
                  {fieldInput('card_holder_name', 'Titular cartao')}
                  {fieldSelect('invoice_delivery_method', 'Envio fatura', invoiceDeliveryMethodOptions)}
                  {fieldInput('receiving_account_info', 'Conta recebimento')}
                  {fieldTextarea('financial_notes', 'Observacoes financeiras')}
                </div>
              )}
            </div>
          </section>

          <section className={`${styles.card} ${styles.cardSpan}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Integracoes & IA</div>
              {isIntegrationBusy && <Spinner size="extra-tiny" />}
            </div>
            <div className={styles.cardBody}>
              <div className={styles.integrationBlock}>
                <div className={styles.formGrid}>
                  <Field label="Titulo do contrato">
                    <Input
                      value={signatureTitle}
                      onChange={(event) => setSignatureTitle(event.target.value)}
                      disabled={integrationDisabled}
                    />
                  </Field>
                  <Field label="Provider assinatura (opcional)">
                    <Input
                      value={signatureProvider}
                      onChange={(event) => setSignatureProvider(event.target.value)}
                      disabled={integrationDisabled}
                    />
                  </Field>
                </div>
                <div className={styles.inlineActions}>
                  <Button appearance="primary" onClick={handleSendSignature} disabled={integrationDisabled}>
                    Enviar para assinatura
                  </Button>
                </div>
                <p className={styles.muted}>Provider em branco usa fallback manual.</p>
              </div>

              <div className={styles.integrationDivider}>
                <div className={styles.integrationBlock}>
                  <div className={styles.formGrid}>
                    <Field label="Item do checklist">
                      <Select
                        value={ingestionItemCode}
                        onChange={(event) =>
                          setIngestionItemCode(event.target.value as OnboardingChecklistItemInput['item_code'])
                        }
                        disabled={integrationDisabled}
                      >
                        {checklistItemCodeOptions.map((option) => (
                          <option key={option} value={option}>
                            {checklistLabels[option]}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Titulo do documento">
                      <Input
                        value={ingestionTitle}
                        placeholder={checklistLabels[ingestionItemCode]}
                        onChange={(event) => setIngestionTitle(event.target.value)}
                        disabled={integrationDisabled}
                      />
                    </Field>
                    <Field label="Provider ingestao (opcional)">
                      <Input
                        value={ingestionProvider}
                        onChange={(event) => setIngestionProvider(event.target.value)}
                        disabled={integrationDisabled}
                      />
                    </Field>
                  </div>
                  <div className={styles.inlineActions}>
                    <Button appearance="primary" onClick={handleRequestIngestion} disabled={integrationDisabled}>
                      Solicitar ingestao
                    </Button>
                  </div>
                  <p className={styles.muted}>Registra evento e vincula documento ao checklist.</p>
                </div>
              </div>

              <div className={styles.integrationDivider}>
                <div className={styles.integrationBlock}>
                  <div className={styles.formGrid}>
                    <Field label="Provider billing/ERP (opcional)">
                      <Input
                        value={billingProvider}
                        onChange={(event) => setBillingProvider(event.target.value)}
                        disabled={integrationDisabled}
                      />
                    </Field>
                    <Field label="Referencia">
                      <Input
                        value={billingReference}
                        onChange={(event) => setBillingReference(event.target.value)}
                        disabled={integrationDisabled}
                      />
                    </Field>
                    <Field label="Periodo inicio">
                      <Input
                        type="date"
                        value={billingPeriodStart}
                        onChange={(event) => setBillingPeriodStart(event.target.value)}
                        disabled={integrationDisabled}
                      />
                    </Field>
                    <Field label="Periodo fim">
                      <Input
                        type="date"
                        value={billingPeriodEnd}
                        onChange={(event) => setBillingPeriodEnd(event.target.value)}
                        disabled={integrationDisabled}
                      />
                    </Field>
                  </div>
                  <div className={styles.formGridFull}>
                    <Field label="Observacoes">
                      <Textarea
                        value={billingNote}
                        onChange={(event) => setBillingNote(event.target.value)}
                        disabled={integrationDisabled}
                      />
                    </Field>
                  </div>
                  <div className={styles.inlineActions}>
                    <Button appearance="primary" onClick={handleBillingExport} disabled={integrationDisabled}>
                      Enviar exportacao
                    </Button>
                    <Button appearance="secondary" onClick={handleBillingReconcile} disabled={integrationDisabled}>
                      Solicitar reconciliacao
                    </Button>
                  </div>
                  <p className={styles.muted}>Eventos de export/reconcile sao gravados na timeline.</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        <aside className={styles.rightCol}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Responsaveis internos</div>
            </div>
            <div className={styles.cardBody}>
              {!isEditing && (
                <>
                  {renderDefinitionList([
                    { label: 'Responsavel comercial', value: profile?.commercial_responsible_id },
                    { label: 'Gestor contrato', value: profile?.contract_manager_id },
                    { label: 'Contato pagador', value: profile?.payer_admin_contact_id },
                    { label: 'Descricao contato', value: profile?.payer_admin_contact_description },
                    { label: 'Resp. financeiro', value: profile?.financial_responsible_name },
                    { label: 'Contato financeiro', value: profile?.financial_responsible_contact },
                  ])}
                </>
              )}
              {isEditing && (
                <div className={styles.formGridFull}>
                  {fieldInput('commercial_responsible_id', 'Responsavel comercial (UUID)')}
                  {fieldInput('contract_manager_id', 'Gestor do contrato (UUID)')}
                  <Controller
                    name="payer_admin_contact_id"
                    control={control}
                    render={({ field }) => (
                      <Field label="Contato administrativo do pagador">
                        <Select
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value || null)}
                          disabled={!isEditing}
                        >
                          <option value="">—</option>
                          {relatedPersons.map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.name}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    )}
                  />
                  {fieldInput('payer_admin_contact_description', 'Descricao contato')}
                  {fieldInput('financial_responsible_name', 'Responsavel financeiro')}
                  {fieldInput('financial_responsible_contact', 'Contato financeiro')}
                </div>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Pagador</div>
              {isEditing && (
                <Button
                  appearance="subtle"
                  icon={<AddRegular />}
                  onClick={() =>
                    setNewPayerDraft({
                      kind: 'person',
                      name: '',
                      legal_name: null,
                      doc_type: null,
                      doc_number: null,
                      contact_email: null,
                      contact_phone: null,
                      billing_address_cep: null,
                      billing_address_street: null,
                      billing_address_number: null,
                      billing_address_neighborhood: null,
                      billing_address_city: null,
                      billing_address_state: null,
                    })
                  }
                >
                  Novo pagador
                </Button>
              )}
            </div>
            <div className={styles.cardBody}>
              {!isEditing && (
                <>
                  {renderDefinitionList([
                    { label: 'Pagador', value: data?.payer?.name ?? '—' },
                    { label: 'Tipo', value: resolveBillingEntityKindLabel(data?.payer?.kind) },
                    { label: 'Documento', value: data?.payer?.doc_number ?? '—' },
                    { label: 'Contato', value: data?.payer?.contact_email ?? data?.payer?.contact_phone ?? '—' },
                  ])}
                </>
              )}
              {isEditing && (
                <div className={styles.formGridFull}>
                  <Controller
                    name="primary_payer_entity_id"
                    control={control}
                    render={({ field }) => (
                      <Field label="Pagador principal">
                        <Select
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value || null)}
                          disabled={!isEditing}
                        >
                          <option value="">—</option>
                          {billingEntities.map((entity) => (
                            <option key={entity.id} value={entity.id}>
                              {entity.name} · {resolveBillingEntityKindLabel(entity.kind)}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    )}
                  />
                  {fieldInput('payer_relation', 'Relacao com paciente')}
                  {newPayerDraft && (
                    <div className={styles.formGridFull}>
                      <Field label="Tipo de pagador">
                        <Select
                          value={newPayerDraft.kind}
                          onChange={(event) =>
                            setNewPayerDraft((prev) => (prev ? { ...prev, kind: event.target.value as BillingEntityInput['kind'] } : prev))
                          }
                        >
                          {billingEntityKindOptions.map((option) => (
                            <option key={option} value={option}>
                              {billingEntityKindLabels[option]}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Nome do pagador" required>
                        <Input
                          value={newPayerDraft.name}
                          onChange={(event) =>
                            setNewPayerDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                          }
                        />
                      </Field>
                      <Field label="Razao social">
                        <Input
                          value={newPayerDraft.legal_name ?? ''}
                          onChange={(event) =>
                            setNewPayerDraft((prev) => (prev ? { ...prev, legal_name: event.target.value } : prev))
                          }
                        />
                      </Field>
                      <Field label="Tipo de documento">
                        <Input
                          value={newPayerDraft.doc_type ?? ''}
                          onChange={(event) =>
                            setNewPayerDraft((prev) => (prev ? { ...prev, doc_type: event.target.value } : prev))
                          }
                        />
                      </Field>
                      <Field label="Documento">
                        <Input
                          value={newPayerDraft.doc_number ?? ''}
                          onChange={(event) =>
                            setNewPayerDraft((prev) => (prev ? { ...prev, doc_number: event.target.value } : prev))
                          }
                        />
                      </Field>
                      <Field label="Email">
                        <Input
                          value={newPayerDraft.contact_email ?? ''}
                          onChange={(event) =>
                            setNewPayerDraft((prev) => (prev ? { ...prev, contact_email: event.target.value } : prev))
                          }
                        />
                      </Field>
                      <Field label="Telefone">
                        <Input
                          value={newPayerDraft.contact_phone ?? ''}
                          onChange={(event) =>
                            setNewPayerDraft((prev) => (prev ? { ...prev, contact_phone: event.target.value } : prev))
                          }
                        />
                      </Field>
                      <Field label="CEP cobranca">
                        <Input
                          value={newPayerDraft.billing_address_cep ?? ''}
                          onChange={(event) =>
                            setNewPayerDraft((prev) =>
                              prev ? { ...prev, billing_address_cep: event.target.value } : prev,
                            )
                          }
                        />
                      </Field>
                      <Field label="Rua cobranca">
                        <Input
                          value={newPayerDraft.billing_address_street ?? ''}
                          onChange={(event) =>
                            setNewPayerDraft((prev) =>
                              prev ? { ...prev, billing_address_street: event.target.value } : prev,
                            )
                          }
                        />
                      </Field>
                      <Field label="Numero cobranca">
                        <Input
                          value={newPayerDraft.billing_address_number ?? ''}
                          onChange={(event) =>
                            setNewPayerDraft((prev) =>
                              prev ? { ...prev, billing_address_number: event.target.value } : prev,
                            )
                          }
                        />
                      </Field>
                      <Field label="Bairro cobranca">
                        <Input
                          value={newPayerDraft.billing_address_neighborhood ?? ''}
                          onChange={(event) =>
                            setNewPayerDraft((prev) =>
                              prev ? { ...prev, billing_address_neighborhood: event.target.value } : prev,
                            )
                          }
                        />
                      </Field>
                      <Field label="Cidade cobranca">
                        <Input
                          value={newPayerDraft.billing_address_city ?? ''}
                          onChange={(event) =>
                            setNewPayerDraft((prev) =>
                              prev ? { ...prev, billing_address_city: event.target.value } : prev,
                            )
                          }
                        />
                      </Field>
                      <Field label="UF cobranca">
                        <Input
                          value={newPayerDraft.billing_address_state ?? ''}
                          onChange={(event) =>
                            setNewPayerDraft((prev) =>
                              prev ? { ...prev, billing_address_state: event.target.value } : prev,
                            )
                          }
                        />
                      </Field>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Checklist de implantacao</div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.checklistList}>
                {checklistItemCodeOptions.map((code) => {
                  const item = checklistDraft.find((entry) => entry.item_code === code);
                  const isCompleted = Boolean(item?.is_completed);
                  return (
                    <div key={code} className={styles.checklistItem}>
                      <div>
                        <strong>{checklistLabels[code]}</strong>
                        <div className={styles.checklistMeta}>
                          {item?.completed_at ? `Concluido em ${item.completed_at}` : 'Nao concluido'}
                        </div>
                      </div>
                      {isEditing ? (
                        <Checkbox
                          checked={isCompleted}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setChecklistDraft((prev) => {
                              const next = [...prev];
                              const idx = next.findIndex((entry) => entry.item_code === code);
                              if (idx >= 0) {
                                next[idx] = {
                                  ...next[idx],
                                  is_completed: checked,
                                  completed_at: checked ? new Date().toISOString() : null,
                                };
                              } else {
                                next.push({
                                  item_code: code,
                                  is_completed: checked,
                                  completed_at: checked ? new Date().toISOString() : null,
                                });
                              }
                              return next;
                            });
                          }}
                        />
                      ) : (
                        <Badge appearance="outline" color={isCompleted ? 'success' : 'subtle'}>
                          {isCompleted ? 'Concluido' : 'Pendente'}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className={styles.formGridFull} style={{ marginTop: '12px' }}>
                {fieldTextarea('checklist_notes', 'Observacoes do checklist')}
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Notas administrativas</div>
            </div>
            <div className={styles.cardBody}>{fieldTextarea('admin_notes', 'Observacoes administrativas')}</div>
          </section>
        </aside>
      </div>
    </div>
  );
});
