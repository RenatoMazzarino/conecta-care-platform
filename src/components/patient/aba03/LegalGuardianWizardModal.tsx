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
  CheckmarkRegular,
  DismissRegular,
  ArrowRightRegular,
  SaveRegular,
  ChatRegular,
  CallRegular,
  MailRegular,
} from '@fluentui/react-icons';
import { useCallback, useMemo, useState } from 'react';
import { approveLegalDocumentAi } from '@/features/pacientes/actions/aba03/approveLegalDocumentAi';
import { approveLegalDocumentManual } from '@/features/pacientes/actions/aba03/approveLegalDocumentManual';
import { saveLegalDocumentManualDraft } from '@/features/pacientes/actions/aba03/saveLegalDocumentManualDraft';
import { setLegalGuardian } from '@/features/pacientes/actions/aba03/setLegalGuardian';
import { uploadLegalDocument } from '@/features/pacientes/actions/aba03/uploadLegalDocument';
import { upsertRelatedPerson } from '@/features/pacientes/actions/aba03/upsertRelatedPerson';

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '24px',
  },
  modal: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow8,
    width: '100%',
    maxWidth: '680px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  stepRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  formGrid: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 720px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  actions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  contactActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  note: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  fileInput: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
  },
});

type LegalGuardianWizardModalProps = {
  open: boolean;
  patientId: string;
  onClose: () => void;
  onCompleted?: () => void;
};

type LegalFormState = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  notes: string;
};

const initialForm: LegalFormState = {
  name: '',
  relationship: '',
  phone: '',
  email: '',
  notes: '',
};

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

const documentTypes = [
  { value: 'curatela', label: 'Curatela / Interdição' },
  { value: 'procuracao', label: 'Procuração particular' },
  { value: 'outro', label: 'Outro' },
];

