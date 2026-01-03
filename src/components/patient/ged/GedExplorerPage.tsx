'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Spinner,
  Toaster,
  Toast,
  ToastTitle,
  makeStyles,
  mergeClasses,
  tokens,
  useId,
  useToastController,
} from '@fluentui/react-components';
import type { Database } from '@/types/supabase';
import { GedFolderTree, type GedFolderNode } from './GedFolderTree';
import { GedSearchBar } from './GedSearchBar';
import { GedFileTable } from './GedFileTable';
import { GedCommandBar } from './GedCommandBar';
import { GedBreadcrumbs } from './GedBreadcrumbs';
import { GedBulkActionsBar } from './GedBulkActionsBar';
import { GedFolderModal, type GedFolderModalMode } from './GedFolderModal';
import { GedDocumentViewerModal } from '@/components/patient/aba05/GedDocumentViewerModal';
import { GedBulkImportModal } from '@/components/patient/aba05/GedBulkImportModal';
import { GedQuickUploadModal, type GedQuickUploadItem } from '@/components/patient/aba05/GedQuickUploadModal';
import { GedCustodyCenterModal } from '@/components/patient/aba05/GedCustodyCenterModal';
import type { GedDocumentInput } from '@/features/pacientes/schemas/aba05Ged.schema';
import { listGedDocuments, type GedDocumentFilters } from '@/features/pacientes/actions/aba05/listGedDocuments';
import { getGedDocumentDetails } from '@/features/pacientes/actions/aba05/getGedDocumentDetails';
import { getGedDocumentPreview } from '@/features/pacientes/actions/aba05/getGedDocumentPreview';
import { uploadGedDocument } from '@/features/pacientes/actions/aba05/uploadGedDocument';
import { printGedDocument } from '@/features/pacientes/actions/aba05/printGedDocument';
import { createGedSecureLink } from '@/features/pacientes/actions/aba05/createGedSecureLink';
import { consumeGedSecureLink } from '@/features/pacientes/actions/aba05/consumeGedSecureLink';
import { revokeGedSecureLink } from '@/features/pacientes/actions/aba05/revokeGedSecureLink';
import { archiveGedDocuments } from '@/features/pacientes/actions/aba05/archiveGedDocuments';
import { getGedArtifactDownloadLink } from '@/features/pacientes/actions/aba05/getGedArtifactDownloadLink';
import { listGedCustodyOverview } from '@/features/pacientes/actions/aba05/listGedCustodyOverview';
import { startGedBulkImport, reviewBulkImportItem, listBulkImportItems } from '@/features/pacientes/actions/aba05/bulkImport';
import { isDicomFile } from '@/features/pacientes/actions/aba05/shared';
import {
  createGedFolder,
  deleteGedFolder,
  ensurePatientGedFolders,
  listGedFolders,
  moveGedFolder,
  renameGedFolder,
  type GedFolderRow,
} from '@/features/pacientes/actions/aba05/gedFolders';
import { createGedOriginalRequest, listGedOriginalRequests } from '@/features/pacientes/actions/aba05/gedOriginalRequests';
import { getSupabaseClient } from '@/lib/supabase/client';

const useStyles = makeStyles({
  wrapper: {
    display: 'grid',
    gap: '16px',
  },
  shell: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,.08)',
    overflow: 'hidden',
  },
  shellGrid: {
    display: 'grid',
    gridTemplateColumns: '260px minmax(0, 1fr)',
    minHeight: 0,
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1fr',
    },
  },
  nav: {
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: tokens.colorNeutralBackground1,
    '@media (max-width: 1100px)': {
      borderRight: 'none',
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
  },
  navTitle: {
    fontSize: '13px',
    fontWeight: tokens.fontWeightSemibold,
  },
  navSection: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '12.5px',
    color: tokens.colorNeutralForeground1,
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  navItemActive: {
    backgroundColor: '#eef4fb',
    borderTopColor: '#cfe0f4',
    borderRightColor: '#cfe0f4',
    borderBottomColor: '#cfe0f4',
    borderLeftColor: '#cfe0f4',
    color: '#0f6cbd',
  },
  main: {
    display: 'grid',
    gridTemplateRows: 'auto auto auto auto 1fr',
    minHeight: 0,
  },
  header: {
    padding: '16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '16px',
    fontWeight: tokens.fontWeightSemibold,
  },
  subtitle: {
    fontSize: '12.5px',
    color: tokens.colorNeutralForeground3,
    marginTop: '4px',
  },
  counters: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  counter: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '8px',
    padding: '6px 10px',
    backgroundColor: tokens.colorNeutralBackground1,
    fontSize: '12px',
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
  },
  counterValue: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
    marginLeft: '4px',
  },
  tableWrap: {
    overflow: 'auto',
    minHeight: 0,
  },
  helper: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  inlineActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
});

