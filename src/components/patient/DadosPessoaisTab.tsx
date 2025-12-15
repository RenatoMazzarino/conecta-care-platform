'use client';

import {
  makeStyles,
  mergeClasses,
  tokens,
  Button,
  Spinner,
  Toaster,
  Toast,
  ToastTitle,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { ArrowClockwiseRegular } from '@fluentui/react-icons';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import type { Json } from '@/types/supabase';
import type { PatientRow } from '@/features/pacientes/actions/getPatientById';
import { getPatientById } from '@/features/pacientes/actions/getPatientById';
import { updatePatientDadosPessoais } from '@/features/pacientes/actions/updatePatientDadosPessoais';
import { DadosPessoaisOnboardingForm } from '@/features/pacientes/ui/onboarding/DadosPessoaisOnboardingForm';
import {
  patientDadosPessoaisUpdateSchema,
  type PatientDadosPessoaisUpdate,
  genderOptions,
  civilStatusOptions,
  genderIdentityOptions,
  pronounsOptions,
  educationLevelOptions,
  raceColorOptions,
  prefContactMethodOptions,
  contactTimePreferenceOptions,
  cpfStatusOptions,
  docValidationStatusOptions,
  marketingConsentStatusOptions,
  marketingConsentSourceOptions,
  recordStatusOptions,
} from '@/features/pacientes/schemas/aba01DadosPessoais';

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
    display: 'grid',
    gridTemplateColumns: '180px 1fr',
    rowGap: '10px',
    columnGap: '12px',
    margin: 0,
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
  note: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
  pre: {
    margin: 0,
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    overflow: 'auto',
    maxHeight: '240px',
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
  },
  timelineItem: {
    display: 'flex',
    gap: '10px',
    padding: '10px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    ':last-child': {
      borderBottom: 0,
    },
  },
  timelineBar: {
    width: '3px',
    borderRadius: '2px',
    backgroundColor: '#0f6cbd',
    marginTop: '2px',
  },
  timelineMain: {
    flex: 1,
    minWidth: 0,
  },
  timelineTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    fontSize: '11.5px',
    color: tokens.colorNeutralForeground3,
    marginBottom: '2px',
  },
  timelineTitle: {
    fontWeight: 900,
    fontSize: '12.5px',
    margin: '0 0 2px',
  },
  timelineDesc: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
});

type CommunicationPreferences = { sms: boolean; email: boolean; whatsapp: boolean };
type Draft = PatientDadosPessoaisUpdate;

function asStringOrNull(value: unknown): string | null {
  if (value == null) return null;
  return String(value);
}

function asOptionOrNull<const Options extends readonly string[]>(
  value: string | null,
  options: Options,
): Options[number] | null {
  if (value == null) return null;
  if ((options as readonly string[]).includes(value)) return value as Options[number];
  return null;
}

function defaultCommunicationPreferences(value: Json): CommunicationPreferences {
  const base: CommunicationPreferences = { sms: true, email: true, whatsapp: true };
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return {
      sms: typeof obj.sms === 'boolean' ? obj.sms : base.sms,
      email: typeof obj.email === 'boolean' ? obj.email : base.email,
      whatsapp: typeof obj.whatsapp === 'boolean' ? obj.whatsapp : base.whatsapp,
    };
  }
  return base;
}