export function LegalGuardianWizardModal({ open, patientId, onClose, onCompleted }: LegalGuardianWizardModalProps) {
  const styles = useStyles();
  const toasterId = useId('legal-wizard-toaster');
  const { dispatchToast } = useToastController(toasterId);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [guardianId, setGuardianId] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [legalForm, setLegalForm] = useState<LegalFormState>(initialForm);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [manualChecklist, setManualChecklist] = useState<Record<string, boolean>>({});
  const [manualNotes, setManualNotes] = useState('');

  const handleWhatsApp = useCallback((phone?: string) => {
    const digits = (phone ?? '').replace(/\D/g, '');
    if (!digits) return;
    const normalized = digits.startsWith('55') ? digits : `55${digits}`;
    window.open(`https://wa.me/${normalized}`, '_blank', 'noopener,noreferrer');
  }, []);

  const handleCall = useCallback(
    (phone?: string) => {
      if (!(phone ?? '').replace(/\D/g, '')) return;
      dispatchToast(
        <Toast>
          <ToastTitle>Discagem em desenvolvimento</ToastTitle>
        </Toast>,
        { intent: 'info' },
      );
    },
    [dispatchToast],
  );

  const handleEmailAction = useCallback((email?: string) => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  }, []);

  const checklistItems = useMemo(() => {
    if (documentType === 'curatela') {
      return ['Documento completo', 'Assinatura válida', 'Número do processo'];
    }
    if (documentType === 'procuracao') {
      return ['Procuração assinada', 'Poderes claros', 'Documento do representante'];
    }
    return ['Documento completo', 'Assinatura válida'];
  }, [documentType]);

  const resetWizard = useCallback(() => {
    setStep(1);
    setSaving(false);
    setGuardianId(null);
    setDocumentId(null);
    setDocumentType('');
    setLegalForm(initialForm);
    setDocumentFile(null);
    setAiRunning(false);
    setAiDone(false);
    setManualChecklist({});
    setManualNotes('');
  }, []);

  const closeWizard = useCallback(() => {
    resetWizard();
    onClose();
  }, [onClose, resetWizard]);

  const handleStep1Save = useCallback(
    async (advance: boolean) => {
      if (!legalForm.name.trim()) {
        dispatchToast(
          <Toast>
            <ToastTitle>Informe o nome do responsável legal</ToastTitle>
          </Toast>,
          { intent: 'warning' },
        );
        return;
      }

      setSaving(true);
      try {
        const related = await upsertRelatedPerson(patientId, {
          name: legalForm.name,
          relationship_degree: legalForm.relationship,
          phone_primary: legalForm.phone,
          email: legalForm.email,
          is_legal_guardian: true,
          contact_type: 'ResponsavelLegal',
          observations: legalForm.notes,
        });

        const relatedId = typeof related.id === 'string' ? related.id : null;
        if (!relatedId) {
          throw new Error('Falha ao obter ID do responsável legal');
        }

        await setLegalGuardian(patientId, relatedId);
        setGuardianId(relatedId);
        dispatchToast(
          <Toast>
            <ToastTitle>Responsável legal cadastrado</ToastTitle>
          </Toast>,
          { intent: 'success' },
        );

        if (advance) {
          setStep(2);
        } else {
          closeWizard();
          onCompleted?.();
        }
      } catch (error) {
        dispatchToast(
          <Toast>
            <ToastTitle>{error instanceof Error ? error.message : 'Falha ao cadastrar responsável legal'}</ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
      } finally {
        setSaving(false);
      }
    },
    [closeWizard, dispatchToast, legalForm, onCompleted, patientId],
  );

  const handleStep2Save = useCallback(
    async (advance: boolean) => {
      if (!guardianId) {
        dispatchToast(
          <Toast>
            <ToastTitle>Cadastre o responsável antes de anexar o documento</ToastTitle>
          </Toast>,
          { intent: 'warning' },
        );
        return;
      }
      if (!documentType) {
        dispatchToast(
          <Toast>
            <ToastTitle>Selecione o tipo de documento</ToastTitle>
          </Toast>,
          { intent: 'warning' },
        );
        return;
      }
      if (!documentFile) {
        dispatchToast(
          <Toast>
            <ToastTitle>Anexe o documento jurídico</ToastTitle>
          </Toast>,
          { intent: 'warning' },
        );
        return;
      }

      setSaving(true);
      try {
        const result = await uploadLegalDocument(patientId, guardianId, documentFile, {
          title: documentFile.name,
          category: 'legal',
          metadata: { document_type: documentType },
        });

        const docId = typeof result.document?.id === 'string' ? (result.document.id as string) : null;
        if (!docId) {
          throw new Error('Falha ao registrar documento');
        }
        setDocumentId(docId);

        dispatchToast(
          <Toast>
            <ToastTitle>Documento anexado</ToastTitle>
          </Toast>,
          { intent: 'success' },
        );

        if (advance) {
          setStep(3);
        } else {
          closeWizard();
          onCompleted?.();
        }
      } catch (error) {
        dispatchToast(
          <Toast>
            <ToastTitle>{error instanceof Error ? error.message : 'Falha ao anexar documento'}</ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
      } finally {
        setSaving(false);
      }
    },
    [closeWizard, dispatchToast, documentFile, documentType, guardianId, onCompleted, patientId],
  );

  const handleAiSimulate = useCallback(
    async (advance: boolean) => {
      if (!documentId) {
        dispatchToast(
          <Toast>
            <ToastTitle>Anexe um documento antes da análise de IA</ToastTitle>
          </Toast>,
          { intent: 'warning' },
        );
        return;
      }

      setAiRunning(true);
      try {
        await approveLegalDocumentAi(documentId, {
          status: 'simulated_passed',
          extracted: { guardian_name: legalForm.name, document_type: documentType },
        });
        setAiDone(true);
        dispatchToast(
          <Toast>
            <ToastTitle>Análise de IA concluída (simulada)</ToastTitle>
          </Toast>,
          { intent: 'success' },
        );

        if (advance) {
          setStep(4);
        } else {
          closeWizard();
          onCompleted?.();
        }
      } catch (error) {
        dispatchToast(
          <Toast>
            <ToastTitle>{error instanceof Error ? error.message : 'Falha ao concluir análise de IA'}</ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
      } finally {
        setAiRunning(false);
      }
    },
    [closeWizard, dispatchToast, documentId, documentType, legalForm.name, onCompleted],
  );

  const handleManualDraft = useCallback(async () => {
    if (!documentId) return;
    setSaving(true);
    try {
      await saveLegalDocumentManualDraft(documentId, {
        checklist: manualChecklist,
        review_notes: manualNotes,
      });
      dispatchToast(
        <Toast>
          <ToastTitle>Rascunho salvo</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao salvar rascunho'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setSaving(false);
    }
  }, [dispatchToast, documentId, manualChecklist, manualNotes]);

  const handleManualSaveExit = useCallback(async () => {
    await handleManualDraft();
    closeWizard();
    onCompleted?.();
  }, [closeWizard, handleManualDraft, onCompleted]);

  const handleManualApprove = useCallback(async () => {
    if (!documentId) return;
    setSaving(true);
    try {
      await approveLegalDocumentManual(documentId, {
        checklist: manualChecklist,
        review_notes: manualNotes,
      });
      dispatchToast(
        <Toast>
          <ToastTitle>Documento aprovado manualmente</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      closeWizard();
      onCompleted?.();
    } catch (error) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error instanceof Error ? error.message : 'Falha ao aprovar documento'}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setSaving(false);
    }
  }, [closeWizard, dispatchToast, documentId, manualChecklist, manualNotes, onCompleted]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <Toaster toasterId={toasterId} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h3>Responsável legal</h3>
            <p className={styles.note}>Válido somente após aprovação manual.</p>
          </div>
          <Button appearance="transparent" icon={<DismissRegular />} onClick={closeWizard}>
            Fechar
          </Button>
        </div>
        <div className={styles.stepRow}>
          <Badge appearance={step === 1 ? 'filled' : 'outline'}>Cadastro</Badge>
          <Badge appearance={step === 2 ? 'filled' : 'outline'}>Documento</Badge>
          <Badge appearance={step === 3 ? 'filled' : 'outline'}>IA</Badge>
          <Badge appearance={step === 4 ? 'filled' : 'outline'}>Manual</Badge>
        </div>

        {step === 1 && (
          <>
            <div className={styles.formGrid}>
              <Field label="Nome completo" required>
                <Input value={legalForm.name} onChange={(event) => setLegalForm((prev) => ({ ...prev, name: event.target.value }))} />
              </Field>
              <Field label="Parentesco/função" required>
                <Input value={legalForm.relationship} onChange={(event) => setLegalForm((prev) => ({ ...prev, relationship: event.target.value }))} />
              </Field>
              <Field label="Telefone">
                <Input value={legalForm.phone} onChange={(event) => setLegalForm((prev) => ({ ...prev, phone: maskPhoneInput(event.target.value) }))} />
              </Field>
              <Field label="Email">
                <Input value={legalForm.email} onChange={(event) => setLegalForm((prev) => ({ ...prev, email: event.target.value }))} />
              </Field>
              {(legalForm.phone || legalForm.email) && (
                <div className={styles.contactActions} style={{ gridColumn: '1 / -1' }}>
                  {legalForm.phone && (
                    <>
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<ChatRegular />}
                        onClick={() => handleWhatsApp(legalForm.phone)}
                      >
                        WhatsApp
                      </Button>
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<CallRegular />}
                        onClick={() => handleCall(legalForm.phone)}
                      >
                        Ligar
                      </Button>
                    </>
                  )}
                  {legalForm.email && (
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<MailRegular />}
                      onClick={() => handleEmailAction(legalForm.email)}
                    >
                      Email
                    </Button>
                  )}
                </div>
              )}
              <Field label="Observações" style={{ gridColumn: '1 / -1' }}>
                <Textarea value={legalForm.notes} onChange={(event) => setLegalForm((prev) => ({ ...prev, notes: event.target.value }))} />
              </Field>
            </div>
            <div className={styles.actions}>
              <Button appearance="outline" icon={<SaveRegular />} onClick={() => void handleStep1Save(false)} disabled={saving}>
                Salvar e sair
              </Button>
              <Button appearance="primary" icon={<ArrowRightRegular />} onClick={() => void handleStep1Save(true)} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar e continuar'}
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles.formGrid}>
              <Field label="Tipo de documento" required>
                <Select value={documentType} onChange={(event) => setDocumentType(event.currentTarget.value)}>
                  <option value="">Selecione</option>
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Upload do documento" required>
                <input className={styles.fileInput} type="file" onChange={(event) => setDocumentFile(event.currentTarget.files?.[0] ?? null)} />
              </Field>
            </div>
            <div className={styles.actions}>
              <Button appearance="outline" icon={<SaveRegular />} onClick={() => void handleStep2Save(false)} disabled={saving}>
                Salvar e sair
              </Button>
              <Button appearance="primary" icon={<ArrowRightRegular />} onClick={() => void handleStep2Save(true)} disabled={saving}>
                {saving ? 'Enviando...' : 'Salvar e continuar'}
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <p className={styles.note}>Análise automática simulada (IA OFF). Use o botão de desenvolvimento para concluir.</p>
              {aiRunning ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Spinner size="small" />
                  <span>Analisando...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge appearance="outline">{aiDone ? 'Concluída' : 'Pendente'}</Badge>
                </div>
              )}
            </div>
            <div className={styles.actions}>
              <Button appearance="outline" icon={<SaveRegular />} onClick={() => { closeWizard(); onCompleted?.(); }} disabled={aiRunning}>
                Salvar e sair
              </Button>
              <Button appearance="primary" icon={<CheckmarkRegular />} onClick={() => void handleAiSimulate(true)} disabled={aiRunning}>
                {aiRunning ? 'Processando...' : 'Concluir análise IA'}
              </Button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className={styles.formGrid}>
              <Field label="Checklist manual" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {checklistItems.map((item) => (
                    <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(manualChecklist[item])}
                        onChange={(event) =>
                          setManualChecklist((prev) => ({ ...prev, [item]: event.target.checked }))
                        }
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Notas da conferência" style={{ gridColumn: '1 / -1' }}>
                <Textarea value={manualNotes} onChange={(event) => setManualNotes(event.target.value)} />
              </Field>
            </div>
            <div className={styles.actions}>
              <Button appearance="outline" icon={<SaveRegular />} onClick={handleManualSaveExit} disabled={saving}>
                Salvar e sair
              </Button>
              <Button appearance="outline" icon={<SaveRegular />} onClick={handleManualDraft} disabled={saving}>
                Salvar rascunho
              </Button>
              <Button appearance="primary" icon={<CheckmarkRegular />} onClick={handleManualApprove} disabled={saving}>
                {saving ? 'Aprovando...' : 'Aprovar manualmente'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
