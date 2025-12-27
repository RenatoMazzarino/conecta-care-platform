'use client';

import {
  Badge,
  Button,
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
import {
  AddRegular,
  ArrowClockwiseRegular,
  EditRegular,
  LinkRegular,
  DismissRegular,
  ChatRegular,
  CallRegular,
  MailRegular,
} from '@fluentui/react-icons';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import type {
  CareTeamMemberInput,
  PortalAccessInput,
  RelatedPersonUpsertInput,
} from '@/features/pacientes/schemas/aba03RedeApoio.schema';
import {
  careTeamRegimeOptions,
  careTeamStatusOptions,
  contactTimePreferenceOptions,
  contactTypeOptions,
  portalAccessLevelOptions,
  preferredContactOptions,
} from '@/features/pacientes/schemas/aba03RedeApoio.schema';
import { createPortalInvite } from '@/features/pacientes/actions/aba03/createPortalInvite';
import { getRedeApoioSummary } from '@/features/pacientes/actions/aba03/getRedeApoioSummary';
import { revokePortalInvite } from '@/features/pacientes/actions/aba03/revokePortalInvite';
import { setPortalAccessLevel } from '@/features/pacientes/actions/aba03/setPortalAccessLevel';
import { upsertCareTeamMember } from '@/features/pacientes/actions/aba03/upsertCareTeamMember';
import { upsertRelatedPerson } from '@/features/pacientes/actions/aba03/upsertRelatedPerson';
import { deleteRelatedPerson } from '@/features/pacientes/actions/aba03/deleteRelatedPerson';
import { LegalGuardianWizardModal } from '@/components/patient/aba03/LegalGuardianWizardModal';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  grid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 1280px)': {
      gridTemplateColumns: '2fr 1fr',
    },
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: '16px',
    boxShadow: tokens.shadow4,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
    gap: '12px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  definitionList: {
    display: 'grid',
    gridTemplateColumns: '160px 1fr',
    gap: '6px 12px',
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
      color: tokens.colorNeutralForeground1,
      overflowWrap: 'anywhere',
    },
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'center',
  },
  muted: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  contactActions: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    marginTop: '6px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listItem: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingBottom: '10px',
  },
  formGrid: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 720px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  formActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  empty: {
    padding: '16px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
  linkInput: {
    fontSize: '12px',
  },
  timeline: {
    display: 'grid',
    gap: '6px',
    marginTop: '8px',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
  },
  timelineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: tokens.colorNeutralStroke1,
  },
  cardFooter: {
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
});

interface RedeApoioTabProps {
  patientId: string;
  onStatusChange?: (status: { isEditing: boolean; isSaving: boolean }) => void;
  onLegalGuardianSummary?: (summary: { name?: string | null; status: string; docStatus?: string | null }) => void;
}

export interface RedeApoioTabHandle {
  startEdit: () => void;
  cancelEdit: () => void;
  reload: () => void;
  save: () => void;
}

interface ReadOnlyItem {
  label: string;
  value: string;
}

