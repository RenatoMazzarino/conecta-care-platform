'use client';

import {
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
import { AddRegular, ArrowClockwiseRegular, PrintRegular } from '@fluentui/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Database } from '@/types/supabase';
import {
  gedCategoryOptions,
  gedDocDomainOptions,
  gedDocOriginOptions,
  gedDocSourceOptions,
  gedDocStatusEnumOptions,
  gedDocTypeOptions,
  type GedDocumentInput,
} from '@/features/pacientes/schemas/aba05Ged.schema';
import { listGedDocuments, type GedDocumentFilters } from '@/features/pacientes/actions/aba05/listGedDocuments';
import { getGedDocumentDetails } from '@/features/pacientes/actions/aba05/getGedDocumentDetails';
import { getGedDocumentPreview } from '@/features/pacientes/actions/aba05/getGedDocumentPreview';
import { uploadGedDocument } from '@/features/pacientes/actions/aba05/uploadGedDocument';
import { printGedDocument } from '@/features/pacientes/actions/aba05/printGedDocument';
import { createGedSecureLink } from '@/features/pacientes/actions/aba05/createGedSecureLink';
import { consumeGedSecureLink } from '@/features/pacientes/actions/aba05/consumeGedSecureLink';
import { revokeGedSecureLink } from '@/features/pacientes/actions/aba05/revokeGedSecureLink';
import {
  listBulkImportItems,
  startGedBulkImport,
  reviewBulkImportItem,
  type BulkImportScope,
} from '@/features/pacientes/actions/aba05/bulkImport';
import { isDicomFile } from '@/features/pacientes/actions/aba05/shared';

const useStyles = makeStyles({
  container: {
    padding: '0 0 32px',
  },
  commandBar: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '10px 0',
  },
  commandPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    borderRadius: '999px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: '#ffffff',
    fontSize: '12px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground2,
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
    gridTemplateColumns: '1fr',
    gap: '16px',
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
  muted: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
  list: {
    display: 'grid',
    gap: '8px',
  },
  listRow: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1fr 1fr 1fr',
    gap: '10px',
    padding: '10px',
    borderRadius: '6px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: 'pointer',
    backgroundColor: '#fafafa',
    ':hover': {
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      backgroundColor: '#f5f5f5',
    },
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
  listRowActive: {
    border: '1px solid #0f6cbd',
    backgroundColor: '#eef4fb',
  },
  listCellTitle: {
    fontWeight: 700,
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
  },
  listCellMeta: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  viewerWrap: {
    position: 'relative',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  viewerBanner: {
    backgroundColor: '#eef4fb',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#0f6cbd',
  },
  viewerContent: {
    position: 'relative',
    minHeight: '420px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  watermark: {
    position: 'absolute',
    inset: 0,
    opacity: 0.3,
    pointerEvents: 'none',
  },
  viewerFrame: {
    width: '100%',
    height: '520px',
    border: 0,
  },
  viewerImage: {
    maxWidth: '100%',
    maxHeight: '520px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    '@media (max-width: 720px)': {
      gridTemplateColumns: '1fr',
    },
  },
  formFull: {
    gridColumn: '1 / -1',
  },
  fileInput: {
    width: '100%',
  },
  inlineActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  detailsList: {
    margin: 0,
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
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
  },
  timelineList: {
    display: 'grid',
    gap: '10px',
  },
  timelineItem: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingBottom: '10px',
  },
  timelineTitle: {
    fontWeight: 700,
    fontSize: '12.5px',
  },
  timelineMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
});

type GedDocumentRow = Database['public']['Tables']['patient_documents']['Row'];
type GedDocumentLog = Database['public']['Tables']['patient_document_logs']['Row'];
type GedArtifact = Database['public']['Tables']['document_artifacts']['Row'];
type GedSecureLink = Database['public']['Tables']['document_secure_links']['Row'];
type GedImportItem = Database['public']['Tables']['document_import_job_items']['Row'];

interface GedTabProps {
  patientId: string;
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR');
}

