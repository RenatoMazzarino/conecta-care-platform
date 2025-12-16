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
} from '@fluentui/react-components';
import {
  PersonRegular,
  MailRegular,
  PhoneRegular,
  CameraRegular,
  EditRegular,
  SaveRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import type { PatientRow } from '@/features/pacientes/actions/getPatientById';
import type { PatientDadosPessoaisUpdate } from '@/features/pacientes/schemas/aba01DadosPessoais';
import {
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

type Draft = PatientDadosPessoaisUpdate;

export interface DadosPessoaisOnboardingFormProps {
  patient: PatientRow;
  draft: Draft;
  isEditing: boolean;
  isSaving: boolean;
  fieldErrors: Record<string, string>;
  saveError: string | null;
  externalIdsText: string;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (patch: Partial<Draft>) => void;
}

function getErrorFor(fieldErrors: Record<string, string>, field: keyof Draft) {
  return fieldErrors[field as string];
}

function ensureCommunicationPrefs(value: Draft['communication_preferences']) {
  return {
    sms: value?.sms ?? true,
    email: value?.email ?? true,
    whatsapp: value?.whatsapp ?? true,
  };
}

export function DadosPessoaisOnboardingForm({
  patient,
  draft,
  isEditing,
  isSaving,
  fieldErrors,
  saveError,
  externalIdsText,
  onStartEdit,
  onCancel,
  onSave,
  onChange,
}: DadosPessoaisOnboardingFormProps) {
  const styles = useStyles();

  const getError = (field: keyof Draft) => getErrorFor(fieldErrors, field);

  return (
    <div className={styles.container}>
      <div className={styles.photoSection}>
        {draft.photo_path ? (
          <Avatar name={draft.full_name ?? 'Paciente'} size={120} aria-label="Foto do paciente" />
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
            onChange={(e) => onChange({ photo_path: e.target.value })}
            contentBefore={<CameraRegular />}
            placeholder="patients/<id>/photo.jpg"
          />
        </Field>
        <Checkbox
          label="Consentimento de foto"
          checked={draft.photo_consent ?? false}
          disabled={!isEditing}
          onChange={(_, data) => onChange({ photo_consent: data.checked === true })}
        />
      </div>

      <div className={styles.formSection}>
        <div className={styles.toolbar}>
          <div style={{ fontWeight: tokens.fontWeightSemibold }}>Dados pessoais</div>
          <div className={styles.toolbarActions}>
            {!isEditing ? (
              <Button appearance="primary" icon={<EditRegular />} onClick={onStartEdit}>
                Editar
              </Button>
            ) : (
              <>
                <Button appearance="primary" icon={<SaveRegular />} disabled={isSaving} onClick={onSave}>
                  Salvar
                </Button>
                <Button appearance="outline" icon={<DismissRegular />} disabled={isSaving} onClick={onCancel}>
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
                onChange={(e) => onChange({ full_name: e.target.value })}
                contentBefore={<PersonRegular />}
              />
            </Field>

            <Field
              label="Nome social"
              validationState={getError('social_name') ? 'error' : undefined}
              validationMessage={getError('social_name')}
            >
              <Input
                value={draft.social_name ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ social_name: e.target.value })}
              />
            </Field>

            <Field
              label="Apelido"
              validationState={getError('nickname') ? 'error' : undefined}
              validationMessage={getError('nickname')}
            >
              <Input
                value={draft.nickname ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ nickname: e.target.value })}
              />
            </Field>

            <Field
              label="Tratamento"
              validationState={getError('salutation') ? 'error' : undefined}
              validationMessage={getError('salutation')}
            >
              <Input
                value={draft.salutation ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ salutation: e.target.value })}
              />
            </Field>

            <Field label="CPF" validationState={getError('cpf') ? 'error' : undefined} validationMessage={getError('cpf')}>
              <Input
                value={draft.cpf ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </Field>

            <Field
              label="Status do CPF"
              validationState={getError('cpf_status') ? 'error' : undefined}
              validationMessage={getError('cpf_status')}
            >
              <Select
                value={draft.cpf_status ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ cpf_status: e.target.value as Draft['cpf_status'] })}
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
              <Input value={draft.rg ?? ''} disabled={!isEditing} onChange={(e) => onChange({ rg: e.target.value })} />
            </Field>

            <Field
              label="Órgão emissor (RG)"
              validationState={getError('rg_issuer') ? 'error' : undefined}
              validationMessage={getError('rg_issuer')}
            >
              <Input
                value={draft.rg_issuer ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ rg_issuer: e.target.value })}
              />
            </Field>

            <Field
              label="UF emissor (RG)"
              validationState={getError('rg_issuer_state') ? 'error' : undefined}
              validationMessage={getError('rg_issuer_state')}
            >
              <Input
                value={draft.rg_issuer_state ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ rg_issuer_state: e.target.value })}
                placeholder="UF"
              />
            </Field>

            <Field
              label="Data de emissão (RG)"
              validationState={getError('rg_issued_at') ? 'error' : undefined}
              validationMessage={getError('rg_issued_at')}
            >
              <Input
                type="date"
                value={draft.rg_issued_at ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ rg_issued_at: e.target.value })}
              />
            </Field>

            <Field
              label="Documento nacional"
              validationState={getError('national_id') ? 'error' : undefined}
              validationMessage={getError('national_id')}
            >
              <Input
                value={draft.national_id ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ national_id: e.target.value })}
              />
            </Field>

            <Field label="CNS" validationState={getError('cns') ? 'error' : undefined} validationMessage={getError('cns')}>
              <Input value={draft.cns ?? ''} disabled={!isEditing} onChange={(e) => onChange({ cns: e.target.value })} />
            </Field>

            <Field
              label="Data de nascimento"
              validationState={getError('date_of_birth') ? 'error' : undefined}
              validationMessage={getError('date_of_birth')}
            >
              <Input
                type="date"
                value={draft.date_of_birth ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ date_of_birth: e.target.value })}
              />
            </Field>

            <Field
              label="Sexo"
              validationState={getError('gender') ? 'error' : undefined}
              validationMessage={getError('gender')}
            >
              <Select
                value={draft.gender ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ gender: e.target.value as Draft['gender'] })}
              >
                <option value="">Selecione...</option>
                {genderOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Estado civil"
              validationState={getError('civil_status') ? 'error' : undefined}
              validationMessage={getError('civil_status')}
            >
              <Select
                value={draft.civil_status ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ civil_status: e.target.value as Draft['civil_status'] })}
              >
                <option value="">Selecione...</option>
                {civilStatusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Identidade de gênero"
              validationState={getError('gender_identity') ? 'error' : undefined}
              validationMessage={getError('gender_identity')}
            >
              <Select
                value={draft.gender_identity ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ gender_identity: e.target.value as Draft['gender_identity'] })}
              >
                <option value="">Selecione...</option>
                {genderIdentityOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Pronomes"
              validationState={getError('pronouns') ? 'error' : undefined}
              validationMessage={getError('pronouns')}
            >
              <Select
                value={draft.pronouns ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ pronouns: e.target.value as Draft['pronouns'] })}
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
            <Field
              label="Nacionalidade"
              validationState={getError('nationality') ? 'error' : undefined}
              validationMessage={getError('nationality')}
            >
              <Input
                value={draft.nationality ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ nationality: e.target.value })}
              />
            </Field>

            <Field
              label="Idioma preferido"
              validationState={getError('preferred_language') ? 'error' : undefined}
              validationMessage={getError('preferred_language')}
            >
              <Input
                value={draft.preferred_language ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ preferred_language: e.target.value })}
              />
            </Field>

            <Field
              label="Escolaridade"
              validationState={getError('education_level') ? 'error' : undefined}
              validationMessage={getError('education_level')}
            >
              <Select
                value={draft.education_level ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ education_level: e.target.value as Draft['education_level'] })}
              >
                <option value="">Selecione...</option>
                {educationLevelOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Profissão"
              validationState={getError('profession') ? 'error' : undefined}
              validationMessage={getError('profession')}
            >
              <Input
                value={draft.profession ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ profession: e.target.value })}
              />
            </Field>

            <Field
              label="Raça/Cor"
              validationState={getError('race_color') ? 'error' : undefined}
              validationMessage={getError('race_color')}
            >
              <Select
                value={draft.race_color ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ race_color: e.target.value as Draft['race_color'] })}
              >
                <option value="">Selecione...</option>
                {raceColorOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Field>

            <Checkbox label="PCD" checked={draft.is_pcd ?? false} disabled={!isEditing} onChange={(_, data) => onChange({ is_pcd: data.checked === true })} />
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Naturalidade & filiação</span>} />
          <div className={styles.fieldGroup}>
            <Field
              label="Local de nascimento (texto livre)"
              validationState={getError('birth_place') ? 'error' : undefined}
              validationMessage={getError('birth_place')}
            >
              <Input
                value={draft.birth_place ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ birth_place: e.target.value })}
              />
            </Field>

            <Field
              label="Naturalidade — Cidade"
              validationState={getError('naturalness_city') ? 'error' : undefined}
              validationMessage={getError('naturalness_city')}
            >
              <Input
                value={draft.naturalness_city ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ naturalness_city: e.target.value })}
              />
            </Field>

            <Field
              label="Naturalidade — UF/Estado"
              validationState={getError('naturalness_state') ? 'error' : undefined}
              validationMessage={getError('naturalness_state')}
            >
              <Input
                value={draft.naturalness_state ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ naturalness_state: e.target.value })}
              />
            </Field>

            <Field
              label="Naturalidade — País"
              validationState={getError('naturalness_country') ? 'error' : undefined}
              validationMessage={getError('naturalness_country')}
            >
              <Input
                value={draft.naturalness_country ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ naturalness_country: e.target.value })}
              />
            </Field>

            <Field
              label="Nome da mãe"
              validationState={getError('mother_name') ? 'error' : undefined}
              validationMessage={getError('mother_name')}
            >
              <Input value={draft.mother_name ?? ''} disabled={!isEditing} onChange={(e) => onChange({ mother_name: e.target.value })} />
            </Field>

            <Field
              label="Nome do pai"
              validationState={getError('father_name') ? 'error' : undefined}
              validationMessage={getError('father_name')}
            >
              <Input value={draft.father_name ?? ''} disabled={!isEditing} onChange={(e) => onChange({ father_name: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Contato & preferências</span>} />
          <div className={styles.fieldGroup}>
            <Field
              label="Telefone principal"
              required
              validationState={getError('mobile_phone') ? 'error' : undefined}
              validationMessage={getError('mobile_phone')}
            >
              <Input
                value={draft.mobile_phone ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ mobile_phone: e.target.value })}
                contentBefore={<PhoneRegular />}
                placeholder="(00) 00000-0000"
              />
            </Field>

            <Field
              label="Telefone secundário"
              validationState={getError('secondary_phone') ? 'error' : undefined}
              validationMessage={getError('secondary_phone')}
            >
              <Input
                value={draft.secondary_phone ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ secondary_phone: e.target.value })}
                contentBefore={<PhoneRegular />}
                placeholder="(00) 00000-0000"
              />
            </Field>

            <Field
              label="Tipo telefone secundário"
              validationState={getError('secondary_phone_type') ? 'error' : undefined}
              validationMessage={getError('secondary_phone_type')}
            >
              <Input
                value={draft.secondary_phone_type ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ secondary_phone_type: e.target.value })}
              />
            </Field>

            <Field
              label="E-mail"
              validationState={getError('email') ? 'error' : undefined}
              validationMessage={getError('email')}
            >
              <Input
                type="email"
                value={draft.email ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ email: e.target.value })}
                contentBefore={<MailRegular />}
              />
            </Field>

            <Checkbox
              label="E-mail verificado"
              checked={draft.email_verified ?? false}
              disabled={!isEditing}
              onChange={(_, data) => onChange({ email_verified: data.checked === true })}
            />

            <Checkbox
              label="Telefone verificado"
              checked={draft.mobile_phone_verified ?? false}
              disabled={!isEditing}
              onChange={(_, data) => onChange({ mobile_phone_verified: data.checked === true })}
            />

            <Field
              label="Preferência de contato"
              validationState={getError('pref_contact_method') ? 'error' : undefined}
              validationMessage={getError('pref_contact_method')}
            >
              <Select
                value={draft.pref_contact_method ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ pref_contact_method: e.target.value as Draft['pref_contact_method'] })}
              >
                <option value="">Selecione...</option>
                {prefContactMethodOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Janela preferida de contato"
              validationState={getError('contact_time_preference') ? 'error' : undefined}
              validationMessage={getError('contact_time_preference')}
            >
              <Select
                value={draft.contact_time_preference ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ contact_time_preference: e.target.value as Draft['contact_time_preference'] })}
              >
                <option value="">Selecione...</option>
                {contactTimePreferenceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Notas de contato"
              validationState={getError('contact_notes') ? 'error' : undefined}
              validationMessage={getError('contact_notes')}
            >
              <Textarea
                value={draft.contact_notes ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ contact_notes: e.target.value })}
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
                  onChange={(_, data) => {
                    const prev = ensureCommunicationPrefs(draft.communication_preferences);
                    onChange({ communication_preferences: { ...prev, sms: data.checked === true } });
                  }}
                />
                <Checkbox
                  label="E-mail"
                  checked={draft.communication_preferences?.email ?? true}
                  disabled={!isEditing}
                  onChange={(_, data) => {
                    const prev = ensureCommunicationPrefs(draft.communication_preferences);
                    onChange({ communication_preferences: { ...prev, email: data.checked === true } });
                  }}
                />
                <Checkbox
                  label="WhatsApp"
                  checked={draft.communication_preferences?.whatsapp ?? true}
                  disabled={!isEditing}
                  onChange={(_, data) => {
                    const prev = ensureCommunicationPrefs(draft.communication_preferences);
                    onChange({ communication_preferences: { ...prev, whatsapp: data.checked === true } });
                  }}
                />
              </div>
            </Card>
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Documentos & verificação</span>} />
          <div className={styles.fieldGroup}>
            <Field
              label="Status validação documental"
              validationState={getError('doc_validation_status') ? 'error' : undefined}
              validationMessage={getError('doc_validation_status')}
            >
              <Select
                value={draft.doc_validation_status ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ doc_validation_status: e.target.value as Draft['doc_validation_status'] })}
              >
                <option value="">Selecione...</option>
                {docValidationStatusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Método de validação"
              validationState={getError('doc_validation_method') ? 'error' : undefined}
              validationMessage={getError('doc_validation_method')}
            >
              <Input
                value={draft.doc_validation_method ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ doc_validation_method: e.target.value })}
              />
            </Field>

            <Field
              label="Fonte de validação"
              validationState={getError('doc_validation_source') ? 'error' : undefined}
              validationMessage={getError('doc_validation_source')}
            >
              <Input
                value={draft.doc_validation_source ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ doc_validation_source: e.target.value })}
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
            <Checkbox label="Aceita SMS" checked={draft.accept_sms ?? true} disabled={!isEditing} onChange={(_, data) => onChange({ accept_sms: data.checked === true })} />
            <Checkbox label="Aceita e-mail" checked={draft.accept_email ?? true} disabled={!isEditing} onChange={(_, data) => onChange({ accept_email: data.checked === true })} />
            <Checkbox label="Bloquear marketing" checked={draft.block_marketing ?? false} disabled={!isEditing} onChange={(_, data) => onChange({ block_marketing: data.checked === true })} />

            <Field
              label="Status consentimento marketing"
              validationState={getError('marketing_consent_status') ? 'error' : undefined}
              validationMessage={getError('marketing_consent_status')}
            >
              <Select
                value={draft.marketing_consent_status ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ marketing_consent_status: e.target.value as Draft['marketing_consent_status'] })}
              >
                <option value="">Selecione...</option>
                {marketingConsentStatusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Origem do consentimento"
              validationState={getError('marketing_consent_source') ? 'error' : undefined}
              validationMessage={getError('marketing_consent_source')}
            >
              <Select
                value={draft.marketing_consent_source ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ marketing_consent_source: e.target.value as Draft['marketing_consent_source'] })}
              >
                <option value="">Selecione...</option>
                {marketingConsentSourceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="IP do consentimento"
              validationState={getError('marketing_consent_ip') ? 'error' : undefined}
              validationMessage={getError('marketing_consent_ip')}
            >
              <Input value={draft.marketing_consent_ip ?? ''} disabled={!isEditing} onChange={(e) => onChange({ marketing_consent_ip: e.target.value })} />
            </Field>

            <Field
              label="Histórico do consentimento"
              validationState={getError('marketing_consent_history') ? 'error' : undefined}
              validationMessage={getError('marketing_consent_history')}
            >
              <Textarea
                value={draft.marketing_consent_history ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ marketing_consent_history: e.target.value })}
                rows={3}
              />
            </Field>
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Status do cadastro</span>} />
          <div className={styles.fieldGroup}>
            <Field
              label="Etapa onboarding"
              validationState={getError('onboarding_step') ? 'error' : undefined}
              validationMessage={getError('onboarding_step')}
            >
              <Input
                type="number"
                value={String(draft.onboarding_step ?? '')}
                disabled={!isEditing}
                onChange={(e) => onChange({ onboarding_step: Number(e.target.value) })}
                min={1}
              />
            </Field>

            <Field
              label="Status do registro"
              validationState={getError('record_status') ? 'error' : undefined}
              validationMessage={getError('record_status')}
            >
              <Select
                value={draft.record_status ?? ''}
                disabled={!isEditing}
                onChange={(e) => onChange({ record_status: e.target.value as Draft['record_status'] })}
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
              onChange={(_, data) => onChange({ is_active: data.checked === true })}
            />
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader
            header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Integrações/Administrativo (somente leitura)</span>}
          />
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
  );
}
