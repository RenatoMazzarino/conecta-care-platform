'use client';

import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Avatar,
  Button,
  Textarea,
  Checkbox,
  Spinner,
  Toaster,
  Toast,
  ToastTitle,
  useId,
  useToastController,
} from '@fluentui/react-components';
import {
  PersonRegular,
  MailRegular,
  PhoneRegular,
  CameraRegular,
  EditRegular,
  SaveRegular,
  DismissRegular,
  ArrowClockwiseRegular,
} from '@fluentui/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import type { Json } from '@/types/supabase';
import type { PatientRow } from '@/features/pacientes/actions/getPatientById';
import { getPatientById } from '@/features/pacientes/actions/getPatientById';
import { updatePatientDadosPessoais } from '@/features/pacientes/actions/updatePatientDadosPessoais';
import {
  patientDadosPessoaisUpdateSchema,
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
    display: 'grid',
    gap: '24px',
    padding: '24px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '200px 1fr',
    },
  },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusLarge,
    height: 'fit-content',
  },
  photoPlaceholder: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: tokens.colorNeutralBackground4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
  card: {
    padding: '16px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  toolbarActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
});

type CommunicationPreferences = { sms: boolean; email: boolean; whatsapp: boolean };
type Draft = z.infer<typeof patientDadosPessoaisUpdateSchema>;

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

interface DadosPessoaisTabProps {
  patientId: string;
}