function buildDraftFromPatient(patient: PatientRow): Draft {
  return {
    photo_path: patient.photo_path,
    photo_consent: patient.photo_consent,
    photo_consent_date: patient.photo_consent_date,
    full_name: patient.full_name,
    social_name: patient.social_name,
    nickname: patient.nickname,
    salutation: patient.salutation,
    cpf: patient.cpf,
    cpf_status: asOptionOrNull(patient.cpf_status, cpfStatusOptions),
    rg: patient.rg,
    rg_issuer: patient.rg_issuer,
    rg_issuer_state: patient.rg_issuer_state,
    rg_issued_at: patient.rg_issued_at,
    cns: patient.cns,
    national_id: patient.national_id,
    date_of_birth: patient.date_of_birth,
    gender: asOptionOrNull(patient.gender, genderOptions),
    civil_status: asOptionOrNull(patient.civil_status, civilStatusOptions),
    gender_identity: asOptionOrNull(patient.gender_identity, genderIdentityOptions),
    pronouns: asOptionOrNull(patient.pronouns, pronounsOptions),
    nationality: patient.nationality,
    preferred_language: patient.preferred_language,
    education_level: asOptionOrNull(patient.education_level, educationLevelOptions),
    profession: patient.profession,
    race_color: asOptionOrNull(patient.race_color, raceColorOptions),
    is_pcd: patient.is_pcd,
    birth_place: patient.birth_place,
    naturalness_city: patient.naturalness_city,
    naturalness_state: patient.naturalness_state,
    naturalness_country: patient.naturalness_country,
    mother_name: patient.mother_name,
    father_name: patient.father_name,
    mobile_phone: patient.mobile_phone,
    secondary_phone: patient.secondary_phone,
    secondary_phone_type: patient.secondary_phone_type,
    email: patient.email,
    email_verified: patient.email_verified,
    mobile_phone_verified: patient.mobile_phone_verified,
    pref_contact_method: asOptionOrNull(patient.pref_contact_method, prefContactMethodOptions),
    contact_time_preference: asOptionOrNull(patient.contact_time_preference, contactTimePreferenceOptions),
    contact_notes: patient.contact_notes,
    communication_preferences: defaultCommunicationPreferences(patient.communication_preferences),
    doc_validation_status: asOptionOrNull(patient.doc_validation_status, docValidationStatusOptions),
    doc_validation_method: patient.doc_validation_method,
    doc_validation_source: patient.doc_validation_source,
    doc_validated_at: patient.doc_validated_at,
    doc_validated_by: patient.doc_validated_by,
    accept_sms: patient.accept_sms,
    accept_email: patient.accept_email,
    block_marketing: patient.block_marketing,
    marketing_consent_status: asOptionOrNull(patient.marketing_consent_status, marketingConsentStatusOptions),
    marketing_consented_at: patient.marketing_consented_at,
    marketing_consent_source: asOptionOrNull(patient.marketing_consent_source, marketingConsentSourceOptions),
    marketing_consent_ip: asStringOrNull(patient.marketing_consent_ip),
    marketing_consent_history: patient.marketing_consent_history,
    record_status: asOptionOrNull(patient.record_status, recordStatusOptions) ?? 'draft',
    onboarding_step: patient.onboarding_step,
    is_active: patient.is_active,
    primary_contractor_id: patient.primary_contractor_id,
    external_ids: patient.external_ids,
  };
}

function mergeDraft(prev: Draft, patch: Partial<Draft>): Draft {
  return { ...prev, ...patch };
}

function formatText(value: string | null | undefined) {
  if (value == null) return '—';
  const trimmed = value.trim();
  return trimmed === '' ? '—' : trimmed;
}

function formatBool(value: boolean | null | undefined) {
  if (value == null) return '—';
  return value ? 'Sim' : 'Não';
}

function formatDateISO(value: string | null | undefined) {
  if (!value) return '—';
  const parts = value.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return value;
}

function formatTimestamp(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().replace('T', ' ').slice(0, 16);
}

function formatCpf(value: string | null | undefined) {
  const raw = formatText(value);
  if (raw === '—') return raw;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  return raw;
}

function formatPhone(value: string | null | undefined) {
  const raw = formatText(value);
  if (raw === '—') return raw;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return raw;
}

function formatCommunicationPreferences(value: Json) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '—';
  const obj = value as Record<string, unknown>;
  const parts: string[] = [];
  if (obj.whatsapp === true) parts.push('WhatsApp');
  if (obj.email === true) parts.push('E-mail');
  if (obj.sms === true) parts.push('SMS');
  return parts.length ? parts.join(', ') : '—';
}

interface DadosPessoaisTabProps {
  patientId: string;
  onPatientUpdated?: (patient: PatientRow) => void;
  onStatusChange?: (status: { isEditing: boolean; isSaving: boolean }) => void;
}