function buildWatermarkPattern(text: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="260">
    <text x="0" y="130" fill="rgba(0,0,0,0.14)" font-size="18" font-family="Segoe UI" transform="rotate(-24 200 120)">${text}</text>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

export function GedTab({ patientId }: GedTabProps) {
  const styles = useStyles();
  const toasterId = useId('ged-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [documents, setDocuments] = useState<GedDocumentRow[]>([]);
  const [filters, setFilters] = useState<GedDocumentFilters>({});
  const [loading, setLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<GedDocumentRow | null>(null);
  const [logs, setLogs] = useState<GedDocumentLog[]>([]);
  const [artifacts, setArtifacts] = useState<GedArtifact[]>([]);
  const [secureLinks, setSecureLinks] = useState<GedSecureLink[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);

  const [uploadPayload, setUploadPayload] = useState<GedDocumentInput>({
    title: '',
    category: 'clinical',
    doc_type: 'laudo',
    doc_domain: 'Clinico',
    doc_source: 'Ficha',
    doc_origin: 'Ficha_Documentos',
    description: null,
    tags: [],
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [bulkScope, setBulkScope] = useState<BulkImportScope>('single');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkItems, setBulkItems] = useState<GedImportItem[]>([]);
  const [bulkJobId, setBulkJobId] = useState<string | null>(null);

  const [reviewItem, setReviewItem] = useState<GedImportItem | null>(null);
  const [reviewPayload, setReviewPayload] = useState<GedDocumentInput>({
    title: '',
    category: 'other',
    doc_type: 'outros',
    doc_domain: 'Misto',
    doc_source: 'Importacao',
    doc_origin: 'Importacao',
    description: null,
    tags: [],
  });

  const [secureToken, setSecureToken] = useState<string | null>(null);
  const [secureBusy, setSecureBusy] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);
  const [allowCapture, setAllowCapture] = useState(false);

  const isDev = process.env.NODE_ENV === 'development';
  const shareLink = useMemo(() => {
    if (!secureToken || typeof window === 'undefined') return '';
    return `${window.location.origin}/ged/original?token=${secureToken}`;
  }, [secureToken]);

  const watermarkText = useMemo(() => {
    if (!selectedDoc) return '';
    return `Conecta Care • ${selectedDoc.title ?? 'Documento'} • ${formatDateTime(new Date().toISOString())}`;
  }, [selectedDoc]);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listGedDocuments(patientId, filters);
      setDocuments(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar GED';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setLoading(false);
    }
  }, [dispatchToast, filters, patientId]);

  const loadDetails = useCallback(
    async (documentId: string) => {
      setViewerLoading(true);
      setViewerError(null);
      try {
        const details = await getGedDocumentDetails(documentId);
        setSelectedDoc(details.document);
        setLogs(details.logs as GedDocumentLog[]);
        setArtifacts(details.artifacts as GedArtifact[]);
        setSecureLinks(details.secureLinks as GedSecureLink[]);

        const preview = await getGedDocumentPreview(documentId);
        setPreviewUrl(preview.url);
        setPreviewMime(preview.document.mime_type ?? null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao carregar documento';
        setViewerError(message);
        dispatchToast(
          <Toast>
            <ToastTitle>{message}</ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
      } finally {
        setViewerLoading(false);
      }
    },
    [dispatchToast],
  );

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (selectedDocId) {
      void loadDetails(selectedDocId);
    }
  }, [selectedDocId, loadDetails]);

  const handleUpload = async () => {
    if (!uploadFile) {
      dispatchToast(
        <Toast>
          <ToastTitle>Selecione um arquivo</ToastTitle>
        </Toast>,
        { intent: 'warning' },
      );
      return;
    }
    setUploading(true);
    try {
      await uploadGedDocument(patientId, uploadFile, uploadPayload);
      dispatchToast(
        <Toast>
          <ToastTitle>Documento enviado com sucesso</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      setUploadFile(null);
      setUploadPayload((prev) => ({ ...prev, title: '', description: null }));
      await loadDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar documento';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setUploading(false);
    }
  };

  const handlePrint = async () => {
    if (!selectedDoc) return;
    setPrintBusy(true);
    try {
      const result = await printGedDocument(selectedDoc.id);
      if (result.artifactUrl) {
        window.open(result.artifactUrl, '_blank', 'noopener,noreferrer');
      }
      await loadDetails(selectedDoc.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao imprimir';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setPrintBusy(false);
    }
  };

  const handleSecureLink = async () => {
    if (!selectedDoc) return;
    setSecureBusy(true);
    try {
      const result = await createGedSecureLink(selectedDoc.id);
      setSecureToken(result.token);
      dispatchToast(
        <Toast>
          <ToastTitle>Link seguro gerado (expira em {formatDateTime(result.expiresAt)})</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      await loadDetails(selectedDoc.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao criar link seguro';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setSecureBusy(false);
    }
  };

  const handleConsumeSecureLink = async () => {
    if (!secureToken) return;
    setSecureBusy(true);
    try {
      const result = await consumeGedSecureLink(secureToken);
      window.open(result.url, '_blank', 'noopener,noreferrer');
      setSecureToken(null);
      if (selectedDoc) {
        await loadDetails(selectedDoc.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao baixar original';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setSecureBusy(false);
    }
  };

  const handleRevokeLink = async (linkId: string) => {
    setSecureBusy(true);
    try {
      await revokeGedSecureLink(linkId);
      dispatchToast(
        <Toast>
          <ToastTitle>Link revogado</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      if (selectedDoc) {
        await loadDetails(selectedDoc.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao revogar link';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setSecureBusy(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkFile) {
      dispatchToast(
        <Toast>
          <ToastTitle>Selecione um ZIP para importar</ToastTitle>
        </Toast>,
        { intent: 'warning' },
      );
      return;
    }
    setBulkBusy(true);
    try {
      const result = await startGedBulkImport(bulkScope, bulkFile, bulkScope === 'single' ? patientId : null);
      setBulkJobId(result.jobId);
      const items = await listBulkImportItems(result.jobId);
      setBulkItems(items as GedImportItem[]);
      dispatchToast(
        <Toast>
          <ToastTitle>Importacao concluida ({result.status})</ToastTitle>
        </Toast>,
        { intent: result.failedItems > 0 ? 'warning' : 'success' },
      );
      await loadDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao importar ZIP';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setBulkBusy(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewItem) return;
    setBulkBusy(true);
    try {
      await reviewBulkImportItem(reviewItem.id, reviewPayload, patientId);
      const items = bulkJobId ? await listBulkImportItems(bulkJobId) : [];
      setBulkItems(items as GedImportItem[]);
      setReviewItem(null);
      dispatchToast(
        <Toast>
          <ToastTitle>Item revisado com sucesso</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      await loadDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao revisar item';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setBulkBusy(false);
    }
  };

  const selectedPreviewType = previewMime ?? selectedDoc?.mime_type ?? '';
  const isPdf = selectedPreviewType.includes('pdf');
  const isImage = selectedPreviewType.startsWith('image/');
  const isDicom = selectedDoc ? isDicomFile(selectedDoc.file_name ?? '', selectedDoc.mime_type) : false;

  return (
    <div className={styles.container}>
      <Toaster toasterId={toasterId} />

      <div className={styles.commandBar}>
        <Button icon={<ArrowClockwiseRegular />} onClick={loadDocuments} disabled={loading}>
          Recarregar
        </Button>
        <Button icon={<PrintRegular />} onClick={handlePrint} disabled={!selectedDoc || printBusy || isDicom}>
          Imprimir (derivado)
        </Button>
        <Button icon={<AddRegular />} onClick={handleSecureLink} disabled={!selectedDoc || secureBusy}>
          Solicitar original
        </Button>
        {isDev && (
          <Checkbox
            checked={allowCapture}
            onChange={(_, data) => setAllowCapture(Boolean(data.checked))}
            label="Habilitar captura/print (DEV)"
          />
        )}
        <span className={styles.commandPill}>GED Aba 05</span>
      </div>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Biblioteca GED</div>
              {loading && <Spinner size="tiny" />}
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <Field label="Categoria">
                  <Select
                    value={filters.category ?? ''}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        category: event.target.value ? (event.target.value as GedDocumentFilters['category']) : undefined,
                      }))
                    }
                  >
                    <option value="">Todas</option>
                    {gedCategoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Tipo">
                  <Select
                    value={filters.doc_type ?? ''}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        doc_type: event.target.value ? (event.target.value as GedDocumentFilters['doc_type']) : undefined,
                      }))
                    }
                  >
                    <option value="">Todos</option>
                    {gedDocTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Status">
                  <Select
                    value={filters.doc_status ?? ''}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        doc_status: event.target.value
                          ? (event.target.value as GedDocumentFilters['doc_status'])
                          : undefined,
                      }))
                    }
                  >
                    <option value="">Todos</option>
                    {gedDocStatusEnumOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Busca">
                  <Input
                    value={filters.search ?? ''}
                    onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                    placeholder="Titulo do documento"
                  />
                </Field>
              </div>

              <div style={{ marginTop: '12px' }} className={styles.list}>
                {documents.length === 0 && <p className={styles.muted}>Nenhum documento encontrado.</p>}
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`${styles.listRow} ${selectedDocId === doc.id ? styles.listRowActive : ''}`}
                    onClick={() => setSelectedDocId(doc.id)}
                  >
                    <div>
                      <div className={styles.listCellTitle}>{doc.title}</div>
                      <div className={styles.listCellMeta}>{doc.subcategory || '—'}</div>
                    </div>
                    <div className={styles.listCellMeta}>{doc.category}</div>
                    <div className={styles.listCellMeta}>{doc.document_status}</div>
                    <div className={styles.listCellMeta}>{formatDateTime(doc.uploaded_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Viewer protegido</div>
              {viewerLoading && <Spinner size="tiny" />}
            </div>
            <div className={styles.cardBody}>
              {!selectedDoc && <p className={styles.muted}>Selecione um documento para visualizar.</p>}
              {selectedDoc && (
                <div className={styles.viewerWrap}>
                  <div className={styles.viewerBanner}>Documento em custodia Conecta Care</div>
                  <div className={styles.viewerContent}>
                    {viewerError && <p className={styles.muted}>{viewerError}</p>}
                    {!viewerError && !previewUrl && <p className={styles.muted}>Pré-visualização indisponível.</p>}
                    {isDicom && <p className={styles.muted}>DICOM (custodia apenas). Solicite o original.</p>}
                    {!isDicom && previewUrl && isPdf && (
                      <iframe title="GED preview" src={previewUrl} className={styles.viewerFrame} />
                    )}
                    {!isDicom && previewUrl && isImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="Documento" className={styles.viewerImage} />
                    )}
                    {!isDicom && previewUrl && !isPdf && !isImage && (
                      <p className={styles.muted}>Formato nao suportado para viewer. Use o download do original.</p>
                    )}
                    {!allowCapture && previewUrl && !isDicom && (
                      <div
                        className={styles.watermark}
                        style={{
                          backgroundImage: buildWatermarkPattern(watermarkText),
                          backgroundRepeat: 'repeat',
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Upload rapido</div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <Field label="Titulo">
                  <Input
                    value={uploadPayload.title}
                    onChange={(event) => setUploadPayload((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Titulo do documento"
                  />
                </Field>
                <Field label="Categoria">
                  <Select
                    value={uploadPayload.category}
                    onChange={(event) =>
                      setUploadPayload((prev) => ({
                        ...prev,
                        category: event.target.value as GedDocumentInput['category'],
                      }))
                    }
                  >
                    {gedCategoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Tipo">
                  <Select
                    value={uploadPayload.doc_type}
                    onChange={(event) =>
                      setUploadPayload((prev) => ({
                        ...prev,
                        doc_type: event.target.value as GedDocumentInput['doc_type'],
                      }))
                    }
                  >
                    {gedDocTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Dominio">
                  <Select
                    value={uploadPayload.doc_domain}
                    onChange={(event) =>
                      setUploadPayload((prev) => ({
                        ...prev,
                        doc_domain: event.target.value as GedDocumentInput['doc_domain'],
                      }))
                    }
                  >
                    {gedDocDomainOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Fonte">
                  <Select
                    value={uploadPayload.doc_source}
                    onChange={(event) =>
                      setUploadPayload((prev) => ({
                        ...prev,
                        doc_source: event.target.value as GedDocumentInput['doc_source'],
                      }))
                    }
                  >
                    {gedDocSourceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Origem">
                  <Select
                    value={uploadPayload.doc_origin}
                    onChange={(event) =>
                      setUploadPayload((prev) => ({
                        ...prev,
                        doc_origin: event.target.value as GedDocumentInput['doc_origin'],
                      }))
                    }
                  >
                    {gedDocOriginOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Descricao" className={styles.formFull}>
                  <Textarea
                    value={uploadPayload.description ?? ''}
                    onChange={(event) => setUploadPayload((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </Field>
                <Field label="Arquivo" className={styles.formFull}>
                  <input
                    className={styles.fileInput}
                    type="file"
                    onChange={(event) => setUploadFile(event.currentTarget.files?.[0] ?? null)}
                  />
                </Field>
              </div>
              <div style={{ marginTop: '12px' }} className={styles.inlineActions}>
                <Button appearance="primary" onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Enviando...' : 'Enviar documento'}
                </Button>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Importacao em massa (ZIP)</div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <Field label="Escopo">
                  <Select value={bulkScope} onChange={(event) => setBulkScope(event.target.value as BulkImportScope)}>
                    <option value="single">Somente este paciente</option>
                    <option value="multi">Multi-paciente (manifest obrigatorio)</option>
                  </Select>
                </Field>
                <Field label="ZIP" className={styles.formFull}>
                  <input
                    className={styles.fileInput}
                    type="file"
                    onChange={(event) => setBulkFile(event.currentTarget.files?.[0] ?? null)}
                  />
                </Field>
              </div>
              <div style={{ marginTop: '12px' }} className={styles.inlineActions}>
                <Button appearance="primary" onClick={handleBulkImport} disabled={bulkBusy}>
                  {bulkBusy ? 'Processando...' : 'Iniciar importacao'}
                </Button>
              </div>
              {bulkJobId && (
                <div style={{ marginTop: '12px' }}>
                  <p className={styles.muted}>Job: {bulkJobId}</p>
                  {bulkItems.length > 0 && (
                    <div className={styles.list}>
                      {bulkItems.map((item) => (
                        <div key={item.id} className={styles.listRow}>
                          <div>
                            <div className={styles.listCellTitle}>{item.original_file_name ?? item.file_path}</div>
                            <div className={styles.listCellMeta}>{item.status}</div>
                          </div>
                          <div className={styles.listCellMeta}>{item.error_detail ?? '—'}</div>
                          <div className={styles.listCellMeta}>{item.patient_id ?? '—'}</div>
                          <div className={styles.inlineActions}>
                            {item.status === 'needs_review' && (
                              <Button
                                size="small"
                                onClick={() => {
                                  setReviewItem(item);
                                  setReviewPayload((prev) => ({
                                    ...prev,
                                    title: item.original_file_name ?? prev.title,
                                  }));
                                }}
                              >
                                Revisar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {reviewItem && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Revisao de item</div>
                <Button size="small" onClick={() => setReviewItem(null)}>
                  Fechar
                </Button>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="Titulo">
                    <Input
                      value={reviewPayload.title}
                      onChange={(event) => setReviewPayload((prev) => ({ ...prev, title: event.target.value }))}
                    />
                  </Field>
                  <Field label="Categoria">
                    <Select
                      value={reviewPayload.category}
                      onChange={(event) =>
                        setReviewPayload((prev) => ({
                          ...prev,
                          category: event.target.value as GedDocumentInput['category'],
                        }))
                      }
                    >
                      {gedCategoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Tipo">
                    <Select
                      value={reviewPayload.doc_type}
                      onChange={(event) =>
                        setReviewPayload((prev) => ({
                          ...prev,
                          doc_type: event.target.value as GedDocumentInput['doc_type'],
                        }))
                      }
                    >
                      {gedDocTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Dominio">
                    <Select
                      value={reviewPayload.doc_domain}
                      onChange={(event) =>
                        setReviewPayload((prev) => ({
                          ...prev,
                          doc_domain: event.target.value as GedDocumentInput['doc_domain'],
                        }))
                      }
                    >
                      {gedDocDomainOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Fonte">
                    <Select
                      value={reviewPayload.doc_source}
                      onChange={(event) =>
                        setReviewPayload((prev) => ({
                          ...prev,
                          doc_source: event.target.value as GedDocumentInput['doc_source'],
                        }))
                      }
                    >
                      {gedDocSourceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Origem">
                    <Select
                      value={reviewPayload.doc_origin}
                      onChange={(event) =>
                        setReviewPayload((prev) => ({
                          ...prev,
                          doc_origin: event.target.value as GedDocumentInput['doc_origin'],
                        }))
                      }
                    >
                      {gedDocOriginOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <div style={{ marginTop: '12px' }} className={styles.inlineActions}>
                  <Button appearance="primary" onClick={handleReviewSubmit} disabled={bulkBusy}>
                    Aprovar item
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className={styles.rightCol}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Detalhes</div>
            </div>
            <div className={styles.cardBody}>
              {!selectedDoc && <p className={styles.muted}>Selecione um documento.</p>}
              {selectedDoc && (
                <dl className={styles.detailsList}>
                  <dt>Titulo</dt>
                  <dd>{selectedDoc.title}</dd>
                  <dt>Categoria</dt>
                  <dd>{selectedDoc.category}</dd>
                  <dt>Tipo</dt>
                  <dd>{selectedDoc.subcategory ?? '—'}</dd>
                  <dt>Status</dt>
                  <dd>{selectedDoc.document_status}</dd>
                  <dt>Hash</dt>
                  <dd>{selectedDoc.file_hash ?? '—'}</dd>
                  <dt>Uploaded</dt>
                  <dd>{formatDateTime(selectedDoc.uploaded_at)}</dd>
                </dl>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Artefatos</div>
            </div>
            <div className={styles.cardBody}>
              {artifacts.length === 0 && <p className={styles.muted}>Nenhum artefato gerado.</p>}
              {artifacts.length > 0 && (
                <div className={styles.list}>
                  {artifacts.map((artifact) => (
                    <div key={artifact.id} className={styles.listRow}>
                      <div>
                        <div className={styles.listCellTitle}>{artifact.artifact_type}</div>
                        <div className={styles.listCellMeta}>{formatDateTime(artifact.created_at)}</div>
                      </div>
                      <div className={styles.listCellMeta}>{artifact.mime_type ?? '—'}</div>
                      <div className={styles.listCellMeta}>{artifact.file_hash.slice(0, 10)}...</div>
                      <div />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Link seguro do original</div>
            </div>
            <div className={styles.cardBody}>
              {!selectedDoc && <p className={styles.muted}>Selecione um documento.</p>}
              {selectedDoc && (
                <div className={styles.list}>
                  {secureToken && (
                    <div className={styles.inlineActions}>
                      <Button appearance="primary" onClick={handleConsumeSecureLink} disabled={secureBusy}>
                        Baixar original (download unico)
                      </Button>
                      {shareLink && (
                        <Button
                          onClick={() => navigator.clipboard.writeText(shareLink)}
                          disabled={secureBusy}
                        >
                          Copiar link
                        </Button>
                      )}
                      <Button onClick={() => setSecureToken(null)} disabled={secureBusy}>
                        Limpar token
                      </Button>
                    </div>
                  )}
                  {shareLink && <p className={styles.muted}>Link seguro: {shareLink}</p>}
                  {secureLinks.map((link) => (
                    <div key={link.id} className={styles.listRow}>
                      <div>
                        <div className={styles.listCellTitle}>Expira em {formatDateTime(link.expires_at)}</div>
                        <div className={styles.listCellMeta}>Downloads: {link.downloads_count}</div>
                      </div>
                      <div className={styles.listCellMeta}>{link.revoked_at ? 'Revogado' : 'Ativo'}</div>
                      <div className={styles.inlineActions}>
                        {!link.revoked_at && (
                          <Button size="small" onClick={() => handleRevokeLink(link.id)} disabled={secureBusy}>
                            Revogar
                          </Button>
                        )}
                      </div>
                      <div />
                    </div>
                  ))}
                  {secureLinks.length === 0 && <p className={styles.muted}>Nenhum link ativo.</p>}
                </div>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Auditoria</div>
            </div>
            <div className={styles.cardBody}>
              {logs.length === 0 && <p className={styles.muted}>Sem eventos.</p>}
              {logs.length > 0 && (
                <div className={styles.timelineList}>
                  {logs.map((log) => (
                    <div key={log.id} className={styles.timelineItem}>
                      <div className={styles.timelineTitle}>{log.action}</div>
                      <div className={styles.timelineMeta}>{formatDateTime(log.happened_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