export function DadosPessoaisTab({ patientId }: DadosPessoaisTabProps) {
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
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Falha ao carregar paciente');
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

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

  const handleStartEdit = () => {
    if (!patient) return;
    setIsEditing(true);
    setSaveError(null);
    setFieldErrors({});
    setDraft(buildDraftFromPatient(patient));
  };

  const handleCancel = () => {
    if (!patient) return;
    setIsEditing(false);
    setSaveError(null);
    setFieldErrors({});
    setDraft(buildDraftFromPatient(patient));
  };

  const handleSave = async () => {
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
  };

  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <Spinner label="Carregando dados pessoais..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: '24px' }}>
        <Card className={styles.card}>
          <CardHeader
            header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Erro ao carregar</span>}
            description={loadError}
            action={
              <Button appearance="primary" icon={<ArrowClockwiseRegular />} onClick={() => void reload()}>
                Tentar novamente
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  if (!patient || !draft) {
    return (
      <div style={{ padding: '24px' }}>
        <Card className={styles.card}>
          <CardHeader
            header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Paciente não encontrado</span>}
            action={
              <Button appearance="primary" icon={<ArrowClockwiseRegular />} onClick={() => void reload()}>
                Recarregar
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const getError = (field: keyof Draft) => fieldErrors[field as string];

  return (
    <>
      <Toaster toasterId={toasterId} />
      <div className={styles.container}>
        <div className={styles.photoSection}>
          {draft.photo_path ? (
            <Avatar
              name={draft.full_name ?? 'Paciente'}
              size={120}
              aria-label="Foto do paciente"
            />
          ) : (
            <div className={styles.photoPlaceholder}>
              <PersonRegular style={{ fontSize: '64px', color: tokens.colorNeutralForeground3 }} />
            </div>
          )}
          <Field
            label="Foto (photo_path)"
            validationState={getError('photo_path') ? 'error' : undefined}
            validationMessage={getError('photo_path')}
          >
            <Input
              value={draft.photo_path ?? ''}
              disabled={!isEditing}
              onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { photo_path: e.target.value }) : prev))}
              contentBefore={<CameraRegular />}
              placeholder="patients/<id>/photo.jpg"
            />
          </Field>
          <Checkbox
            label="Consentimento de foto"
            checked={draft.photo_consent ?? false}
            disabled={!isEditing}
            onChange={(_, data) =>
              setDraft((prev) => (prev ? mergeDraft(prev, { photo_consent: data.checked === true }) : prev))
            }
          />
        </div>

        <div className={styles.formSection}>
          <div className={styles.toolbar}>
            <div style={{ fontWeight: tokens.fontWeightSemibold }}>Dados pessoais</div>
            <div className={styles.toolbarActions}>
              {!isEditing ? (
                <Button appearance="primary" icon={<EditRegular />} onClick={handleStartEdit}>
                  Editar
                </Button>
              ) : (
                <>
                  <Button appearance="primary" icon={<SaveRegular />} disabled={isSaving} onClick={() => void handleSave()}>
                    Salvar
                  </Button>
                  <Button appearance="outline" icon={<DismissRegular />} disabled={isSaving} onClick={handleCancel}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>

          {saveError && (
            <Card className={styles.card}>
              <CardHeader
                header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Falha ao salvar</span>}
                description={saveError}
              />
            </Card>
          )}

          <Card className={styles.card}>
            <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Identificação</span>} />
            <div className={styles.fieldGroup}>
              <Field
                label="Nome completo"
                required
                validationState={getError('full_name') ? 'error' : undefined}
                validationMessage={getError('full_name')}
              >
                <Input
                  value={draft.full_name ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { full_name: e.target.value }) : prev))}
                  contentBefore={<PersonRegular />}
                />
              </Field>
              <Field label="Nome social" validationState={getError('social_name') ? 'error' : undefined} validationMessage={getError('social_name')}>
                <Input
                  value={draft.social_name ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { social_name: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Apelido" validationState={getError('nickname') ? 'error' : undefined} validationMessage={getError('nickname')}>
                <Input
                  value={draft.nickname ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { nickname: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Tratamento" validationState={getError('salutation') ? 'error' : undefined} validationMessage={getError('salutation')}>
                <Input
                  value={draft.salutation ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { salutation: e.target.value }) : prev))}
                />
              </Field>
              <Field label="CPF" validationState={getError('cpf') ? 'error' : undefined} validationMessage={getError('cpf')}>
                <Input
                  value={draft.cpf ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { cpf: e.target.value }) : prev))}
                  placeholder="000.000.000-00"
                />
              </Field>
              <Field label="Status do CPF" validationState={getError('cpf_status') ? 'error' : undefined} validationMessage={getError('cpf_status')}>
                <Select
                  value={draft.cpf_status ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { cpf_status: e.target.value as Draft['cpf_status'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {cpfStatusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="RG" validationState={getError('rg') ? 'error' : undefined} validationMessage={getError('rg')}>
                <Input
                  value={draft.rg ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { rg: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Órgão emissor (RG)" validationState={getError('rg_issuer') ? 'error' : undefined} validationMessage={getError('rg_issuer')}>
                <Input
                  value={draft.rg_issuer ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { rg_issuer: e.target.value }) : prev))}
                />
              </Field>
              <Field label="UF emissor (RG)" validationState={getError('rg_issuer_state') ? 'error' : undefined} validationMessage={getError('rg_issuer_state')}>
                <Input
                  value={draft.rg_issuer_state ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { rg_issuer_state: e.target.value }) : prev))}
                  placeholder="UF"
                />
              </Field>
              <Field label="Data de emissão (RG)" validationState={getError('rg_issued_at') ? 'error' : undefined} validationMessage={getError('rg_issued_at')}>
                <Input
                  type="date"
                  value={draft.rg_issued_at ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { rg_issued_at: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Documento nacional" validationState={getError('national_id') ? 'error' : undefined} validationMessage={getError('national_id')}>
                <Input
                  value={draft.national_id ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { national_id: e.target.value }) : prev))}
                />
              </Field>
              <Field label="CNS" validationState={getError('cns') ? 'error' : undefined} validationMessage={getError('cns')}>
                <Input
                  value={draft.cns ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { cns: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Data de nascimento" validationState={getError('date_of_birth') ? 'error' : undefined} validationMessage={getError('date_of_birth')}>
                <Input
                  type="date"
                  value={draft.date_of_birth ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { date_of_birth: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Sexo" validationState={getError('gender') ? 'error' : undefined} validationMessage={getError('gender')}>
                <Select
                  value={draft.gender ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { gender: e.target.value as Draft['gender'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {genderOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Estado civil" validationState={getError('civil_status') ? 'error' : undefined} validationMessage={getError('civil_status')}>
                <Select
                  value={draft.civil_status ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { civil_status: e.target.value as Draft['civil_status'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {civilStatusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Identidade de gênero" validationState={getError('gender_identity') ? 'error' : undefined} validationMessage={getError('gender_identity')}>
                <Select
                  value={draft.gender_identity ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { gender_identity: e.target.value as Draft['gender_identity'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {genderIdentityOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Pronomes" validationState={getError('pronouns') ? 'error' : undefined} validationMessage={getError('pronouns')}>
                <Select
                  value={draft.pronouns ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { pronouns: e.target.value as Draft['pronouns'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {pronounsOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <Card className={styles.card}>
            <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Perfil</span>} />
            <div className={styles.fieldGroup}>
              <Field label="Nacionalidade" validationState={getError('nationality') ? 'error' : undefined} validationMessage={getError('nationality')}>
                <Input
                  value={draft.nationality ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { nationality: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Idioma preferido" validationState={getError('preferred_language') ? 'error' : undefined} validationMessage={getError('preferred_language')}>
                <Input
                  value={draft.preferred_language ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { preferred_language: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Escolaridade" validationState={getError('education_level') ? 'error' : undefined} validationMessage={getError('education_level')}>
                <Select
                  value={draft.education_level ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { education_level: e.target.value as Draft['education_level'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {educationLevelOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Profissão" validationState={getError('profession') ? 'error' : undefined} validationMessage={getError('profession')}>
                <Input
                  value={draft.profession ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { profession: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Raça/Cor" validationState={getError('race_color') ? 'error' : undefined} validationMessage={getError('race_color')}>
                <Select
                  value={draft.race_color ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { race_color: e.target.value as Draft['race_color'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {raceColorOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Checkbox
                label="PCD"
                checked={draft.is_pcd ?? false}
                disabled={!isEditing}
                onChange={(_, data) =>
                  setDraft((prev) => (prev ? mergeDraft(prev, { is_pcd: data.checked === true }) : prev))
                }
              />
            </div>
          </Card>

          <Card className={styles.card}>
            <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Naturalidade & filiação</span>} />
            <div className={styles.fieldGroup}>
              <Field label="Local de nascimento (texto livre)" validationState={getError('birth_place') ? 'error' : undefined} validationMessage={getError('birth_place')}>
                <Input
                  value={draft.birth_place ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { birth_place: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Naturalidade — Cidade" validationState={getError('naturalness_city') ? 'error' : undefined} validationMessage={getError('naturalness_city')}>
                <Input
                  value={draft.naturalness_city ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { naturalness_city: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Naturalidade — UF/Estado" validationState={getError('naturalness_state') ? 'error' : undefined} validationMessage={getError('naturalness_state')}>
                <Input
                  value={draft.naturalness_state ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { naturalness_state: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Naturalidade — País" validationState={getError('naturalness_country') ? 'error' : undefined} validationMessage={getError('naturalness_country')}>
                <Input
                  value={draft.naturalness_country ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { naturalness_country: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Nome da mãe" validationState={getError('mother_name') ? 'error' : undefined} validationMessage={getError('mother_name')}>
                <Input
                  value={draft.mother_name ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { mother_name: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Nome do pai" validationState={getError('father_name') ? 'error' : undefined} validationMessage={getError('father_name')}>
                <Input
                  value={draft.father_name ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { father_name: e.target.value }) : prev))}
                />
              </Field>
            </div>
          </Card>

          <Card className={styles.card}>
            <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Contato & preferências</span>} />
            <div className={styles.fieldGroup}>
              <Field label="Telefone principal" required validationState={getError('mobile_phone') ? 'error' : undefined} validationMessage={getError('mobile_phone')}>
                <Input
                  value={draft.mobile_phone ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { mobile_phone: e.target.value }) : prev))}
                  contentBefore={<PhoneRegular />}
                  placeholder="(00) 00000-0000"
                />
              </Field>
              <Field label="Telefone secundário" validationState={getError('secondary_phone') ? 'error' : undefined} validationMessage={getError('secondary_phone')}>
                <Input
                  value={draft.secondary_phone ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { secondary_phone: e.target.value }) : prev))}
                  contentBefore={<PhoneRegular />}
                  placeholder="(00) 00000-0000"
                />
              </Field>
              <Field label="Tipo telefone secundário" validationState={getError('secondary_phone_type') ? 'error' : undefined} validationMessage={getError('secondary_phone_type')}>
                <Input
                  value={draft.secondary_phone_type ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { secondary_phone_type: e.target.value }) : prev))}
                />
              </Field>
              <Field label="E-mail" validationState={getError('email') ? 'error' : undefined} validationMessage={getError('email')}>
                <Input
                  type="email"
                  value={draft.email ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { email: e.target.value }) : prev))}
                  contentBefore={<MailRegular />}
                />
              </Field>
              <Checkbox
                label="E-mail verificado"
                checked={draft.email_verified ?? false}
                disabled={!isEditing}
                onChange={(_, data) =>
                  setDraft((prev) => (prev ? mergeDraft(prev, { email_verified: data.checked === true }) : prev))
                }
              />
              <Checkbox
                label="Telefone verificado"
                checked={draft.mobile_phone_verified ?? false}
                disabled={!isEditing}
                onChange={(_, data) =>
                  setDraft((prev) => (prev ? mergeDraft(prev, { mobile_phone_verified: data.checked === true }) : prev))
                }
              />
              <Field label="Preferência de contato" validationState={getError('pref_contact_method') ? 'error' : undefined} validationMessage={getError('pref_contact_method')}>
                <Select
                  value={draft.pref_contact_method ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { pref_contact_method: e.target.value as Draft['pref_contact_method'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {prefContactMethodOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Janela preferida de contato" validationState={getError('contact_time_preference') ? 'error' : undefined} validationMessage={getError('contact_time_preference')}>
                <Select
                  value={draft.contact_time_preference ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { contact_time_preference: e.target.value as Draft['contact_time_preference'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {contactTimePreferenceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Notas de contato" validationState={getError('contact_notes') ? 'error' : undefined} validationMessage={getError('contact_notes')}>
                <Textarea
                  value={draft.contact_notes ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { contact_notes: e.target.value }) : prev))}
                  rows={3}
                />
              </Field>
              <Card className={styles.card}>
                <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Preferências de comunicação</span>} />
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <Checkbox
                    label="SMS"
                    checked={draft.communication_preferences?.sms ?? true}
                    disabled={!isEditing}
                    onChange={(_, data) =>
                      setDraft((prev) =>
                        prev
                          ? mergeDraft(prev, {
                              communication_preferences: {
                                sms: data.checked === true,
                                email: prev.communication_preferences?.email ?? true,
                                whatsapp: prev.communication_preferences?.whatsapp ?? true,
                              },
                            })
                          : prev,
                      )
                    }
                  />
                  <Checkbox
                    label="E-mail"
                    checked={draft.communication_preferences?.email ?? true}
                    disabled={!isEditing}
                    onChange={(_, data) =>
                      setDraft((prev) =>
                        prev
                          ? mergeDraft(prev, {
                              communication_preferences: {
                                sms: prev.communication_preferences?.sms ?? true,
                                email: data.checked === true,
                                whatsapp: prev.communication_preferences?.whatsapp ?? true,
                              },
                            })
                          : prev,
                      )
                    }
                  />
                  <Checkbox
                    label="WhatsApp"
                    checked={draft.communication_preferences?.whatsapp ?? true}
                    disabled={!isEditing}
                    onChange={(_, data) =>
                      setDraft((prev) =>
                        prev
                          ? mergeDraft(prev, {
                              communication_preferences: {
                                sms: prev.communication_preferences?.sms ?? true,
                                email: prev.communication_preferences?.email ?? true,
                                whatsapp: data.checked === true,
                              },
                            })
                          : prev,
                      )
                    }
                  />
                </div>
              </Card>
            </div>
          </Card>

          <Card className={styles.card}>
            <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Documentos & verificação</span>} />
            <div className={styles.fieldGroup}>
              <Field label="Status validação documental" validationState={getError('doc_validation_status') ? 'error' : undefined} validationMessage={getError('doc_validation_status')}>
                <Select
                  value={draft.doc_validation_status ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { doc_validation_status: e.target.value as Draft['doc_validation_status'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {docValidationStatusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Método de validação" validationState={getError('doc_validation_method') ? 'error' : undefined} validationMessage={getError('doc_validation_method')}>
                <Input
                  value={draft.doc_validation_method ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { doc_validation_method: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Fonte de validação" validationState={getError('doc_validation_source') ? 'error' : undefined} validationMessage={getError('doc_validation_source')}>
                <Input
                  value={draft.doc_validation_source ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { doc_validation_source: e.target.value }) : prev))}
                />
              </Field>
              <Field label="Validado em">
                <Input value={draft.doc_validated_at ?? ''} disabled />
              </Field>
              <Field label="Validado por">
                <Input value={draft.doc_validated_by ?? ''} disabled />
              </Field>
            </div>
          </Card>

          <Card className={styles.card}>
            <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Consentimentos & marketing</span>} />
            <div className={styles.fieldGroup}>
              <Checkbox
                label="Aceita SMS"
                checked={draft.accept_sms ?? true}
                disabled={!isEditing}
                onChange={(_, data) =>
                  setDraft((prev) => (prev ? mergeDraft(prev, { accept_sms: data.checked === true }) : prev))
                }
              />
              <Checkbox
                label="Aceita e-mail"
                checked={draft.accept_email ?? true}
                disabled={!isEditing}
                onChange={(_, data) =>
                  setDraft((prev) => (prev ? mergeDraft(prev, { accept_email: data.checked === true }) : prev))
                }
              />
              <Checkbox
                label="Bloquear marketing"
                checked={draft.block_marketing ?? false}
                disabled={!isEditing}
                onChange={(_, data) =>
                  setDraft((prev) => (prev ? mergeDraft(prev, { block_marketing: data.checked === true }) : prev))
                }
              />
              <Field label="Status consentimento marketing" validationState={getError('marketing_consent_status') ? 'error' : undefined} validationMessage={getError('marketing_consent_status')}>
                <Select
                  value={draft.marketing_consent_status ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { marketing_consent_status: e.target.value as Draft['marketing_consent_status'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {marketingConsentStatusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Origem do consentimento" validationState={getError('marketing_consent_source') ? 'error' : undefined} validationMessage={getError('marketing_consent_source')}>
                <Select
                  value={draft.marketing_consent_source ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { marketing_consent_source: e.target.value as Draft['marketing_consent_source'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {marketingConsentSourceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="IP do consentimento" validationState={getError('marketing_consent_ip') ? 'error' : undefined} validationMessage={getError('marketing_consent_ip')}>
                <Input value={draft.marketing_consent_ip ?? ''} disabled={!isEditing} onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { marketing_consent_ip: e.target.value }) : prev))} />
              </Field>
              <Field label="Histórico do consentimento" validationState={getError('marketing_consent_history') ? 'error' : undefined} validationMessage={getError('marketing_consent_history')}>
                <Textarea
                  value={draft.marketing_consent_history ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { marketing_consent_history: e.target.value }) : prev))}
                  rows={3}
                />
              </Field>
            </div>
          </Card>

          <Card className={styles.card}>
            <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Status do cadastro</span>} />
            <div className={styles.fieldGroup}>
              <Field label="Etapa onboarding" validationState={getError('onboarding_step') ? 'error' : undefined} validationMessage={getError('onboarding_step')}>
                <Input
                  type="number"
                  value={String(draft.onboarding_step ?? '')}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { onboarding_step: Number(e.target.value) }) : prev))}
                  min={1}
                />
              </Field>
              <Field label="Status do registro" validationState={getError('record_status') ? 'error' : undefined} validationMessage={getError('record_status')}>
                <Select
                  value={draft.record_status ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setDraft((prev) => (prev ? mergeDraft(prev, { record_status: e.target.value as Draft['record_status'] }) : prev))}
                >
                  <option value="">Selecione...</option>
                  {recordStatusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Checkbox
                label="Ativo (marco de ativação)"
                checked={draft.is_active ?? false}
                disabled={!isEditing}
                onChange={(_, data) =>
                  setDraft((prev) => (prev ? mergeDraft(prev, { is_active: data.checked === true }) : prev))
                }
              />
            </div>
          </Card>

          <Card className={styles.card}>
            <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Integrações/Administrativo (somente leitura)</span>} />
            <div className={styles.fieldGroup}>
              <Field label="Contratante primário">
                <Input value={patient.primary_contractor_id ?? ''} disabled />
              </Field>
              <Field label="IDs externos">
                <Textarea value={externalIdsText} disabled rows={4} />
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