function ReadOnlyRow({ label, value }: ReadOnlyItem) {
  return (
    <div style={{ display: 'contents' }}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatText(value?: string | null) {
  if (!value) return '—';
  const trimmed = value.trim();
  return trimmed.length ? trimmed : '—';
}

function formatPhone(value?: string | null) {
  if (!value) return '—';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}

function maskPhoneInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function normalizePhoneDigits(value?: string | null) {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

function formatDocumentStatus(value?: string | null) {
  switch (value) {
    case 'manual_approved':
      return 'Aprovado';
    case 'manual_pending':
      return 'Revisão manual';
    case 'manual_rejected':
      return 'Reprovado';
    case 'ai_pending':
      return 'IA pendente';
    case 'ai_failed':
      return 'IA falhou';
    case 'ai_passed':
      return 'IA ok';
    case 'uploaded':
      return 'Anexado';
    case 'revoked':
      return 'Revogado';
    case 'expired':
      return 'Vencido';
    default:
      return '—';
  }
}

function formatUpdatedMeta(updatedAt?: string | null, updatedBy?: string | null) {
  if (!updatedAt && !updatedBy) return '—';
  const date = updatedAt ? new Date(updatedAt) : null;
  const formatted =
    date && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date)
      : null;
  const by = updatedBy ?? '—';
  return formatted ? `Atualizado em ${formatted} por ${by}` : `Atualizado por ${by}`;
}

function guardianStatusFromDoc(status?: string | null, hasGuardian = false) {
  if (!status) {
    return hasGuardian ? { label: 'Em revisão', tone: 'warning' } : { label: 'Ausente', tone: 'danger' };
  }
  if (status === 'manual_approved') return { label: 'OK', tone: 'success' };
  return { label: 'Pendente', tone: 'warning' };
}

function toOption<T extends readonly string[]>(options: T, value?: string | null) {
  if (!value) return undefined;
  return options.includes(value as T[number]) ? (value as T[number]) : undefined;
}

function buildTimeline(logs: DocumentLogRow[], status?: string | null) {
  const actions = new Set(logs.map((log) => log.action).filter(Boolean));
  const uploaded = actions.has('uploaded') || Boolean(status);
  const ai =
    actions.has('ai_passed') ||
    actions.has('ai_failed') ||
    actions.has('ai_disabled') ||
    status === 'ai_passed' ||
    status === 'ai_failed';
  const manual = actions.has('manual_approved') || actions.has('manual_rejected') || status === 'manual_approved';

  return [
    { key: 'upload', label: 'Upload', done: uploaded },
    { key: 'ai', label: 'IA', done: ai },
    { key: 'manual', label: 'Manual', done: manual },
  ];
}

type RelatedPersonRow = {
  id: string;
  name?: string | null;
  relationship_degree?: string | null;
  phone_primary?: string | null;
  email?: string | null;
  contact_type?: string | null;
  contact_time_preference?: string | null;
  preferred_contact?: string | null;
  observations?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
  is_legal_guardian?: boolean | null;
  is_emergency_contact?: boolean | null;
  is_financial_responsible?: boolean | null;
  can_authorize_clinical?: boolean | null;
  can_authorize_financial?: boolean | null;
  is_main_contact?: boolean | null;
  is_payer?: boolean | null;
};

type CareTeamMemberRow = {
  id: string;
  profissional_nome?: string | null;
  role_in_case?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  status?: string | null;
  regime?: string | null;
  notes?: string | null;
  professional_id?: string | null;
};

type PortalAccessRow = {
  id: string;
  patient_id?: string | null;
  related_person_id?: string | null;
  portal_access_level?: string | null;
  invited_at?: string | null;
  revoked_at?: string | null;
  invite_expires_at?: string | null;
};

type LegalDocumentRow = {
  id: string;
  document_status?: string | null;
};

type DocumentLogRow = {
  action?: string | null;
  happened_at?: string | null;
};

export const RedeApoioTab = forwardRef<RedeApoioTabHandle, RedeApoioTabProps>(function RedeApoioTab(
  { patientId, onStatusChange, onLegalGuardianSummary },
  ref,
) {
  const styles = useStyles();
  const toasterId = useId('rede-apoio-toaster');
  const { dispatchToast } = useToastController(toasterId);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getRedeApoioSummary>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isContactSaving, setIsContactSaving] = useState(false);
  const [isCareSaving, setIsCareSaving] = useState(false);
  const [contactDraft, setContactDraft] = useState<RelatedPersonUpsertInput | null>(null);
  const [careTeamDraft, setCareTeamDraft] = useState<CareTeamMemberInput | null>(null);
  const [portalAccessLevelDraft, setPortalAccessLevelDraft] = useState<PortalAccessInput['portal_access_level']>('viewer');
  const [latestInviteLink, setLatestInviteLink] = useState<string | null>(null);
  const [isLegalWizardOpen, setIsLegalWizardOpen] = useState(false);
  const [legalWizardSeed, setLegalWizardSeed] = useState<RelatedPersonRow | null>(null);
  const [isPortalPanelOpen, setIsPortalPanelOpen] = useState(false);

  const relatedPersons = useMemo(
    () => (summary?.relatedPersons ?? []) as RelatedPersonRow[],
    [summary?.relatedPersons],
  );
  const nonLegalRelatedPersons = useMemo(
    () => relatedPersons.filter((person) => !person.is_legal_guardian),
    [relatedPersons],
  );
  const careTeamMembers = useMemo(
    () => (summary?.careTeamMembers ?? []) as CareTeamMemberRow[],
    [summary?.careTeamMembers],
  );
  const legalDocuments = useMemo(
    () => (summary?.legalDocuments ?? []) as LegalDocumentRow[],
    [summary?.legalDocuments],
  );
  const documentLogs = useMemo(
    () => (summary?.documentLogs ?? []) as DocumentLogRow[],
    [summary?.documentLogs],
  );
  const portalAccess = (summary?.portalAccess ?? null) as PortalAccessRow | null;
  const legalGuardianSummary = summary?.legalGuardianSummary ?? null;

  const legalGuardian = useMemo(() => {
    return relatedPersons.find((person) => Boolean(person.is_legal_guardian)) ?? null;
  }, [relatedPersons]);

  const latestLegalDoc = legalDocuments[0] ?? null;

  const guardianStatus = guardianStatusFromDoc(
    (legalGuardianSummary as { legal_doc_status?: string | null } | null)?.legal_doc_status ??
      latestLegalDoc?.document_status ??
      null,
    Boolean(legalGuardian),
  );
  const guardianColor = guardianStatus.tone === 'success' ? 'success' : guardianStatus.tone === 'warning' ? 'warning' : 'danger';
  const timeline = useMemo(
    () => buildTimeline(documentLogs, latestLegalDoc?.document_status ?? null),
    [documentLogs, latestLegalDoc?.document_status],
  );

  useEffect(() => {
    onLegalGuardianSummary?.({
      name:
        (legalGuardianSummary as { legal_guardian_name?: string | null } | null)?.legal_guardian_name ??
        legalGuardian?.name ??
        null,
      status: guardianStatus.label,
      docStatus:
        (legalGuardianSummary as { legal_doc_status?: string | null } | null)?.legal_doc_status ??
        latestLegalDoc?.document_status ??
        null,
    });
  }, [guardianStatus.label, latestLegalDoc, legalGuardian, legalGuardianSummary, onLegalGuardianSummary]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const loaded = await getRedeApoioSummary(patientId);
      setSummary(loaded);
      const portalLevel = toOption(
        portalAccessLevelOptions,
        (loaded.portalAccess as { portal_access_level?: string | null } | null)?.portal_access_level,
      );
      setPortalAccessLevelDraft(portalLevel ?? 'viewer');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Falha ao carregar rede de apoio');
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const togglePortalPanel = useCallback(() => {
    setIsPortalPanelOpen((prev) => !prev);
  }, []);

  const handleWhatsApp = useCallback(
    (phone?: string | null) => {
      const digits = normalizePhoneDigits(phone);
      if (!digits) return;
      const normalized = digits.startsWith('55') ? digits : `55${digits}`;
      window.open(`https://wa.me/${normalized}`, '_blank', 'noopener,noreferrer');
    },
    [],
  );

  const handleCall = useCallback(
    (phone?: string | null) => {
      if (!normalizePhoneDigits(phone)) return;
      dispatchToast(
        <Toast>
          <ToastTitle>Discagem em desenvolvimento</ToastTitle>
        </Toast>,
        { intent: 'info' },
      );
    },
    [dispatchToast],
  );

  const handleEmailAction = useCallback((email?: string | null) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  }, []);

  const handleNewContact = useCallback(() => {
    setContactDraft({
      name: '',
      relationship_degree: '',
      contact_type: undefined,
      phone_primary: '',
      phone_secondary: '',
      email: '',
      is_legal_guardian: false,
      is_emergency_contact: false,
      is_financial_responsible: false,
      can_authorize_clinical: false,
      can_authorize_financial: false,
      is_main_contact: false,
      contact_time_preference: undefined,
      preferred_contact: undefined,
      observations: '',
    });
  }, []);

  const handleNewCareTeam = useCallback(() => {
    setCareTeamDraft({
      professional_id: undefined,
      profissional_nome: '',
      role_in_case: '',
      status: 'Ativo',
      regime: undefined,
      contact_email: '',
      contact_phone: '',
      notes: '',
    });
  }, []);

  const handleCreateLegalGuardian = useCallback(() => {
    setLegalWizardSeed(null);
    setIsLegalWizardOpen(true);
  }, []);

  const handleEditLegalGuardian = useCallback(() => {
    if (!legalGuardian) return;
    setLegalWizardSeed(legalGuardian);
    setIsLegalWizardOpen(true);
  }, [legalGuardian]);

  const handleDeleteLegalGuardian = useCallback(async () => {
    if (!legalGuardian) return;
    if (!window.confirm('Deseja remover o responsável legal atual?')) return;
    try {
      await deleteRelatedPerson(legalGuardian.id);
      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Responsável legal removido</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao remover responsável legal'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  }, [dispatchToast, legalGuardian, reload]);

  const handleSaveContactInline = useCallback(async () => {
    if (!contactDraft) return;

    setIsContactSaving(true);
    try {
      await upsertRelatedPerson(patientId, contactDraft);
      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Contato salvo</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      setContactDraft(null);
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao salvar contato'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setIsContactSaving(false);
    }
  }, [contactDraft, dispatchToast, patientId, reload]);

  const handleSaveCareInline = useCallback(async () => {
    if (!careTeamDraft) return;

    setIsCareSaving(true);
    try {
      await upsertCareTeamMember(patientId, careTeamDraft);
      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Profissional salvo</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      setCareTeamDraft(null);
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao salvar profissional'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setIsCareSaving(false);
    }
  }, [careTeamDraft, dispatchToast, patientId, reload]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setContactDraft(null);
    setCareTeamDraft(null);
    setLatestInviteLink(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setContactDraft(null);
    setCareTeamDraft(null);
    setLatestInviteLink(null);
  };

  const handleSave = useCallback(async () => {
    if (!isEditing) return;
    setIsSaving(true);
    try {
      if (contactDraft) {
        await upsertRelatedPerson(patientId, contactDraft);
        setContactDraft(null);
      }

      if (careTeamDraft) {
        await upsertCareTeamMember(patientId, careTeamDraft);
        setCareTeamDraft(null);
      }

      if (portalAccess && portalAccess.portal_access_level !== portalAccessLevelDraft) {
        await setPortalAccessLevel(portalAccess.id, portalAccessLevelDraft);
      }

      await reload();
      setIsEditing(false);
      dispatchToast(
        <Toast>
          <ToastTitle>Rede de apoio atualizada</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao salvar'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setIsSaving(false);
    }
  }, [contactDraft, careTeamDraft, dispatchToast, isEditing, patientId, portalAccess, portalAccessLevelDraft, reload]);

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
    [handleSave, reload],
  );

  const handleEditContact = (person: RelatedPersonRow) => {
    setContactDraft({
      id: person.id,
      name: person.name ?? '',
      relationship_degree: person.relationship_degree ?? '',
      contact_type: toOption(contactTypeOptions, person.contact_type),
      phone_primary: person.phone_primary ?? '',
      phone_secondary: '',
      email: person.email ?? '',
      is_legal_guardian: Boolean(person.is_legal_guardian),
      is_emergency_contact: Boolean(person.is_emergency_contact),
      is_financial_responsible: Boolean(person.is_financial_responsible),
      can_authorize_clinical: Boolean(person.can_authorize_clinical),
      can_authorize_financial: Boolean(person.can_authorize_financial),
      is_main_contact: Boolean(person.is_main_contact),
      contact_time_preference: toOption(contactTimePreferenceOptions, person.contact_time_preference),
      preferred_contact: toOption(preferredContactOptions, person.preferred_contact),
      observations: person.observations ?? '',
    });
  };

  const handleEditCareTeam = (member: CareTeamMemberRow) => {
    setCareTeamDraft({
      id: member.id,
      professional_id: member.professional_id ?? undefined,
      profissional_nome: member.profissional_nome ?? '',
      role_in_case: member.role_in_case ?? '',
      status: toOption(careTeamStatusOptions, member.status) ?? 'Ativo',
      regime: toOption(careTeamRegimeOptions, member.regime),
      contact_email: member.contact_email ?? '',
      contact_phone: member.contact_phone ?? '',
      notes: member.notes ?? '',
    });
  };

  const handleCreateInvite = async () => {
    if (!legalGuardian) return;
    try {
      const result = await createPortalInvite(patientId, {
        related_person_id: legalGuardian.id,
        portal_access_level: portalAccessLevelDraft,
        invite_expires_at: null,
      });
      const link = `${window.location.origin}/portal/invite?token=${result.token}`;
      setLatestInviteLink(link);
      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Convite gerado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao gerar convite'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  };

  const handleCopyInvite = async () => {
    if (!latestInviteLink) return;
    try {
      await navigator.clipboard.writeText(latestInviteLink);
      dispatchToast(
        <Toast>
          <ToastTitle>Link copiado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch {
      dispatchToast(
        <Toast>
          <ToastTitle>Falha ao copiar link</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  };

  const handleRevokeInvite = async () => {
    if (!portalAccess?.id) return;
    try {
      await revokePortalInvite(portalAccess.id);
      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Convite revogado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao revogar convite'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Spinner label="Carregando rede de apoio..." />
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
            <p className={styles.muted}>{loadError}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <Toaster toasterId={toasterId} />
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.leftCol}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Responsável legal</div>
                <div className={styles.badgeRow}>
                  <Badge appearance="filled" color={guardianColor}>
                    {guardianStatus.label}
                  </Badge>
                </div>
              </div>
              <div className={styles.cardBody}>
                <dl className={styles.definitionList}>
                  <ReadOnlyRow label="Nome" value={formatText(legalGuardian?.name ?? null)} />
                  <ReadOnlyRow label="Telefone" value={formatPhone(legalGuardian?.phone_primary ?? null)} />
                  <ReadOnlyRow label="Email" value={formatText(legalGuardian?.email ?? null)} />
                  <ReadOnlyRow label="Status documento" value={formatDocumentStatus(latestLegalDoc?.document_status ?? null)} />
                </dl>
                {(legalGuardian?.phone_primary || legalGuardian?.email) && (
                  <div className={styles.contactActions}>
                    {legalGuardian?.phone_primary && (
                      <>
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<ChatRegular />}
                          onClick={() => handleWhatsApp(legalGuardian.phone_primary)}
                        >
                          WhatsApp
                        </Button>
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<CallRegular />}
                          onClick={() => handleCall(legalGuardian.phone_primary)}
                        >
                          Ligar
                        </Button>
                      </>
                    )}
                    {legalGuardian?.email && (
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<MailRegular />}
                        onClick={() => handleEmailAction(legalGuardian.email)}
                      >
                        Email
                      </Button>
                    )}
                  </div>
                )}
                {timeline.length > 0 && (
                  <div className={styles.timeline}>
                    {timeline.map((item) => (
                      <div key={item.key} className={styles.timelineItem}>
                        <span
                          className={styles.timelineDot}
                          style={{
                            backgroundColor: item.done
                              ? tokens.colorPaletteGreenBackground3
                              : tokens.colorNeutralStroke2,
                          }}
                        />
                        <span>{item.label}</span>
                        <Badge appearance="outline" color={item.done ? 'success' : 'subtle'}>
                          {item.done ? 'OK' : 'Pendente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                <p className={styles.muted}>Válido somente após aprovação manual.</p>
                {legalGuardian && (
                  <p className={styles.muted}>
                    {formatUpdatedMeta(legalGuardian.updated_at ?? null, legalGuardian.updated_by ?? null)}
                  </p>
                )}

                <div className={styles.cardFooter}>
                  <Button appearance="outline" icon={<AddRegular />} onClick={handleCreateLegalGuardian}>
                    Cadastrar responsável legal
                  </Button>
                  {legalGuardian && (
                    <>
                      <Button appearance="outline" icon={<EditRegular />} onClick={handleEditLegalGuardian}>
                        Editar responsável
                      </Button>
                      <Button appearance="outline" icon={<DismissRegular />} onClick={() => void handleDeleteLegalGuardian()}>
                        Remover responsável
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Contatos & familiares</div>
              </div>
              <div className={styles.cardBody}>
                {nonLegalRelatedPersons.length === 0 && <div className={styles.empty}>Nenhum contato cadastrado.</div>}
                {nonLegalRelatedPersons.length > 0 && (
                  <div className={styles.list}>
                    {nonLegalRelatedPersons.map((person) => (
                      <div key={person.id} className={styles.listItem}>
                        <div className={styles.row}>
                          <div>
                            <strong>{formatText(person.name ?? null)}</strong>
                            <p className={styles.muted}>{formatText(person.relationship_degree ?? null)}</p>
                            <p className={styles.muted}>{formatPhone(person.phone_primary ?? null)}</p>
                            {(person.phone_primary || person.email) && (
                              <div className={styles.contactActions}>
                                {person.phone_primary && (
                                  <>
                                    <Button
                                      appearance="subtle"
                                      size="small"
                                      icon={<ChatRegular />}
                                      aria-label="WhatsApp"
                                      onClick={() => handleWhatsApp(person.phone_primary)}
                                    />
                                    <Button
                                      appearance="subtle"
                                      size="small"
                                      icon={<CallRegular />}
                                      aria-label="Ligar"
                                      onClick={() => handleCall(person.phone_primary)}
                                    />
                                  </>
                                )}
                                {person.email && (
                                  <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<MailRegular />}
                                    aria-label="Email"
                                    onClick={() => handleEmailAction(person.email)}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                          <div className={styles.badgeRow}>
                            {person.is_payer && <Badge color="success">Pagador</Badge>}
                            {isEditing && person.is_emergency_contact && <Badge color="danger">Emergência</Badge>}
                            {isEditing && (
                              <Button appearance="subtle" size="small" icon={<EditRegular />} onClick={() => handleEditContact(person)}>
                                Editar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {contactDraft && (
                  <div className={styles.formGrid}>
                    <Field label="Nome completo" required>
                      <Input
                        value={contactDraft.name}
                        onChange={(event) =>
                          setContactDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                        }
                      />
                    </Field>
                    <Field label="Parentesco/relacao" required>
                      <Input
                        value={contactDraft.relationship_degree}
                        onChange={(event) =>
                          setContactDraft((prev) =>
                            prev ? { ...prev, relationship_degree: event.target.value } : prev,
                          )
                        }
                      />
                    </Field>
                    <Field label="Telefone">
                      <Input
                        value={contactDraft.phone_primary ?? ''}
                        onChange={(event) =>
                          setContactDraft((prev) =>
                            prev ? { ...prev, phone_primary: maskPhoneInput(event.target.value) } : prev,
                          )
                        }
                      />
                    </Field>
                    <Field label="Email">
                      <Input
                        value={contactDraft.email ?? ''}
                        onChange={(event) =>
                          setContactDraft((prev) => (prev ? { ...prev, email: event.target.value } : prev))
                        }
                      />
                    </Field>
                    {(contactDraft.phone_primary || contactDraft.email) && (
                      <div className={styles.contactActions} style={{ gridColumn: '1 / -1' }}>
                        {contactDraft.phone_primary && (
                          <>
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={<ChatRegular />}
                              onClick={() => handleWhatsApp(contactDraft.phone_primary)}
                            >
                              WhatsApp
                            </Button>
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={<CallRegular />}
                              onClick={() => handleCall(contactDraft.phone_primary)}
                            >
                              Ligar
                            </Button>
                          </>
                        )}
                        {contactDraft.email && (
                          <Button
                            appearance="subtle"
                            size="small"
                            icon={<MailRegular />}
                            onClick={() => handleEmailAction(contactDraft.email)}
                          >
                            Email
                          </Button>
                        )}
                      </div>
                    )}
                    <Field label="Tipo de contato">
                      <Select
                        value={contactDraft.contact_type ?? ''}
                        onChange={(event) => {
                          const value = event.currentTarget?.value ?? '';
                          setContactDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  contact_type: toOption(contactTypeOptions, value),
                                }
                              : prev,
                          );
                        }}
                      >
                        <option value="">Selecione</option>
                        {contactTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Canal preferido">
                      <Select
                        value={contactDraft.preferred_contact ?? ''}
                        onChange={(event) => {
                          const value = event.currentTarget?.value ?? '';
                          setContactDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  preferred_contact: toOption(preferredContactOptions, value),
                                }
                              : prev,
                          );
                        }}
                      >
                        <option value="">Selecione</option>
                        {preferredContactOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Horario preferido">
                      <Select
                        value={contactDraft.contact_time_preference ?? ''}
                        onChange={(event) => {
                          const value = event.currentTarget?.value ?? '';
                          setContactDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  contact_time_preference: toOption(contactTimePreferenceOptions, value),
                                }
                              : prev,
                          );
                        }}
                      >
                        <option value="">Selecione</option>
                        {contactTimePreferenceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Observacoes" style={{ gridColumn: '1 / -1' }}>
                      <Textarea
                        value={contactDraft.observations ?? ''}
                        onChange={(event) =>
                          setContactDraft((prev) => (prev ? { ...prev, observations: event.target.value } : prev))
                        }
                      />
                    </Field>
                    <Field label="Flags" style={{ gridColumn: '1 / -1' }}>
                      <div className={styles.badgeRow}>
                        <label>
                          <input
                            type="checkbox"
                            checked={Boolean(contactDraft.is_emergency_contact)}
                            onChange={(event) =>
                              setContactDraft((prev) =>
                                prev ? { ...prev, is_emergency_contact: event.target.checked } : prev,
                              )
                            }
                          />{' '}
                          Contato emergência
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={Boolean(contactDraft.is_financial_responsible)}
                            onChange={(event) =>
                              setContactDraft((prev) =>
                                prev ? { ...prev, is_financial_responsible: event.target.checked } : prev,
                              )
                            }
                          />{' '}
                          Responsável financeiro
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={Boolean(contactDraft.can_authorize_clinical)}
                            onChange={(event) =>
                              setContactDraft((prev) =>
                                prev ? { ...prev, can_authorize_clinical: event.target.checked } : prev,
                              )
                            }
                          />{' '}
                          Autoriza decisões clínicas
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={Boolean(contactDraft.can_authorize_financial)}
                            onChange={(event) =>
                              setContactDraft((prev) =>
                                prev ? { ...prev, can_authorize_financial: event.target.checked } : prev,
                              )
                            }
                          />{' '}
                          Autoriza decisões financeiras
                        </label>
                      </div>
                    </Field>
                    <div className={styles.formActions}>
                      <Button
                        appearance="primary"
                        onClick={() => void handleSaveContactInline()}
                        disabled={isContactSaving}
                      >
                        {isContactSaving ? 'Salvando...' : 'Salvar contato'}
                      </Button>
                    </div>
                  </div>
                )}
                <div className={styles.cardFooter}>
                  <Button appearance="outline" icon={<AddRegular />} onClick={handleNewContact}>
                    Adicionar contato
                  </Button>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Rede de cuidados (externa)</div>
              </div>
              <div className={styles.cardBody}>
                {careTeamMembers.length === 0 && <div className={styles.empty}>Nenhum profissional cadastrado.</div>}
                {careTeamMembers.length > 0 && (
                  <div className={styles.list}>
                    {careTeamMembers.map((member) => (
                      <div key={member.id} className={styles.listItem}>
                        <div className={styles.row}>
                          <div>
                            <strong>{formatText(member.profissional_nome ?? '')}</strong>
                            <p className={styles.muted}>{formatText(member.role_in_case ?? '')}</p>
                            <p className={styles.muted}>{formatPhone(member.contact_phone ?? '')}</p>
                            {(member.contact_phone || member.contact_email) && (
                              <div className={styles.contactActions}>
                                {member.contact_phone && (
                                  <>
                                    <Button
                                      appearance="subtle"
                                      size="small"
                                      icon={<ChatRegular />}
                                      aria-label="WhatsApp"
                                      onClick={() => handleWhatsApp(member.contact_phone)}
                                    />
                                    <Button
                                      appearance="subtle"
                                      size="small"
                                      icon={<CallRegular />}
                                      aria-label="Ligar"
                                      onClick={() => handleCall(member.contact_phone)}
                                    />
                                  </>
                                )}
                                {member.contact_email && (
                                  <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<MailRegular />}
                                    aria-label="Email"
                                    onClick={() => handleEmailAction(member.contact_email)}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                          {isEditing && (
                            <Button appearance="subtle" size="small" icon={<EditRegular />} onClick={() => handleEditCareTeam(member)}>
                              Editar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {careTeamDraft && (
                  <div className={styles.formGrid}>
                    <Field label="Nome do profissional" required>
                      <Input
                        value={careTeamDraft.profissional_nome ?? ''}
                        onChange={(event) =>
                          setCareTeamDraft((prev) => (prev ? { ...prev, profissional_nome: event.target.value } : prev))
                        }
                      />
                    </Field>
                    <Field label="Papel" required>
                      <Input
                        value={careTeamDraft.role_in_case}
                        onChange={(event) =>
                          setCareTeamDraft((prev) => (prev ? { ...prev, role_in_case: event.target.value } : prev))
                        }
                      />
                    </Field>
                    <Field label="Telefone">
                      <Input
                        value={careTeamDraft.contact_phone ?? ''}
                        onChange={(event) =>
                          setCareTeamDraft((prev) =>
                            prev ? { ...prev, contact_phone: maskPhoneInput(event.target.value) } : prev,
                          )
                        }
                      />
                    </Field>
                    <Field label="Email">
                      <Input
                        value={careTeamDraft.contact_email ?? ''}
                        onChange={(event) =>
                          setCareTeamDraft((prev) => (prev ? { ...prev, contact_email: event.target.value } : prev))
                        }
                      />
                    </Field>
                    {(careTeamDraft.contact_phone || careTeamDraft.contact_email) && (
                      <div className={styles.contactActions} style={{ gridColumn: '1 / -1' }}>
                        {careTeamDraft.contact_phone && (
                          <>
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={<ChatRegular />}
                              onClick={() => handleWhatsApp(careTeamDraft.contact_phone)}
                            >
                              WhatsApp
                            </Button>
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={<CallRegular />}
                              onClick={() => handleCall(careTeamDraft.contact_phone)}
                            >
                              Ligar
                            </Button>
                          </>
                        )}
                        {careTeamDraft.contact_email && (
                          <Button
                            appearance="subtle"
                            size="small"
                            icon={<MailRegular />}
                            onClick={() => handleEmailAction(careTeamDraft.contact_email)}
                          >
                            Email
                          </Button>
                        )}
                      </div>
                    )}
                    <Field label="Status">
                      <Select
                        value={careTeamDraft.status ?? 'Ativo'}
                        onChange={(event) =>
                          setCareTeamDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  status: toOption(careTeamStatusOptions, event.currentTarget.value) ?? 'Ativo',
                                }
                              : prev,
                          )
                        }
                      >
                        {careTeamStatusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Regime">
                      <Select
                        value={careTeamDraft.regime ?? ''}
                        onChange={(event) =>
                          setCareTeamDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  regime: toOption(careTeamRegimeOptions, event.currentTarget.value),
                                }
                              : prev,
                          )
                        }
                      >
                        <option value="">Selecione</option>
                        {careTeamRegimeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Observacoes" style={{ gridColumn: '1 / -1' }}>
                      <Textarea
                        value={careTeamDraft.notes ?? ''}
                        onChange={(event) =>
                          setCareTeamDraft((prev) => (prev ? { ...prev, notes: event.target.value } : prev))
                        }
                      />
                    </Field>
                    <div className={styles.formActions}>
                      <Button appearance="primary" onClick={() => void handleSaveCareInline()} disabled={isCareSaving}>
                        {isCareSaving ? 'Salvando...' : 'Salvar profissional'}
                      </Button>
                    </div>
                  </div>
                )}
                <div className={styles.cardFooter}>
                  <Button appearance="outline" icon={<AddRegular />} onClick={handleNewCareTeam}>
                    Adicionar profissional
                  </Button>
                </div>
              </div>
            </section>
          </div>

          <aside className={styles.rightCol}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Portal do paciente</div>
                <Badge appearance="outline">MVP</Badge>
              </div>
              <div className={styles.cardBody}>
                <dl className={styles.definitionList}>
                  <ReadOnlyRow label="Nivel" value={formatText(portalAccess?.portal_access_level ?? null)} />
                  <ReadOnlyRow label="Convite gerado" value={formatText(portalAccess?.invited_at ?? null)} />
                  <ReadOnlyRow label="Revogado" value={formatText(portalAccess?.revoked_at ?? null)} />
                </dl>

                {isPortalPanelOpen && (
                  <div className={styles.formGrid}>
                    <Field label="Nivel de acesso">
                      <Select
                        value={portalAccessLevelDraft}
                        onChange={(event) =>
                          setPortalAccessLevelDraft(
                            toOption(portalAccessLevelOptions, event.currentTarget.value) ?? 'viewer',
                          )
                        }
                      >
                        {portalAccessLevelOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <div className={styles.formActions}>
                      <Button appearance="primary" icon={<LinkRegular />} onClick={() => void handleCreateInvite()}>
                        Gerar link
                      </Button>
                      {portalAccess?.revoked_at ? null : (
                        <Button appearance="outline" icon={<DismissRegular />} onClick={() => void handleRevokeInvite()}>
                          Revogar
                        </Button>
                      )}
                    </div>
                    {latestInviteLink && (
                      <Field label="Link gerado" style={{ gridColumn: '1 / -1' }}>
                        <Input className={styles.linkInput} value={latestInviteLink} readOnly />
                        <Button appearance="outline" size="small" onClick={() => void handleCopyInvite()}>
                          Copiar link
                        </Button>
                      </Field>
                    )}
                  </div>
                )}
                <div className={styles.cardFooter}>
                  <Button appearance="outline" icon={<LinkRegular />} onClick={togglePortalPanel}>
                    {isPortalPanelOpen ? 'Fechar gerenciamento' : 'Gerenciar portal'}
                  </Button>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
      <LegalGuardianWizardModal
        open={isLegalWizardOpen}
        patientId={patientId}
        initialGuardian={
          legalWizardSeed
            ? {
                id: legalWizardSeed.id,
                name: legalWizardSeed.name ?? null,
                relationship_degree: legalWizardSeed.relationship_degree ?? null,
                phone_primary: legalWizardSeed.phone_primary ?? null,
                email: legalWizardSeed.email ?? null,
                observations: legalWizardSeed.observations ?? null,
              }
            : null
        }
        onClose={() => {
          setIsLegalWizardOpen(false);
          setLegalWizardSeed(null);
        }}
        onCompleted={() => void reload()}
      />
    </>
  );
});
