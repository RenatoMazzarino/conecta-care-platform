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
  CheckmarkRegular,
  EditRegular,
  LinkRegular,
  DismissRegular,
  ShieldLockRegular,
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
import { approveLegalDocumentManual } from '@/features/pacientes/actions/aba03/approveLegalDocumentManual';
import { createPortalInvite } from '@/features/pacientes/actions/aba03/createPortalInvite';
import { getRedeApoioSummary } from '@/features/pacientes/actions/aba03/getRedeApoioSummary';
import { approveLegalDocumentAi } from '@/features/pacientes/actions/aba03/approveLegalDocumentAi';
import { revokePortalInvite } from '@/features/pacientes/actions/aba03/revokePortalInvite';
import { setLegalGuardian } from '@/features/pacientes/actions/aba03/setLegalGuardian';
import { setPortalAccessLevel } from '@/features/pacientes/actions/aba03/setPortalAccessLevel';
import { uploadLegalDocument } from '@/features/pacientes/actions/aba03/uploadLegalDocument';
import { upsertCareTeamMember } from '@/features/pacientes/actions/aba03/upsertCareTeamMember';
import { upsertRelatedPerson } from '@/features/pacientes/actions/aba03/upsertRelatedPerson';

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
  fileInput: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
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
  cardFooter: {
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '24px',
  },
  modalBox: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow8,
    width: '100%',
    maxWidth: '560px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  modalActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
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

function guardianStatusFromDoc(status?: string | null) {
  if (!status) return { label: 'Ausente', tone: 'danger' };
  if (status === 'manual_approved') return { label: 'OK', tone: 'success' };
  return { label: 'Pendente', tone: 'warning' };
}

function toOption<T extends readonly string[]>(options: T, value?: string | null) {
  if (!value) return undefined;
  return options.includes(value as T[number]) ? (value as T[number]) : undefined;
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
  is_legal_guardian?: boolean | null;
  is_emergency_contact?: boolean | null;
  is_financial_responsible?: boolean | null;
  can_authorize_clinical?: boolean | null;
  can_authorize_financial?: boolean | null;
  is_main_contact?: boolean | null;
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

type LegalGuardianForm = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  contact_time_preference?: string | null;
  preferred_contact?: string | null;
  observations?: string;
};

type ContactModalForm = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  contact_type?: string | null;
  contact_time_preference?: string | null;
  preferred_contact?: string | null;
};

type CareTeamModalForm = {
  profissional_nome: string;
  role_in_case: string;
  contact_email?: string;
  contact_phone?: string;
  status?: string | null;
  regime?: string | null;
  notes?: string;
};

const initialLegalForm: LegalGuardianForm = {
  name: '',
  relationship: '',
  phone: '',
  email: '',
  contact_time_preference: undefined,
  preferred_contact: undefined,
  observations: '',
};

const initialContactForm: ContactModalForm = {
  name: '',
  relationship: '',
  phone: '',
  email: '',
  contact_type: undefined,
  contact_time_preference: undefined,
  preferred_contact: undefined,
};