type GedDocumentRow = Database['public']['Tables']['patient_documents']['Row'];
type GedDocumentLog = Database['public']['Tables']['patient_document_logs']['Row'];
type GedSecureLink = Database['public']['Tables']['document_secure_links']['Row'];
type GedArtifact = Database['public']['Tables']['document_artifacts']['Row'];
type GedImportItem = Database['public']['Tables']['document_import_job_items']['Row'];
type GedOriginalRequestRow = Database['public']['Tables']['ged_original_requests']['Row'];
type GedOriginalRequestItemRow = Database['public']['Tables']['ged_original_request_items']['Row'];

type GedDocumentWithFolder = GedDocumentRow & {
  folder?: { id: string | null; name: string | null; path: string | null; parent_id: string | null } | null;
};

type GedSecureLinkWithDocument = GedSecureLink & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
};

type GedArtifactWithDocument = GedArtifact & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
  log?: Pick<GedDocumentLog, 'id' | 'action' | 'happened_at' | 'user_id' | 'details'> | null;
};

type GedOriginalRequestItem = GedOriginalRequestItemRow & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
  link?: GedSecureLink | null;
};

type GedOriginalRequest = GedOriginalRequestRow & {
  items?: GedOriginalRequestItem[] | null;
};

const MAX_QUICK_UPLOAD = 12;