export interface DadosPessoaisTabHandle {
  startEdit: () => void;
  cancelEdit: () => void;
  reload: () => void;
  save: () => void;
}

export const DadosPessoaisTab = forwardRef<DadosPessoaisTabHandle, DadosPessoaisTabProps>(function DadosPessoaisTab(
  { patientId, onPatientUpdated, onStatusChange },
  ref,
) {
  const styles = useStyles();
  const toasterId = useId('dados-pessoais-toaster');
  const { dispatchToast } = useToastController(toasterId);
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setSaveError(null);

    try {
      const loaded = await getPatientById(patientId);
      setPatient(loaded);
      setDraft(buildDraftFromPatient(loaded));
      onPatientUpdated?.(loaded);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Falha ao carregar paciente');
    } finally {
      setIsLoading(false);
    }
  }, [onPatientUpdated, patientId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const externalIdsText = useMemo(() => {
    if (!patient?.external_ids) return '—';
    try {
      return JSON.stringify(patient.external_ids, null, 2);
    } catch {
      return String(patient.external_ids);
    }
  }, [patient?.external_ids]);

  const handleStartEdit = useCallback(() => {
    if (!patient) return;
    setIsEditing(true);
    setSaveError(null);
    setFieldErrors({});
    setDraft(buildDraftFromPatient(patient));
  }, [patient]);

  const handleCancel = useCallback(() => {
    if (!patient) return;
    setIsEditing(false);
    setSaveError(null);
    setFieldErrors({});
    setDraft(buildDraftFromPatient(patient));
  }, [patient]);

  const handleSave = useCallback(async () => {
    if (!draft) return;
    setSaveError(null);
    setFieldErrors({});

    const parsed = patientDadosPessoaisUpdateSchema.safeParse(draft);
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      const nextErrors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(flattened)) {
        const message = messages?.[0];
        if (message) nextErrors[key] = message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updatePatientDadosPessoais(patientId, parsed.data);
      setPatient(updated);
      setDraft(buildDraftFromPatient(updated));
      onPatientUpdated?.(updated);
      setIsEditing(false);
      dispatchToast(
        <Toast>
          <ToastTitle>Dados pessoais atualizados</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Falha ao salvar');
    } finally {
      setIsSaving(false);
    }
  }, [dispatchToast, draft, onPatientUpdated, patientId]);

  const handleDraftChange = (patch: Partial<Draft>) => {
    setDraft((prev) => (prev ? mergeDraft(prev, patch) : prev));
  };

  useEffect(() => {
    onStatusChange?.({ isEditing, isSaving });
  }, [isEditing, isSaving, onStatusChange]);

  useImperativeHandle(
    ref,
    () => ({
      startEdit: handleStartEdit,
      cancelEdit: handleCancel,
      reload: () => void reload(),
      save: () => void handleSave(),
    }),
    [handleCancel, handleSave, handleStartEdit, reload],
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Spinner label="Carregando dados pessoais..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.container}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Erro ao carregar</div>
            <Button appearance="primary" icon={<ArrowClockwiseRegular />} onClick={() => void reload()}>
              Tentar novamente
            </Button>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.note}>{loadError}</p>
          </div>
        </section>
      </div>
    );
  }

  if (!patient || !draft) {
    return (
      <div className={styles.container}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Paciente não encontrado</div>
            <Button appearance="primary" icon={<ArrowClockwiseRegular />} onClick={() => void reload()}>
              Recarregar
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <Toaster toasterId={toasterId} />
      {isEditing ? (
        <div className={styles.container}>
          <DadosPessoaisOnboardingForm
            patient={patient}
            draft={draft}
            isEditing={isEditing}
            isSaving={isSaving}
            fieldErrors={fieldErrors}
            saveError={saveError}
            externalIdsText={externalIdsText}
            onStartEdit={handleStartEdit}
            onCancel={handleCancel}
            onSave={() => void handleSave()}
            onChange={handleDraftChange}
          />
        </div>
      ) : (
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.leftCol}>
              <section className={mergeClasses(styles.card, styles.cardSpan)}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Informações do paciente</div>
                </div>
                <div className={styles.cardBody}>
                  <dl className={styles.definitionList}>
                    <div style={{ display: 'contents' }}>
                      <dt>Nome completo</dt>
                      <dd>{formatText(patient.full_name)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Nome social</dt>
                      <dd>{formatText(patient.social_name)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Apelido</dt>
                      <dd>{formatText(patient.nickname)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Tratamento</dt>
                      <dd>{formatText(patient.salutation)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Data nasc.</dt>
                      <dd>{formatDateISO(patient.date_of_birth)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Sexo</dt>
                      <dd>{formatText(patient.gender)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Estado civil</dt>
                      <dd>{formatText(patient.civil_status)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Identidade de gênero</dt>
                      <dd>{formatText(patient.gender_identity)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Pronomes</dt>
                      <dd>{formatText(patient.pronouns)}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Documentos</div>
                </div>
                <div className={styles.cardBody}>
                  <dl className={styles.definitionList}>
                    <div style={{ display: 'contents' }}>
                      <dt>CPF</dt>
                      <dd>{formatCpf(patient.cpf)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Status CPF</dt>
                      <dd>{formatText(patient.cpf_status)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>RG</dt>
                      <dd>{formatText(patient.rg)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Órgão</dt>
                      <dd>{formatText(patient.rg_issuer)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>UF</dt>
                      <dd>{formatText(patient.rg_issuer_state)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Emissão RG</dt>
                      <dd>{formatDateISO(patient.rg_issued_at)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>CNS</dt>
                      <dd>{formatText(patient.cns)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Doc. nacional</dt>
                      <dd>{formatText(patient.national_id)}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Naturalidade & filiação</div>
                </div>
                <div className={styles.cardBody}>
                  <dl className={styles.definitionList}>
                    <div style={{ display: 'contents' }}>
                      <dt>Local nasc.</dt>
                      <dd>{formatText(patient.birth_place)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Naturalidade</dt>
                      <dd>
                        {[patient.naturalness_city, patient.naturalness_state, patient.naturalness_country]
                          .filter(Boolean)
                          .join(' / ') || '—'}
                      </dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Nacionalidade</dt>
                      <dd>{formatText(patient.nationality)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Mãe</dt>
                      <dd>{formatText(patient.mother_name)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Pai</dt>
                      <dd>{formatText(patient.father_name)}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className={mergeClasses(styles.card, styles.cardSpan)}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Perfil sócio-demográfico</div>
                </div>
                <div className={styles.cardBody}>
                  <dl className={styles.definitionList}>
                    <div style={{ display: 'contents' }}>
                      <dt>Escolaridade</dt>
                      <dd>{formatText(patient.education_level)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Profissão</dt>
                      <dd>{formatText(patient.profession)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Raça/cor</dt>
                      <dd>{formatText(patient.race_color)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>PCD</dt>
                      <dd>{formatBool(patient.is_pcd)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Idioma</dt>
                      <dd>{formatText(patient.preferred_language)}</dd>
                    </div>
                  </dl>
                  <p className={styles.note} style={{ marginTop: '12px' }}>
                    (Campos adicionais de perfil podem ser agregados aqui sem virar vários cards pequenos.)
                  </p>
                </div>
              </section>

              <section className={mergeClasses(styles.card, styles.cardSpan)}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Contato & preferências</div>
                </div>
                <div className={styles.cardBody}>
                  <dl className={styles.definitionList}>
                    <div style={{ display: 'contents' }}>
                      <dt>Telefone</dt>
                      <dd>{formatPhone(patient.mobile_phone)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Tel. verificado</dt>
                      <dd>{formatBool(patient.mobile_phone_verified)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Telefone 2</dt>
                      <dd>{formatPhone(patient.secondary_phone)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Tipo tel. 2</dt>
                      <dd>{formatText(patient.secondary_phone_type)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>E-mail</dt>
                      <dd>{formatText(patient.email)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>E-mail verif.</dt>
                      <dd>{formatBool(patient.email_verified)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Preferência</dt>
                      <dd>{formatText(patient.pref_contact_method)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Janela contato</dt>
                      <dd>{formatText(patient.contact_time_preference)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Notas</dt>
                      <dd>{formatText(patient.contact_notes)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Comunicação</dt>
                      <dd>{formatCommunicationPreferences(patient.communication_preferences)}</dd>
                    </div>
                  </dl>
                </div>
              </section>
            </div>

            <aside className={styles.rightCol}>
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Status do cadastro</div>
                </div>
                <div className={styles.cardBody}>
                  <dl className={styles.definitionList} style={{ gridTemplateColumns: '130px 1fr' }}>
                    <div style={{ display: 'contents' }}>
                      <dt>Ativo</dt>
                      <dd>{formatBool(patient.is_active)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Status</dt>
                      <dd>{formatText(patient.record_status)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Onboarding</dt>
                      <dd>{patient.onboarding_step ?? '—'}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Validação documental</div>
                </div>
                <div className={styles.cardBody}>
                  <dl className={styles.definitionList} style={{ gridTemplateColumns: '130px 1fr' }}>
                    <div style={{ display: 'contents' }}>
                      <dt>Status</dt>
                      <dd>{formatText(patient.doc_validation_status)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Método</dt>
                      <dd>{formatText(patient.doc_validation_method)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Fonte</dt>
                      <dd>{formatText(patient.doc_validation_source)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Validado em</dt>
                      <dd>{formatText(patient.doc_validated_at)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Validado por</dt>
                      <dd>{formatText(patient.doc_validated_by)}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Consentimentos</div>
                </div>
                <div className={styles.cardBody}>
                  <dl className={styles.definitionList} style={{ gridTemplateColumns: '130px 1fr' }}>
                    <div style={{ display: 'contents' }}>
                      <dt>E-mail</dt>
                      <dd>{formatBool(patient.accept_email)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>SMS</dt>
                      <dd>{formatBool(patient.accept_sms)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Foto</dt>
                      <dd>{formatBool(patient.photo_consent)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Origem</dt>
                      <dd>{formatText(patient.marketing_consent_source)}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Auditoria</div>
                </div>
                <div className={styles.cardBody}>
                  <dl className={styles.definitionList} style={{ gridTemplateColumns: '130px 1fr' }}>
                    <div style={{ display: 'contents' }}>
                      <dt>Criado em</dt>
                      <dd>{formatTimestamp(patient.created_at)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Atualizado</dt>
                      <dd>{formatTimestamp(patient.updated_at)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Por</dt>
                      <dd>{formatText(patient.updated_by)}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Integrações</div>
                </div>
                <div className={styles.cardBody}>
                  <dl className={styles.definitionList} style={{ gridTemplateColumns: '130px 1fr' }}>
                    <div style={{ display: 'contents' }}>
                      <dt>Contratante</dt>
                      <dd>{formatText(patient.primary_contractor_id)}</dd>
                    </div>
                    <div style={{ display: 'contents' }}>
                      <dt>Foto (path)</dt>
                      <dd>{formatText(patient.photo_path)}</dd>
                    </div>
                  </dl>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: tokens.fontWeightSemibold, marginBottom: '6px' }}>
                      IDs externos
                    </div>
                    <pre className={styles.pre}>{externalIdsText}</pre>
                  </div>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Linha do tempo (atividades)</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineBar} />
                    <div className={styles.timelineMain}>
                      <div className={styles.timelineTop}>
                        <span>Sistema</span>
                        <span>Hoje</span>
                      </div>
                      <p className={styles.timelineTitle}>Visualização do cadastro</p>
                      <p className={styles.timelineDesc}>Registro carregado no app.</p>
                    </div>
                  </div>
                  <div className={styles.timelineItem}>
                    <div className={styles.timelineBar} style={{ backgroundColor: '#8764b8' }} />
                    <div className={styles.timelineMain}>
                      <div className={styles.timelineTop}>
                        <span>Sistema</span>
                        <span>—</span>
                      </div>
                      <p className={styles.timelineTitle}>Upload de documento</p>
                      <p className={styles.timelineDesc}>Atalho para GED (placeholder).</p>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      )}
    </>
  );
});