const initialCareTeamForm: CareTeamModalForm = {
  profissional_nome: '',
  role_in_case: '',
  contact_email: '',
  contact_phone: '',
  status: 'Ativo',
  regime: undefined,
  notes: '',
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
  const [contactDraft, setContactDraft] = useState<RelatedPersonUpsertInput | null>(null);
  const [careTeamDraft, setCareTeamDraft] = useState<CareTeamMemberInput | null>(null);
  const [portalAccessLevelDraft, setPortalAccessLevelDraft] = useState<PortalAccessInput['portal_access_level']>('viewer');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [latestInviteLink, setLatestInviteLink] = useState<string | null>(null);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalSaving, setLegalModalSaving] = useState(false);
  const [legalForm, setLegalForm] = useState<LegalGuardianForm>(initialLegalForm);
  const [legalDocumentFile, setLegalDocumentFile] = useState<File | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactModalSaving, setContactModalSaving] = useState(false);
  const [contactModalForm, setContactModalForm] = useState<ContactModalForm>(initialContactForm);
  const [isCareModalOpen, setIsCareModalOpen] = useState(false);
  const [careModalSaving, setCareModalSaving] = useState(false);
  const [careModalForm, setCareModalForm] = useState<CareTeamModalForm>(initialCareTeamForm);
  const [isPortalPanelOpen, setIsPortalPanelOpen] = useState(false);

  const relatedPersons = useMemo(
    () => (summary?.relatedPersons ?? []) as RelatedPersonRow[],
    [summary?.relatedPersons],
  );
  const careTeamMembers = useMemo(
    () => (summary?.careTeamMembers ?? []) as CareTeamMemberRow[],
    [summary?.careTeamMembers],
  );
  const legalDocuments = useMemo(
    () => (summary?.legalDocuments ?? []) as LegalDocumentRow[],
    [summary?.legalDocuments],
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
  );
  const guardianColor = guardianStatus.tone === 'success' ? 'success' : guardianStatus.tone === 'warning' ? 'warning' : 'danger';

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

  const openLegalModal = useCallback(() => {
    setLegalForm(initialLegalForm);
    setLegalDocumentFile(null);
    setIsLegalModalOpen(true);
  }, []);

  const closeLegalModal = useCallback(() => setIsLegalModalOpen(false), []);

  const handleLegalModalSave = useCallback(async () => {
    if (!legalForm.name.trim()) {
      dispatchToast(
        <Toast>
          <ToastTitle>Informe o nome do responsável legal</ToastTitle>
        </Toast>,
        { intent: 'warning' },
      );
      return;
    }

    setLegalModalSaving(true);
    try {
      const related = await upsertRelatedPerson(patientId, {
        name: legalForm.name,
        relationship_degree: legalForm.relationship,
        phone_primary: legalForm.phone,
        email: legalForm.email,
        contact_time_preference: toOption(contactTimePreferenceOptions, legalForm.contact_time_preference) ?? undefined,
        preferred_contact: toOption(preferredContactOptions, legalForm.preferred_contact) ?? undefined,
        is_legal_guardian: true,
        contact_type: 'ResponsavelLegal',
        observations: legalForm.observations,
      });

      if (!related.id) {
        throw new Error('Falha ao cadastrar responsável legal');
      }

      const relatedId = typeof related.id === 'string' ? related.id : null;
      if (!relatedId) {
        throw new Error('Falha ao obter ID do responsável legal');
      }

      await setLegalGuardian(patientId, relatedId);

      if (legalDocumentFile) {
        await uploadLegalDocument(patientId, relatedId, legalDocumentFile, {
          title: legalDocumentFile.name,
          category: 'legal',
        });
      }

      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Responsável legal cadastrado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      closeLegalModal();
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao cadastrar responsável legal'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setLegalModalSaving(false);
    }
  }, [closeLegalModal, dispatchToast, legalDocumentFile, legalForm, patientId, reload]);

  const openContactModal = useCallback(() => {
    setContactModalForm(initialContactForm);
    setIsContactModalOpen(true);
  }, []);

  const closeContactModal = useCallback(() => setIsContactModalOpen(false), []);

  const handleContactModalSave = useCallback(async () => {
    if (!contactModalForm.name.trim()) {
      dispatchToast(
        <Toast>
          <ToastTitle>Informe o nome do contato</ToastTitle>
        </Toast>,
        { intent: 'warning' },
      );
      return;
    }

    setContactModalSaving(true);
    try {
      await upsertRelatedPerson(patientId, {
        name: contactModalForm.name,
        relationship_degree: contactModalForm.relationship,
        phone_primary: contactModalForm.phone,
        email: contactModalForm.email,
        contact_type: toOption(contactTypeOptions, contactModalForm.contact_type) ?? undefined,
        contact_time_preference:
          toOption(contactTimePreferenceOptions, contactModalForm.contact_time_preference) ?? undefined,
        preferred_contact: toOption(preferredContactOptions, contactModalForm.preferred_contact) ?? undefined,
      });
      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Contato cadastrado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      closeContactModal();
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao cadastrar contato'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setContactModalSaving(false);
    }
  }, [closeContactModal, contactModalForm, dispatchToast, patientId, reload]);

  const openCareModal = useCallback(() => {
    setCareModalForm(initialCareTeamForm);
    setIsCareModalOpen(true);
  }, []);

  const closeCareModal = useCallback(() => setIsCareModalOpen(false), []);

  const handleCareModalSave = useCallback(async () => {
    if (!careModalForm.profissional_nome.trim()) {
      dispatchToast(
        <Toast>
          <ToastTitle>Informe o nome do profissional</ToastTitle>
        </Toast>,
        { intent: 'warning' },
      );
      return;
    }

    setCareModalSaving(true);
    try {
      await upsertCareTeamMember(patientId, {
        profissional_nome: careModalForm.profissional_nome,
        role_in_case: careModalForm.role_in_case,
        contact_email: careModalForm.contact_email,
        contact_phone: careModalForm.contact_phone,
        status: toOption(careTeamStatusOptions, careModalForm.status) ?? 'Ativo',
        regime: toOption(careTeamRegimeOptions, careModalForm.regime),
        notes: careModalForm.notes,
      });
      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Profissional cadastrado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      closeCareModal();
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao cadastrar profissional'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setCareModalSaving(false);
    }
  }, [careModalForm, closeCareModal, dispatchToast, patientId, reload]);

  const togglePortalPanel = useCallback(() => {
    setIsPortalPanelOpen((prev) => !prev);
  }, []);

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
    setSelectedFile(null);
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

  const handleSetGuardian = async (personId: string) => {
    try {
      await setLegalGuardian(patientId, personId);
      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Responsável legal atualizado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao definir responsável'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !legalGuardian) return;
    try {
      await uploadLegalDocument(patientId, legalGuardian.id, selectedFile, {
        title: selectedFile.name,
        category: 'legal',
      });
      setSelectedFile(null);
      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Documento enviado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao enviar documento'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  };

  const handleApproveDocument = async () => {
    if (!latestLegalDoc?.id) return;
    try {
      await approveLegalDocumentManual(latestLegalDoc.id);
      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Documento aprovado manualmente</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao aprovar documento'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  };

  const handleAiCheck = async () => {
    if (!latestLegalDoc?.id) return;
    try {
      await approveLegalDocumentAi(latestLegalDoc.id);
      await reload();
      dispatchToast(
        <Toast>
          <ToastTitle>Análise de IA aprovada</ToastTitle>
        </Toast>,
        { intent: 'info' },
      );
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao aprovar IA'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
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
                  {legalGuardian && <Badge>{formatText(legalGuardian.relationship_degree ?? null)}</Badge>}
                </div>
              </div>
              <div className={styles.cardBody}>
                <dl className={styles.definitionList}>
                  <ReadOnlyRow label="Nome" value={formatText(legalGuardian?.name ?? null)} />
                  <ReadOnlyRow label="Telefone" value={formatPhone(legalGuardian?.phone_primary ?? null)} />
                  <ReadOnlyRow label="Email" value={formatText(legalGuardian?.email ?? null)} />
                  <ReadOnlyRow label="Status documento" value={formatDocumentStatus(latestLegalDoc?.document_status ?? null)} />
                </dl>

                {isEditing && legalGuardian && (
                  <div className={styles.formGrid}>
                    <Field label="Anexar documento jurídico">
                      <input
                        className={styles.fileInput}
                        type="file"
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0] ?? null;
                          setSelectedFile(file);
                        }}
                      />
                    </Field>
                    <div className={styles.formActions}>
                      <Button
                        appearance="primary"
                        icon={<AddRegular />}
                        onClick={() => void handleUploadDocument()}
                        disabled={!selectedFile}
                      >
                        Enviar documento
                      </Button>
                      <Button
                        appearance="outline"
                        icon={<ShieldLockRegular />}
                        onClick={() => void handleAiCheck()}
                        disabled={!latestLegalDoc?.id}
                      >
                        Validar com IA
                      </Button>
                      <Button
                        appearance="outline"
                        icon={<CheckmarkRegular />}
                        onClick={() => void handleApproveDocument()}
                        disabled={!latestLegalDoc?.id}
                      >
                        Aprovar manualmente
                      </Button>
                    </div>
                  </div>
                )}

                {isEditing && relatedPersons.length > 0 && (
                  <div className={styles.list}>
                    {relatedPersons.map((person) => (
                      <div key={person.id} className={styles.row}>
                        <div>
                          <strong>{formatText(person.name ?? null)}</strong>
                          <p className={styles.muted}>{formatText(person.relationship_degree ?? null)}</p>
                        </div>
                        {!person.is_legal_guardian && (
                          <Button appearance="outline" size="small" onClick={() => void handleSetGuardian(person.id)}>
                            Definir como responsável
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.cardFooter}>
                  <Button appearance="outline" icon={<AddRegular />} onClick={openLegalModal}>
                    Cadastrar responsável legal
                  </Button>
                  {latestLegalDoc && (
                    <Button appearance="outline" icon={<ShieldLockRegular />} onClick={() => void approveLegalDocumentAi(latestLegalDoc.id)}>
                      Aprovar análise de IA
                    </Button>
                  )}
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Contatos & familiares</div>
              </div>
              <div className={styles.cardBody}>
                {relatedPersons.length === 0 && <div className={styles.empty}>Nenhum contato cadastrado.</div>}
                {relatedPersons.length > 0 && (
                  <div className={styles.list}>
                    {relatedPersons.map((person) => (
                      <div key={person.id} className={styles.listItem}>
                        <div className={styles.row}>
                          <div>
                            <strong>{formatText(person.name ?? null)}</strong>
                            <p className={styles.muted}>{formatText(person.relationship_degree ?? null)}</p>
                            <p className={styles.muted}>{formatPhone(person.phone_primary ?? null)}</p>
                          </div>
                          {isEditing && (
                            <div className={styles.badgeRow}>
                              {person.is_legal_guardian && <Badge color="brand">Legal</Badge>}
                              {person.is_emergency_contact && <Badge color="danger">Emergência</Badge>}
                              <Button appearance="subtle" size="small" icon={<EditRegular />} onClick={() => handleEditContact(person)}>
                                Editar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isEditing && contactDraft && (
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
                          setContactDraft((prev) => (prev ? { ...prev, phone_primary: event.target.value } : prev))
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
                  </div>
                )}
                <div className={styles.cardFooter}>
                  <Button appearance="outline" icon={<AddRegular />} onClick={openContactModal}>
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

                {isEditing && careTeamDraft && (
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
                          setCareTeamDraft((prev) => (prev ? { ...prev, contact_phone: event.target.value } : prev))
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
                  </div>
                )}
                <div className={styles.cardFooter}>
                  <Button appearance="outline" icon={<AddRegular />} onClick={openCareModal}>
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
      {isLegalModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>Cadastro de responsável legal</h3>
              <Button appearance="transparent" icon={<DismissRegular />} onClick={closeLegalModal}>
                Fechar
              </Button>
            </div>
            <div className={styles.formGrid}>
              <Field label="Nome" required>
                <Input value={legalForm.name} onChange={(event) => setLegalForm((prev) => ({ ...prev, name: event.target.value }))} />
              </Field>
              <Field label="Parentesco/função" required>
                <Input
                  value={legalForm.relationship}
                  onChange={(event) => setLegalForm((prev) => ({ ...prev, relationship: event.target.value }))}
                />
              </Field>
              <Field label="Telefone" required>
                <Input
                  value={legalForm.phone}
                  onChange={(event) => setLegalForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </Field>
              <Field label="Email" required>
                <Input
                  value={legalForm.email}
                  onChange={(event) => setLegalForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </Field>
              <Field label="Documento jurídico">
                <input
                  className={styles.fileInput}
                  type="file"
                  onChange={(event) => setLegalDocumentFile(event.currentTarget.files?.[0] ?? null)}
                />
              </Field>
              <Field label="Observações">
                <Textarea
                  value={legalForm.observations}
                  onChange={(event) => setLegalForm((prev) => ({ ...prev, observations: event.target.value }))}
                />
              </Field>
            </div>
            <div className={styles.modalActions}>
              <Button appearance="outline" onClick={closeLegalModal}>
                Cancelar
              </Button>
              <Button appearance="primary" onClick={handleLegalModalSave} disabled={legalModalSaving}>
                {legalModalSaving ? 'Salvando...' : 'Salvar responsável legal'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {isContactModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>Cadastrar contato</h3>
              <Button appearance="transparent" icon={<DismissRegular />} onClick={closeContactModal}>
                Fechar
              </Button>
            </div>
            <div className={styles.formGrid}>
              <Field label="Nome" required>
                <Input value={contactModalForm.name} onChange={(event) => setContactModalForm((prev) => ({ ...prev, name: event.target.value }))} />
              </Field>
              <Field label="Parentesco/função" required>
                <Input
                  value={contactModalForm.relationship}
                  onChange={(event) => setContactModalForm((prev) => ({ ...prev, relationship: event.target.value }))}
                />
              </Field>
              <Field label="Telefone">
                <Input
                  value={contactModalForm.phone}
                  onChange={(event) => setContactModalForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </Field>
              <Field label="Email">
                <Input
                  value={contactModalForm.email}
                  onChange={(event) => setContactModalForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </Field>
              <Field label="Tipo de contato">
                <Select
                  value={contactModalForm.contact_type ?? ''}
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? '';
                    setContactModalForm((prev) => ({ ...prev, contact_type: value || undefined }));
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
                  value={contactModalForm.preferred_contact ?? ''}
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? '';
                    setContactModalForm((prev) => ({ ...prev, preferred_contact: value || undefined }));
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
              <Field label="Horário preferido">
                <Select
                  value={contactModalForm.contact_time_preference ?? ''}
                  onChange={(event) => {
                    const value = event.currentTarget?.value ?? '';
                    setContactModalForm((prev) => ({ ...prev, contact_time_preference: value || undefined }));
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
          </div>
            <div className={styles.modalActions}>
              <Button appearance="outline" onClick={closeContactModal}>
                Cancelar
              </Button>
              <Button appearance="primary" onClick={handleContactModalSave} disabled={contactModalSaving}>
                {contactModalSaving ? 'Salvando...' : 'Salvar contato'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {isCareModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3>Cadastrar profissional</h3>
              <Button appearance="transparent" icon={<DismissRegular />} onClick={closeCareModal}>
                Fechar
              </Button>
            </div>
            <div className={styles.formGrid}>
              <Field label="Nome" required>
                <Input
                  value={careModalForm.profissional_nome}
                  onChange={(event) => setCareModalForm((prev) => ({ ...prev, profissional_nome: event.target.value }))}
                />
              </Field>
              <Field label="Papel" required>
                <Input
                  value={careModalForm.role_in_case}
                  onChange={(event) => setCareModalForm((prev) => ({ ...prev, role_in_case: event.target.value }))}
                />
              </Field>
              <Field label="Telefone">
                <Input
                  value={careModalForm.contact_phone ?? ''}
                  onChange={(event) => setCareModalForm((prev) => ({ ...prev, contact_phone: event.target.value }))}
                />
              </Field>
              <Field label="Email">
                <Input
                  value={careModalForm.contact_email ?? ''}
                  onChange={(event) => setCareModalForm((prev) => ({ ...prev, contact_email: event.target.value }))}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={careModalForm.status ?? 'Ativo'}
                  onChange={(event) =>
                    setCareModalForm((prev) => ({ ...prev, status: toOption(careTeamStatusOptions, event.currentTarget.value) ?? 'Ativo' }))
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
                  value={careModalForm.regime ?? ''}
                  onChange={(event) =>
                    setCareModalForm((prev) => ({ ...prev, regime: toOption(careTeamRegimeOptions, event.currentTarget.value) }))
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
              <Field label="Observações" style={{ gridColumn: '1 / -1' }}>
                <Textarea
                  value={careModalForm.notes ?? ''}
                  onChange={(event) => setCareModalForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </Field>
            </div>
            <div className={styles.modalActions}>
              <Button appearance="outline" onClick={closeCareModal}>
                Cancelar
              </Button>
              <Button appearance="primary" onClick={handleCareModalSave} disabled={careModalSaving}>
                {careModalSaving ? 'Salvando...' : 'Salvar profissional'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