function buildFolderTree(folders: GedFolderRow[]): GedFolderNode[] {
  const map = new Map<string, GedFolderNode>();
  folders.forEach((folder) => {
    map.set(folder.id, {
      id: folder.id,
      name: folder.name,
      depth: folder.depth ?? 0,
      is_system: folder.is_system,
      children: [],
    });
  });

  const roots: GedFolderNode[] = [];
  folders.forEach((folder) => {
    const node = map.get(folder.id);
    if (!node) return;
    if (folder.parent_id && map.has(folder.parent_id)) {
      map.get(folder.parent_id)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (nodes: GedFolderNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);
  return roots;
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildWatermarkPattern(text: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="260">
    <text x="0" y="130" fill="rgba(0,0,0,0.14)" font-size="18" font-family="Segoe UI" transform="rotate(-24 200 120)">${text}</text>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function formatUserDisplay(user: { email?: string | null; user_metadata?: Record<string, unknown> } | null) {
  if (!user) return 'Usuario autenticado';
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const name = typeof metadata?.full_name === 'string' ? metadata.full_name : null;
  return name || user.email || 'Usuario autenticado';
}

export function GedExplorerPage({ patientId }: { patientId: string }) {
  const styles = useStyles();
  const toasterId = useId('ged-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [folders, setFolders] = useState<GedFolderRow[]>([]);
  const [documents, setDocuments] = useState<GedDocumentWithFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState<'all' | 'archived' | 'needs_review'>('all');
  const [filters, setFilters] = useState<GedDocumentFilters>({
    doc_domain: undefined,
    doc_origin: undefined,
    doc_status: undefined,
    doc_type: undefined,
  });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearch, setGlobalSearch] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentUserLabel, setCurrentUserLabel] = useState('Usuario autenticado');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<GedDocumentRow | null>(null);
  const [logs, setLogs] = useState<Database['public']['Tables']['patient_document_logs']['Row'][]>([]);
  const [artifacts, setArtifacts] = useState<Database['public']['Tables']['document_artifacts']['Row'][]>([]);
  const [secureLinks, setSecureLinks] = useState<Database['public']['Tables']['document_secure_links']['Row'][]>([]);
  const [secureToken, setSecureToken] = useState<string | null>(null);
  const [secureBusy, setSecureBusy] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [archiveBusy, setArchiveBusy] = useState(false);
  const [bulkOriginalBusy, setBulkOriginalBusy] = useState(false);
  const [allowCapture, setAllowCapture] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCustodyOpen, setIsCustodyOpen] = useState(false);
  const [custodyTab, setCustodyTab] = useState<'requests' | 'links' | 'artifacts'>('requests');
  const [custodyLoading, setCustodyLoading] = useState(false);
  const [custodyError, setCustodyError] = useState<string | null>(null);
  const [custodyLinks, setCustodyLinks] = useState<GedSecureLinkWithDocument[]>([]);
  const [custodyArtifacts, setCustodyArtifacts] = useState<GedArtifactWithDocument[]>([]);
  const [custodyRequests, setCustodyRequests] = useState<GedOriginalRequest[]>([]);
  const [custodyDownloads, setCustodyDownloads] = useState(0);
  const [custodyPrints, setCustodyPrints] = useState(0);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState<GedFolderModalMode>('create');
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

  const isDev = process.env.NODE_ENV === 'development';
  const shareLink = useMemo(() => {
    if (!secureToken || typeof window === 'undefined') return '';
    return `${window.location.origin}/ged/original?token=${secureToken}`;
  }, [secureToken]);

  const folderMap = useMemo(() => {
    const map = new Map<string, GedFolderRow>();
    folders.forEach((folder) => map.set(folder.id, folder));
    return map;
  }, [folders]);

  const selectedFolder = useMemo(
    () => (selectedFolderId ? folderMap.get(selectedFolderId) ?? null : null),
    [folderMap, selectedFolderId],
  );

  const canEditFolder = Boolean(selectedFolder && !selectedFolder.is_system);

  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);

  const systemFolders = useMemo(() => folders.filter((folder) => folder.is_system && !folder.parent_id), [folders]);

  const folderPathLabels = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach((folder) => {
      if (!folder.path) return;
      const segments = folder.path.split('.').map((id) => folderMap.get(id)?.name ?? 'Pasta');
      map.set(folder.id, segments.join(' / '));
    });
    return map;
  }, [folders, folderMap]);

  const breadcrumbs = useMemo(() => {
    if (!selectedFolderId) {
      return [{ id: null, label: 'GED' }];
    }
    const folder = folderMap.get(selectedFolderId);
    if (!folder?.path) {
      return [{ id: null, label: 'GED' }];
    }
    const segments = folder.path.split('.');
    const pathCrumbs = segments.map((id) => ({ id, label: folderMap.get(id)?.name ?? 'Pasta' }));
    return [{ id: null, label: 'GED' }, ...pathCrumbs];
  }, [selectedFolderId, folderMap]);

  const watermarkText = useMemo(() => {
    if (!selectedDoc) return '';
    const timestamp = formatDateTime(new Date().toISOString());
    const tenantLabel = selectedDoc.tenant_id ?? 'tenant';
    const patientLabel = selectedDoc.patient_id ?? 'paciente';
    return `Conecta Care • ${currentUserLabel} • ${timestamp} • ${tenantLabel} • ${patientLabel}`;
  }, [currentUserLabel, selectedDoc]);

  const watermarkPattern = useMemo(
    () => (watermarkText ? buildWatermarkPattern(watermarkText) : ''),
    [watermarkText],
  );

  const buildDefaultPayload = useCallback((fileName: string): GedDocumentInput => {
    const title = fileName.replace(/\.[^/.]+$/, '');
    return {
      title: title || 'Documento',
      category: 'clinical',
      doc_type: 'laudo',
      doc_domain: 'Clinico',
      doc_source: 'Ficha',
      doc_origin: 'Ficha_Documentos',
      description: null,
      tags: [],
    };
  }, []);

  const createUploadId = useCallback(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `upload-${Date.now()}-${Math.round(Math.random() * 100000)}`;
  }, []);

  const [uploadItems, setUploadItems] = useState<GedQuickUploadItem[]>([]);

  const handleAddUploadFiles = useCallback(
    (files: FileList) => {
      const incoming = Array.from(files);
      const remaining = Math.max(0, MAX_QUICK_UPLOAD - uploadItems.length);
      setUploadItems((prev) => {
        const batch = incoming.slice(0, Math.max(0, MAX_QUICK_UPLOAD - prev.length));
        if (batch.length === 0) return prev;
        const next = batch.map((file, index) => ({
          id: createUploadId(),
          file,
          expanded: prev.length === 0 && index === 0,
          payload: buildDefaultPayload(file.name),
        }));
        return [...prev, ...next];
      });
      if (incoming.length > remaining) {
        dispatchToast(
          <Toast>
            <ToastTitle>Limite de {MAX_QUICK_UPLOAD} arquivos por upload.</ToastTitle>
          </Toast>,
          { intent: 'warning' },
        );
      }
    },
    [uploadItems.length, createUploadId, buildDefaultPayload, dispatchToast],
  );

  const handleToggleUploadItem = useCallback((id: string) => {
    setUploadItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, expanded: !item.expanded } : item)),
    );
  }, []);

  const handleRemoveUploadItem = useCallback((id: string) => {
    setUploadItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleUpdateUploadItem = useCallback((id: string, payload: GedDocumentInput) => {
    setUploadItems((prev) => prev.map((item) => (item.id === id ? { ...item, payload } : item)));
  }, []);

  const handleClearUploadItems = useCallback(() => {
    setUploadItems([]);
  }, []);

  const handleCloseUpload = useCallback(() => {
    setIsUploadOpen(false);
  }, []);

  const handleCloseImport = useCallback(() => {
    setIsImportOpen(false);
    setReviewItem(null);
    setBulkFile(null);
  }, []);

  const loadFolders = useCallback(async () => {
    try {
      await ensurePatientGedFolders(patientId);
      const data = await listGedFolders(patientId);
      setFolders(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar pastas';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  }, [dispatchToast, patientId]);

  const effectiveFilters = useMemo(() => {
    const viewStatus = activeView === 'archived' ? 'Arquivado' : activeView === 'needs_review' ? 'Rascunho' : undefined;
    const scopeFolderId = activeView === 'all' && !globalSearch ? selectedFolderId ?? undefined : undefined;

    return {
      ...filters,
      doc_status: viewStatus ?? filters.doc_status,
      search: searchQuery || undefined,
      folder_id: scopeFolderId ?? undefined,
      global_search: activeView === 'all' ? globalSearch : true,
      include_archived: activeView === 'archived',
    } satisfies GedDocumentFilters;
  }, [activeView, filters, globalSearch, searchQuery, selectedFolderId]);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await listGedDocuments(patientId, effectiveFilters)) as GedDocumentWithFolder[];
      setDocuments(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar documentos';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setLoading(false);
    }
  }, [dispatchToast, effectiveFilters, patientId]);

  const loadCustody = useCallback(async () => {
    setCustodyLoading(true);
    setCustodyError(null);
    try {
      const [overview, requests] = await Promise.all([
        listGedCustodyOverview(patientId),
        listGedOriginalRequests(patientId),
      ]);
      setCustodyLinks(overview.links as GedSecureLinkWithDocument[]);
      setCustodyArtifacts(overview.artifacts as GedArtifactWithDocument[]);
      setCustodyDownloads(overview.downloadsCount ?? 0);
      setCustodyPrints(overview.printsCount ?? 0);
      setCustodyRequests(requests as GedOriginalRequest[]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar custodia';
      setCustodyError(message);
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setCustodyLoading(false);
    }
  }, [dispatchToast, patientId]);

  const handleBulkImport = useCallback(async () => {
    if (!bulkFile) {
      dispatchToast(
        <Toast>
          <ToastTitle>Selecione um ZIP para importar.</ToastTitle>
        </Toast>,
        { intent: 'warning' },
      );
      return;
    }
    setBulkBusy(true);
    try {
      const result = await startGedBulkImport('single', bulkFile, patientId, selectedFolderId);
      setBulkJobId(result.jobId);
      const items = await listBulkImportItems(result.jobId);
      setBulkItems(items as GedImportItem[]);
      dispatchToast(
        <Toast>
          <ToastTitle>Importacao concluida ({result.status}).</ToastTitle>
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
  }, [bulkFile, dispatchToast, loadDocuments, patientId, selectedFolderId]);

  const handleReviewSubmit = useCallback(async () => {
    if (!reviewItem) return;
    setBulkBusy(true);
    try {
      await reviewBulkImportItem(reviewItem.id, reviewPayload, reviewItem.patient_id, selectedFolderId);
      const items = bulkJobId ? await listBulkImportItems(bulkJobId) : [];
      setBulkItems(items as GedImportItem[]);
      setReviewItem(null);
      dispatchToast(
        <Toast>
          <ToastTitle>Item revisado com sucesso.</ToastTitle>
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
  }, [bulkJobId, dispatchToast, loadDocuments, reviewItem, reviewPayload, selectedFolderId]);

  useEffect(() => {
    let cancelled = false;
    const loadUser = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        if (data?.user) {
          setCurrentUserLabel(formatUserDisplay(data.user));
        }
      } catch (error) {
        console.error('[ged] falha ao carregar usuario', error);
      }
    };

    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (expandedFolders.size > 0) return;
    const next = new Set<string>();
    systemFolders.forEach((folder) => next.add(folder.id));
    setExpandedFolders(next);
  }, [expandedFolders.size, systemFolders]);

  useEffect(() => {
    if (!isCustodyOpen) return;
    void loadCustody();
  }, [isCustodyOpen, loadCustody]);

  const handleSelectFolder = useCallback((folderId: string | null) => {
    setSelectedFolderId(folderId);
    setActiveView('all');
  }, []);

  const handleToggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput.trim());
  }, [searchInput]);

  const handleSelectDocument = useCallback(async (doc: GedDocumentRow) => {
    setSelectedDocId(doc.id);
    setViewerOpen(true);
    setViewerError(null);
    setViewerLoading(true);
    setPreviewUrl(null);
    setPreviewMime(null);
    setSelectedDoc(null);
    setLogs([]);
    setArtifacts([]);
    setSecureLinks([]);
    try {
      const details = await getGedDocumentDetails(doc.id);
      setSelectedDoc(details.document);
      setLogs(details.logs ?? []);
      setArtifacts(details.artifacts ?? []);
      setSecureLinks(details.secureLinks ?? []);
      const preview = await getGedDocumentPreview(doc.id);
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
  }, [dispatchToast]);

  const handleToggleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (!selected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(documents.map((doc) => doc.id)));
  }, [documents]);

  const getPathLabel = useCallback(
    (doc: GedDocumentRow) => {
      if (!doc.folder_id) return 'Sem pasta';
      return folderPathLabels.get(doc.folder_id) ?? 'Sem pasta';
    },
    [folderPathLabels],
  );

  const handleOpenFolderModal = useCallback((mode: GedFolderModalMode) => {
    setFolderModalMode(mode);
    setFolderModalOpen(true);
  }, []);

  const handleConfirmFolderModal = useCallback(
    async (payload: { name?: string; parentId?: string | null }) => {
      try {
        if (folderModalMode === 'create') {
          await createGedFolder(patientId, payload.name ?? '', selectedFolderId);
        }
        if (folderModalMode === 'rename' && selectedFolderId) {
          await renameGedFolder(selectedFolderId, payload.name ?? '');
        }
        if (folderModalMode === 'move' && selectedFolderId) {
          await moveGedFolder(selectedFolderId, payload.parentId ?? null);
        }
        await loadFolders();
        setFolderModalOpen(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao salvar pasta';
        dispatchToast(
          <Toast>
            <ToastTitle>{message}</ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
      }
    },
    [dispatchToast, folderModalMode, loadFolders, patientId, selectedFolderId],
  );

  const handleDeleteFolder = useCallback(async () => {
    if (!selectedFolderId) return;
    try {
      await deleteGedFolder(selectedFolderId);
      setSelectedFolderId(null);
      await loadFolders();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao remover pasta';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  }, [dispatchToast, loadFolders, selectedFolderId]);

  const handleUpload = useCallback(async () => {
    setUploading(true);
    try {
      for (const item of uploadItems) {
        await uploadGedDocument(patientId, item.file, item.payload, selectedFolderId);
      }
      handleCloseUpload();
      setUploadItems([]);
      await loadDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao enviar documentos';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setUploading(false);
    }
  }, [dispatchToast, handleCloseUpload, loadDocuments, patientId, selectedFolderId, uploadItems]);

  const handleArchive = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setArchiveBusy(true);
    try {
      await archiveGedDocuments(Array.from(selectedIds));
      setSelectedIds(new Set());
      await loadDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao arquivar documentos';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setArchiveBusy(false);
    }
  }, [dispatchToast, loadDocuments, selectedIds]);

  const handleRequestOriginals = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setBulkOriginalBusy(true);
    try {
      await createGedOriginalRequest(patientId, Array.from(selectedIds));
      setSelectedIds(new Set());
      dispatchToast(
        <Toast>
          <ToastTitle>Requisicao de originais criada.</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao solicitar originais';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setBulkOriginalBusy(false);
    }
  }, [dispatchToast, patientId, selectedIds]);

  const handlePrint = useCallback(async () => {
    if (!selectedDocId) return;
    setPrintBusy(true);
    try {
      const result = await printGedDocument(selectedDocId);
      if (result.artifactUrl) {
        window.open(result.artifactUrl, '_blank', 'noopener,noreferrer');
      }
      await handleSelectDocument({ ...(selectedDoc ?? { id: selectedDocId } as GedDocumentRow) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao imprimir documento';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setPrintBusy(false);
    }
  }, [dispatchToast, handleSelectDocument, selectedDoc, selectedDocId]);

  const handleDownloadArtifact = useCallback(async (artifactId: string) => {
    try {
      const { url } = await getGedArtifactDownloadLink(artifactId);
      window.open(url, '_blank', 'noopener,noreferrer');
      if (isCustodyOpen) {
        await loadCustody();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao baixar artefato';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  }, [dispatchToast, isCustodyOpen, loadCustody]);

  const handleOpenCustody = useCallback(() => {
    setCustodyTab('requests');
    setIsCustodyOpen(true);
  }, []);

  const handleCreateSecureLink = useCallback(async () => {
    if (!selectedDocId) return;
    setSecureBusy(true);
    try {
      const result = await createGedSecureLink(selectedDocId);
      setSecureToken(result.token);
      await handleSelectDocument({ ...(selectedDoc ?? { id: selectedDocId } as GedDocumentRow) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao gerar link seguro';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setSecureBusy(false);
    }
  }, [dispatchToast, handleSelectDocument, selectedDoc, selectedDocId]);

  const handleConsumeSecureLink = useCallback(async () => {
    if (!secureToken) return;
    setSecureBusy(true);
    try {
      const result = await consumeGedSecureLink(secureToken);
      const link = document.createElement('a');
      link.href = result.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      setSecureToken(null);
      await handleSelectDocument({ ...(selectedDoc ?? { id: selectedDocId } as GedDocumentRow) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao consumir link seguro';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setSecureBusy(false);
    }
  }, [dispatchToast, handleSelectDocument, secureToken, selectedDoc, selectedDocId]);

  const handleRevokeLink = useCallback(async (linkId: string) => {
    setSecureBusy(true);
    try {
      await revokeGedSecureLink(linkId);
      await handleSelectDocument({ ...(selectedDoc ?? { id: selectedDocId } as GedDocumentRow) });
      if (isCustodyOpen) {
        await loadCustody();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao revogar link seguro';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setSecureBusy(false);
    }
  }, [dispatchToast, handleSelectDocument, isCustodyOpen, loadCustody, selectedDoc, selectedDocId]);

  const isDicom = selectedDoc ? isDicomFile(selectedDoc.file_name ?? selectedDoc.title ?? 'documento', selectedDoc.mime_type) : false;

  return (
    <section className={styles.wrapper}>
      <Toaster toasterId={toasterId} />

      <div className={styles.shell}>
        <div className={styles.shellGrid}>
          <aside className={styles.nav}>
            <div className={styles.navTitle}>GED do paciente</div>
            <div className={styles.navSection}>Atalhos</div>
            <button
              type="button"
              className={mergeClasses(styles.navItem, selectedFolderId === null && activeView === 'all' && styles.navItemActive)}
              onClick={() => handleSelectFolder(null)}
            >
              Tudo
            </button>
            {systemFolders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                className={mergeClasses(styles.navItem, selectedFolderId === folder.id && activeView === 'all' && styles.navItemActive)}
                onClick={() => handleSelectFolder(folder.id)}
              >
                {folder.name}
              </button>
            ))}

            <div className={styles.navSection}>Pastas</div>
            <GedFolderTree
              nodes={folderTree}
              expandedIds={expandedFolders}
              selectedId={selectedFolderId}
              onToggle={handleToggleFolder}
              onSelect={(id) => handleSelectFolder(id)}
            />

            <div className={styles.navSection}>Acoes de pasta</div>
            <div className={styles.inlineActions}>
              <Button appearance="secondary" onClick={() => handleOpenFolderModal('rename')} disabled={!canEditFolder}>
                Renomear
              </Button>
              <Button appearance="secondary" onClick={() => handleOpenFolderModal('move')} disabled={!canEditFolder}>
                Mover
              </Button>
              <Button appearance="secondary" onClick={handleDeleteFolder} disabled={!canEditFolder}>
                Remover
              </Button>
            </div>

            <div className={styles.navSection}>Views</div>
            <button
              type="button"
              className={mergeClasses(styles.navItem, activeView === 'archived' && styles.navItemActive)}
              onClick={() => setActiveView('archived')}
            >
              Arquivados
            </button>
            <button
              type="button"
              className={mergeClasses(styles.navItem, activeView === 'needs_review' && styles.navItemActive)}
              onClick={() => setActiveView('needs_review')}
            >
              Needs review
            </button>
          </aside>

          <main className={styles.main}>
            <div className={styles.header}>
              <div>
                <div className={styles.title}>Biblioteca GED</div>
                <div className={styles.subtitle}>Biblioteca central de documentos do paciente</div>
              </div>
              <div className={styles.counters}>
                <div className={styles.counter}>Total <span className={styles.counterValue}>{documents.length}</span></div>
                <div className={styles.counter}>Selecionados <span className={styles.counterValue}>{selectedIds.size}</span></div>
              </div>
            </div>

            <GedCommandBar
              onCreateFolder={() => handleOpenFolderModal('create')}
              onQuickUpload={() => setIsUploadOpen(true)}
              onImportZip={() => setIsImportOpen(true)}
              onOpenCustody={handleOpenCustody}
              onArchiveSelected={handleArchive}
              onRequestOriginals={handleRequestOriginals}
              onReload={loadDocuments}
              hasSelection={selectedIds.size > 0 && !archiveBusy && !bulkOriginalBusy}
            />

            <GedBreadcrumbs items={breadcrumbs} onSelect={(id) => handleSelectFolder(id)} />

            <div style={{ padding: '0 16px 16px' }}>
              <GedSearchBar
                query={searchInput}
                onQueryChange={setSearchInput}
                onSearch={handleSearch}
                globalSearch={globalSearch}
                onToggleGlobal={setGlobalSearch}
                filters={filters}
                onFiltersChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
              />
            </div>

            {selectedIds.size > 0 && (
              <GedBulkActionsBar
                selectedCount={selectedIds.size}
                onArchive={handleArchive}
                onRequestOriginals={handleRequestOriginals}
                onClear={() => setSelectedIds(new Set())}
              />
            )}

            <div className={styles.tableWrap}>
              {loading ? (
                <div style={{ padding: '24px 16px' }}>
                  <Spinner size="medium" />
                </div>
              ) : (
                <GedFileTable
                  documents={documents}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onOpen={handleSelectDocument}
                  showPath={globalSearch || activeView !== 'all'}
                  getPathLabel={getPathLabel}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      <GedFolderModal
        key={`${folderModalMode}-${selectedFolder?.id ?? 'root'}-${folderModalOpen ? 'open' : 'closed'}`}
        open={folderModalOpen}
        mode={folderModalMode}
        folders={folders}
        activeFolder={selectedFolder}
        onConfirm={handleConfirmFolderModal}
        onClose={() => setFolderModalOpen(false)}
      />

      <GedQuickUploadModal
        open={isUploadOpen}
        items={uploadItems}
        uploading={uploading}
        maxFiles={MAX_QUICK_UPLOAD}
        onClose={handleCloseUpload}
        onAddFiles={handleAddUploadFiles}
        onToggleItem={handleToggleUploadItem}
        onRemoveItem={handleRemoveUploadItem}
        onUpdateItem={handleUpdateUploadItem}
        onSubmit={handleUpload}
        onClearAll={handleClearUploadItems}
      />

      <GedBulkImportModal
        open={isImportOpen}
        bulkFile={bulkFile}
        bulkBusy={bulkBusy}
        bulkJobId={bulkJobId}
        bulkItems={bulkItems}
        reviewItem={reviewItem}
        reviewPayload={reviewPayload}
        onClose={handleCloseImport}
        onFileChange={setBulkFile}
        onStartImport={handleBulkImport}
        onReviewSelect={(item) => {
          setReviewItem(item);
          setReviewPayload((prev) => ({
            ...prev,
            title: item.original_file_name ?? prev.title,
          }));
        }}
        onReviewChange={setReviewPayload}
        onReviewSubmit={handleReviewSubmit}
      />

      <GedCustodyCenterModal
        open={isCustodyOpen}
        activeTab={custodyTab}
        loading={custodyLoading}
        error={custodyError}
        links={custodyLinks}
        artifacts={custodyArtifacts}
        requests={custodyRequests}
        downloadsCount={custodyDownloads}
        printsCount={custodyPrints}
        formatDateTime={formatDateTime}
        onClose={() => setIsCustodyOpen(false)}
        onTabChange={setCustodyTab}
        onRevokeLink={handleRevokeLink}
        onDownloadArtifact={handleDownloadArtifact}
      />

      <GedDocumentViewerModal
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSecureToken(null);
        }}
        document={selectedDoc}
        previewUrl={previewUrl}
        previewMime={previewMime}
        logs={logs}
        artifacts={artifacts}
        secureLinks={secureLinks}
        viewerLoading={viewerLoading}
        viewerError={viewerError}
        isDicom={isDicom}
        allowCapture={allowCapture}
        onToggleCapture={(next) => setAllowCapture(next)}
        isDev={isDev}
        watermarkPattern={watermarkPattern}
        onPrint={handlePrint}
        printBusy={printBusy}
        onSecureLink={handleCreateSecureLink}
        secureBusy={secureBusy}
        secureToken={secureToken}
        shareLink={shareLink}
        onConsumeSecureLink={handleConsumeSecureLink}
        onClearToken={() => setSecureToken(null)}
        formatDateTime={formatDateTime}
        onRevokeLink={handleRevokeLink}
        onDownloadArtifact={handleDownloadArtifact}
      />
    </section>
  );
}
