'use client';

import {
  Button,
  Checkbox,
  Field,
  Input,
  Select,
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
import {
  AddRegular,
  ArrowClockwiseRegular,
  ChevronDownRegular,
  ChevronRightRegular,
  SearchRegular,
} from '@fluentui/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Database } from '@/types/supabase';
import { GedDocumentViewerModal } from '@/components/patient/aba05/GedDocumentViewerModal';
import { GedBulkImportModal } from '@/components/patient/aba05/GedBulkImportModal';
import { GedQuickUploadModal, type GedQuickUploadItem } from '@/components/patient/aba05/GedQuickUploadModal';
import { GedCustodyCenterModal } from '@/components/patient/aba05/GedCustodyCenterModal';
import {
  gedDocDomainOptions,
  gedDocOriginOptions,
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
import { archiveGedDocuments } from '@/features/pacientes/actions/aba05/archiveGedDocuments';
import { listGedImportPaths } from '@/features/pacientes/actions/aba05/listGedImportPaths';
import { listGedCustodyOverview } from '@/features/pacientes/actions/aba05/listGedCustodyOverview';
import { getGedArtifactDownloadUrl } from '@/features/pacientes/actions/aba05/getGedArtifactDownloadUrl';
import {
  listBulkImportItems,
  startGedBulkImport,
  reviewBulkImportItem,
} from '@/features/pacientes/actions/aba05/bulkImport';
import { isDicomFile } from '@/features/pacientes/actions/aba05/shared';

const useStyles = makeStyles({
  container: {
    padding: '0 0 32px',
  },
  driveLayout: {
    display: 'grid',
    gap: '16px',
  },
  driveShell: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,.08)',
    overflow: 'hidden',
  },
  driveShellGrid: {
    display: 'grid',
    gridTemplateColumns: '240px minmax(0, 1fr)',
    minHeight: 0,
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1fr',
    },
  },
  driveNav: {
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: '6px',
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
  navSectionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    border: 0,
    backgroundColor: 'transparent',
    padding: '6px 8px',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
    cursor: 'pointer',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: '6px',
    paddingBottom: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.6,
      backgroundColor: 'transparent',
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
  navFolderButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    padding: '8px 10px',
    borderRadius: '8px',
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '12.5px',
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  navFolderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  navFolderCount: {
    fontSize: '10px',
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
  },
  driveMain: {
    display: 'grid',
    gridTemplateRows: 'auto auto auto 1fr',
    minHeight: 0,
  },
  driveHeader: {
    padding: '16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  driveTitle: {
    fontSize: '16px',
    fontWeight: tokens.fontWeightSemibold,
  },
  driveSub: {
    fontSize: '12.5px',
    color: tokens.colorNeutralForeground3,
    marginTop: '4px',
  },
  driveCounters: {
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
  driveToolbar: {
    padding: '10px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  driveFilters: {
    padding: '12px 16px 4px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: '1.6fr repeat(4, 1fr)',
    gap: '12px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr 1fr',
    },
    '@media (max-width: 680px)': {
      gridTemplateColumns: '1fr',
    },
  },
  tableWrap: {
    overflowY: 'auto',
    overflowX: 'auto',
    minHeight: 0,
    maxHeight: '620px',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 2.4fr) 1fr 1fr 1fr 1fr',
    gap: '8px',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: '12.5px',
    cursor: 'pointer',
    minWidth: '820px',
    ':hover': {
      backgroundColor: '#f6f6f6',
    },
  },
  tableRowSearch: {
    gridTemplateColumns: '36px minmax(0, 2.2fr) 1fr 1fr 1fr 1fr 1.4fr',
    minWidth: '980px',
  },
  tableRowHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#fafafa',
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    fontSize: '10.5px',
    zIndex: 2,
    cursor: 'default',
  },
  tableRowActive: {
    backgroundColor: '#eef4fb',
  },
  tableCellTitle: {
    fontWeight: tokens.fontWeightSemibold,
  },
  tableCellMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  tag: {
    display: 'inline-flex',
    padding: '3px 8px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: 700,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  tagOk: {
    color: '#107c10',
    borderTopColor: 'rgba(16, 124, 16, 0.3)',
    borderRightColor: 'rgba(16, 124, 16, 0.3)',
    borderBottomColor: 'rgba(16, 124, 16, 0.3)',
    borderLeftColor: 'rgba(16, 124, 16, 0.3)',
    backgroundColor: 'rgba(16, 124, 16, 0.08)',
  },
  tagWarn: {
    color: '#8a5a00',
    borderTopColor: 'rgba(240, 180, 41, 0.4)',
    borderRightColor: 'rgba(240, 180, 41, 0.4)',
    borderBottomColor: 'rgba(240, 180, 41, 0.4)',
    borderLeftColor: 'rgba(240, 180, 41, 0.4)',
    backgroundColor: 'rgba(240, 180, 41, 0.1)',
  },
  tagDanger: {
    color: '#d13438',
    borderTopColor: 'rgba(209, 52, 56, 0.35)',
    borderRightColor: 'rgba(209, 52, 56, 0.35)',
    borderBottomColor: 'rgba(209, 52, 56, 0.35)',
    borderLeftColor: 'rgba(209, 52, 56, 0.35)',
    backgroundColor: 'rgba(209, 52, 56, 0.08)',
  },
  muted: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
  inlineActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  searchRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
  },
  selectionBar: {
    padding: '10px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    backgroundColor: '#f9f9f9',
  },
  selectionText: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    fontWeight: tokens.fontWeightSemibold,
  },
});

type GedDocumentRow = Database['public']['Tables']['patient_documents']['Row'];
type GedDocumentLog = Database['public']['Tables']['patient_document_logs']['Row'];
type GedArtifact = Database['public']['Tables']['document_artifacts']['Row'];
type GedSecureLink = Database['public']['Tables']['document_secure_links']['Row'];
type GedImportItem = Database['public']['Tables']['document_import_job_items']['Row'];
type NavSectionKey = 'folders' | 'views' | 'custody';
type GedSecureLinkWithDocument = GedSecureLink & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
};
type GedArtifactWithDocument = GedArtifact & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
  log?: Pick<GedDocumentLog, 'id' | 'action' | 'happened_at' | 'user_id' | 'details'> | null;
};

interface GedTabProps {
  patientId: string;
}

const MAX_QUICK_UPLOAD = 10;

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

function normalizePath(raw: string) {
  return raw
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .trim();
}

function safeSegment(value: string) {
  return value.replace(/[\\/]+/g, '_').trim();
}

function extractManifestPath(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;
  const manifest = (payload as { manifest_payload?: unknown }).manifest_payload;
  if (!manifest || typeof manifest !== 'object') return null;
  const filePath = (manifest as { file_path?: unknown }).file_path;
  if (typeof filePath !== 'string') return null;
  const normalized = normalizePath(filePath);
  return normalized.length > 0 ? normalized : null;
}

function resolveFallbackPath(doc: GedDocumentRow) {
  const source = safeSegment(doc.source_module ?? 'Uploads');
  const dateSegment = doc.uploaded_at ? new Date(doc.uploaded_at).toISOString().slice(0, 7) : 'sem_data';
  const name = safeSegment(doc.title ?? doc.file_name ?? doc.original_file_name ?? doc.id);
  return normalizePath(`${source}/${dateSegment}/${name}`);
}

function resolveDocPathInfo(doc: GedDocumentRow, importMap: Map<string, string>) {
  const importPath = importMap.get(doc.id) ?? null;
  const manifestPath = extractManifestPath(doc.document_validation_payload);
  const legacyPath =
    doc.file_path && (!doc.storage_path || doc.file_path !== doc.storage_path) ? doc.file_path : null;
  const displayPath = normalizePath(importPath ?? manifestPath ?? legacyPath ?? resolveFallbackPath(doc));
  const parts = displayPath.split('/').filter(Boolean);
  const folderParts = parts.length > 1 ? parts.slice(0, -1) : [];
  const folderPath = folderParts.join('/');
  return { displayPath, folderPath };
}

type FolderNode = {
  name: string;
  path: string;
  count: number;
  children: FolderNode[];
};

function buildFolderTree(paths: string[]) {
  type NodeBucket = Map<string, { node: FolderNode; children: NodeBucket }>;
  const root: NodeBucket = new Map();

  const insertPath = (path: string) => {
    const normalized = normalizePath(path);
    if (!normalized) return;
    const parts = normalized.split('/').filter(Boolean);
    let current = root;
    let currentPath = '';

    parts.forEach((part) => {
      const nextPath = currentPath ? `${currentPath}/${part}` : part;
      let entry = current.get(part);
      if (!entry) {
        entry = { node: { name: part, path: nextPath, count: 0, children: [] }, children: new Map() };
        current.set(part, entry);
      }
      entry.node.count += 1;
      currentPath = nextPath;
      current = entry.children;
    });
  };

  paths.forEach((path) => insertPath(path));

  const toArray = (bucket: NodeBucket): FolderNode[] =>
    Array.from(bucket.values())
      .map((entry) => ({
        ...entry.node,
        children: toArray(entry.children),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

  return toArray(root);
}

export function GedTab({ patientId }: GedTabProps) {
  const styles = useStyles();
  const toasterId = useId('ged-toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [documents, setDocuments] = useState<GedDocumentRow[]>([]);
  const [filters, setFilters] = useState<GedDocumentFilters>({});
  const [activeNav, setActiveNav] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [navFilter, setNavFilter] = useState<Partial<GedDocumentFilters>>({});
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [importPathMap, setImportPathMap] = useState<Map<string, string>>(new Map());
  const [navSections, setNavSections] = useState<Record<NavSectionKey, boolean>>({
    folders: true,
    views: false,
    custody: false,
  });
  const [loading, setLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<GedDocumentRow | null>(null);
  const [logs, setLogs] = useState<GedDocumentLog[]>([]);
  const [artifacts, setArtifacts] = useState<GedArtifact[]>([]);
  const [secureLinks, setSecureLinks] = useState<GedSecureLink[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);

  const [uploadItems, setUploadItems] = useState<GedQuickUploadItem[]>([]);
  const [uploading, setUploading] = useState(false);

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
  const [archiveBusy, setArchiveBusy] = useState(false);
  const [bulkOriginalBusy, setBulkOriginalBusy] = useState(false);
  const [allowCapture, setAllowCapture] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCustodyOpen, setIsCustodyOpen] = useState(false);
  const [custodyTab, setCustodyTab] = useState<'links' | 'artifacts'>('links');
  const [custodyLoading, setCustodyLoading] = useState(false);
  const [custodyError, setCustodyError] = useState<string | null>(null);
  const [custodyLinks, setCustodyLinks] = useState<GedSecureLinkWithDocument[]>([]);
  const [custodyArtifacts, setCustodyArtifacts] = useState<GedArtifactWithDocument[]>([]);

  const isDev = process.env.NODE_ENV === 'development';
  const shareLink = useMemo(() => {
    if (!secureToken || typeof window === 'undefined') return '';
    return `${window.location.origin}/ged/original?token=${secureToken}`;
  }, [secureToken]);

  const needsReviewCount = useMemo(
    () => documents.filter((doc) => doc.document_status === 'Rascunho').length,
    [documents],
  );

  const activeSecureLinks = useMemo(() => {
    if (custodyLinks.length === 0) return 0;
    const now = Date.now();
    return custodyLinks.filter((link) => {
      if (link.revoked_at || link.consumed_at) return false;
      const expiresAt = link.expires_at ? new Date(link.expires_at).getTime() : null;
      return !expiresAt || expiresAt > now;
    }).length;
  }, [custodyLinks]);

  const documentPathMap = useMemo(() => {
    const map = new Map<string, { displayPath: string; folderPath: string }>();
    documents.forEach((doc) => {
      map.set(doc.id, resolveDocPathInfo(doc, importPathMap));
    });
    return map;
  }, [documents, importPathMap]);

  const folderTree = useMemo(() => {
    const folders: string[] = [];
    documentPathMap.forEach((value) => {
      if (value.folderPath) {
        folders.push(value.folderPath);
      }
    });
    return buildFolderTree(folders);
  }, [documentPathMap]);

  const visibleDocuments = useMemo(() => {
    if (isSearchActive || !folderFilter) return documents;
    return documents.filter((doc) => {
      const path = documentPathMap.get(doc.id)?.folderPath;
      if (!path) return false;
      return path === folderFilter || path.startsWith(`${folderFilter}/`);
    });
  }, [documents, documentPathMap, folderFilter, isSearchActive]);

  const selectedDocs = useMemo(
    () => documents.filter((doc) => selectedIds.has(doc.id)),
    [documents, selectedIds],
  );
  const selectedCount = selectedDocs.length;
  const selectedSingle = selectedCount === 1 ? selectedDocs[0] : null;

  const selectedDocSummary = useMemo(
    () => documents.find((doc) => doc.id === selectedDocId) ?? null,
    [documents, selectedDocId],
  );
  const displayDoc = selectedDoc ?? selectedDocSummary;

  const watermarkText = useMemo(() => {
    if (!displayDoc) return '';
    return `Conecta Care • ${displayDoc.title ?? 'Documento'} • ${formatDateTime(new Date().toISOString())}`;
  }, [displayDoc]);

  const applyNavFilter = useCallback((key: string, patch: Partial<GedDocumentFilters>) => {
    setActiveNav(key);
    setSearchQuery('');
    setIsSearchActive(false);
    setNavFilter(patch);
    setFolderFilter(null);
    setFilters((prev) => ({
      ...prev,
      search: undefined,
      doc_domain: undefined,
      category: undefined,
      ...(patch.doc_type ? { doc_type: undefined } : {}),
      ...(patch.doc_status ? { doc_status: undefined } : {}),
    }));
  }, []);

  const toggleNavSection = useCallback((section: NavSectionKey) => {
    setNavSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const toggleFolderExpand = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleSelectFolder = useCallback((path: string | null) => {
    setActiveNav(path ? `folder:${path}` : 'all');
    setFolderFilter(path);
    setNavFilter({});
    setSearchQuery('');
    setIsSearchActive(false);
  }, []);

  const effectiveFilters = useMemo(
    () => ({
      ...(isSearchActive ? {} : navFilter),
      ...filters,
    }),
    [filters, isSearchActive, navFilter],
  );

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listGedDocuments(patientId, effectiveFilters);
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
  }, [dispatchToast, effectiveFilters, patientId]);

  const loadImportPaths = useCallback(async () => {
    try {
      const items = await listGedImportPaths(patientId);
      const map = new Map<string, string>();
      items.forEach((item) => {
        if (item.document_id && item.file_path) {
          map.set(item.document_id, normalizePath(item.file_path));
        }
      });
      setImportPathMap(map);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar pastas do GED';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  }, [dispatchToast, patientId]);

  const loadCustody = useCallback(async () => {
    setCustodyLoading(true);
    setCustodyError(null);
    try {
      const data = await listGedCustodyOverview(patientId);
      setCustodyLinks(data.links as GedSecureLinkWithDocument[]);
      setCustodyArtifacts(data.artifacts as GedArtifactWithDocument[]);
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

  const loadDetails = useCallback(
    async (documentId: string) => {
      setViewerLoading(true);
      setViewerError(null);
      setPreviewUrl(null);
      setPreviewMime(null);
      setLogs([]);
      setArtifacts([]);
      setSecureLinks([]);
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
    void loadImportPaths();
  }, [loadImportPaths]);

  useEffect(() => {
    if (!isCustodyOpen) return;
    void loadCustody();
  }, [isCustodyOpen, loadCustody]);

  useEffect(() => {
    void loadCustody();
  }, [loadCustody]);

  useEffect(() => {
    if (folderTree.length === 0) return;
    setExpandedFolders((prev) => {
      if (prev.size > 0) return prev;
      const next = new Set(prev);
      folderTree.forEach((node) => {
        next.add(node.path);
      });
      return next;
    });
  }, [folderTree]);

  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set<string>();
      documents.forEach((doc) => {
        if (prev.has(doc.id)) {
          next.add(doc.id);
        }
      });
      return next;
    });
  }, [documents]);

  const handleSelectDocument = useCallback(
    (doc: GedDocumentRow) => {
      setSelectedDoc(doc);
      setSelectedDocId(doc.id);
      setSecureToken(null);
      setIsViewerOpen(true);
      void loadDetails(doc.id);
    },
    [loadDetails],
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
            <ToastTitle>{`Limite de ${MAX_QUICK_UPLOAD} arquivos por envio rapido.`}</ToastTitle>
          </Toast>,
          { intent: 'warning' },
        );
      }
    },
    [buildDefaultPayload, createUploadId, dispatchToast, uploadItems.length],
  );

  const handleToggleUploadItem = useCallback((id: string) => {
    setUploadItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, expanded: !item.expanded } : item)),
    );
  }, []);

  const handleUpdateUploadItem = useCallback((id: string, payload: GedDocumentInput) => {
    setUploadItems((prev) => prev.map((item) => (item.id === id ? { ...item, payload } : item)));
  }, []);

  const handleRemoveUploadItem = useCallback((id: string) => {
    setUploadItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearUploadItems = useCallback(() => {
    setUploadItems([]);
  }, []);

  const handleUpload = async () => {
    if (uploadItems.length === 0) {
      dispatchToast(
        <Toast>
          <ToastTitle>Selecione arquivos para enviar</ToastTitle>
        </Toast>,
        { intent: 'warning' },
      );
      return;
    }
    setUploading(true);
    const failed: GedQuickUploadItem[] = [];
    try {
      for (const item of uploadItems) {
        try {
          await uploadGedDocument(patientId, item.file, item.payload);
        } catch (error) {
          failed.push(item);
        }
      }

      if (failed.length > 0) {
        setUploadItems(failed);
        dispatchToast(
          <Toast>
            <ToastTitle>{`Falha ao enviar ${failed.length} arquivo(s). Revise e tente novamente.`}</ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
      } else {
        setUploadItems([]);
        dispatchToast(
          <Toast>
            <ToastTitle>Arquivos enviados com sucesso</ToastTitle>
          </Toast>,
          { intent: 'success' },
        );
        setIsUploadOpen(false);
      }

      await loadDocuments();
      await loadImportPaths();
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
      if (isCustodyOpen) {
        await loadCustody();
      }
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
      if (isCustodyOpen) {
        await loadCustody();
      }
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
      const anchor = document.createElement('a');
      anchor.href = result.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
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
      if (isCustodyOpen) {
        await loadCustody();
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

  const handleArchiveSelection = async () => {
    if (selectedIds.size === 0) return;
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Arquivar ${selectedIds.size} documento(s)?`)
    ) {
      return;
    }
    setArchiveBusy(true);
    try {
      const ids = Array.from(selectedIds);
      const result = await archiveGedDocuments(ids);
      dispatchToast(
        <Toast>
          <ToastTitle>{`${result.archived} documento(s) arquivado(s).`}</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      clearSelection();
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
  };

  const handleBulkOriginals = async () => {
    if (selectedDocs.length === 0) return;
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Gerar pacote ZIP com ${selectedDocs.length} original(is)? Essa acao consome os links.`)
    ) {
      return;
    }
    setBulkOriginalBusy(true);
    try {
      const tokens: Array<{ doc: GedDocumentRow; token: string }> = [];

      for (const doc of selectedDocs) {
        const result = await createGedSecureLink(doc.id);
        tokens.push({ doc, token: result.token });
      }

      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      for (let index = 0; index < tokens.length; index += 1) {
        const { doc, token } = tokens[index];
        const download = await consumeGedSecureLink(token);
        const response = await fetch(download.url);
        if (!response.ok) {
          throw new Error(`Falha ao baixar original (${doc.title ?? doc.file_name ?? doc.id})`);
        }
        const blob = await response.blob();
        const rawName = doc.original_file_name ?? doc.file_name ?? doc.title ?? `documento-${index + 1}`;
        const fileName = safeSegment(rawName || `documento-${index + 1}`);
        zip.file(fileName, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const stamp = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      const url = URL.createObjectURL(zipBlob);
      link.href = url;
      link.download = `ged-originais-${stamp}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      dispatchToast(
        <Toast>
          <ToastTitle>Pacote ZIP gerado com sucesso.</ToastTitle>
        </Toast>,
        { intent: 'success' },
      );
      clearSelection();
      if (isCustodyOpen) {
        await loadCustody();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao gerar pacote de originais';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    } finally {
      setBulkOriginalBusy(false);
    }
  };

  const handleDownloadArtifact = async (artifactId: string) => {
    try {
      const result = await getGedArtifactDownloadUrl(artifactId);
      const popup = window.open(result.url, '_blank', 'noopener,noreferrer');
      if (!popup) {
        window.location.assign(result.url);
      }
      if (isCustodyOpen) {
        await loadCustody();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao abrir artefato';
      dispatchToast(
        <Toast>
          <ToastTitle>{message}</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  };

  const openCustodyCenter = (tab: 'links' | 'artifacts') => {
    setCustodyTab(tab);
    setIsCustodyOpen(true);
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
      const result = await startGedBulkImport('single', bulkFile, patientId);
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
      await loadImportPaths();
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
      await loadImportPaths();
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

  const handleCloseUpload = useCallback(() => {
    setIsUploadOpen(false);
  }, []);

  const handleCloseImport = useCallback(() => {
    setIsImportOpen(false);
    setReviewItem(null);
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleSearch = useCallback(() => {
    const trimmed = searchQuery.trim();
    setIsSearchActive(Boolean(trimmed));
    setActiveNav(trimmed ? 'search' : 'all');
    setFilters((prev) => ({
      ...prev,
      search: trimmed || undefined,
    }));
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearchActive(false);
    setActiveNav(folderFilter ? `folder:${folderFilter}` : 'all');
    setFilters((prev) => ({
      ...prev,
      search: undefined,
    }));
  }, [folderFilter]);

  const isDicom = displayDoc ? isDicomFile(displayDoc.file_name ?? '', displayDoc.mime_type) : false;
  const renderFolderNodes = useCallback(
    (nodes: FolderNode[], depth = 0) =>
      nodes.map((node) => {
        const isExpanded = expandedFolders.has(node.path);
        const isActive = activeNav === `folder:${node.path}`;
        const hasChildren = node.children.length > 0;

        return (
          <div key={node.path}>
            <button
              type="button"
              className={mergeClasses(styles.navFolderButton, isActive && styles.navItemActive)}
              onClick={() => {
                handleSelectFolder(node.path);
                if (hasChildren) {
                  toggleFolderExpand(node.path);
                }
              }}
              style={{ paddingLeft: `${10 + depth * 12}px` }}
              aria-expanded={hasChildren ? isExpanded : undefined}
            >
              <span>{node.name}</span>
              <span className={styles.navFolderMeta}>
                <span className={styles.navFolderCount}>{node.count}</span>
                {hasChildren ? (isExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />) : null}
              </span>
            </button>
            {hasChildren && isExpanded && <div className={styles.navGroup}>{renderFolderNodes(node.children, depth + 1)}</div>}
          </div>
        );
      }),
    [activeNav, expandedFolders, handleSelectFolder, styles, toggleFolderExpand],
  );

  return (
    <div className={styles.container}>
      <Toaster toasterId={toasterId} />

      <div className={styles.driveLayout}>
        <section className={styles.driveShell}>
          <div className={styles.driveShellGrid}>
            <aside className={styles.driveNav}>
              <div className={styles.navTitle}>GED do paciente</div>

              <button
                type="button"
                className={styles.navSectionButton}
                onClick={() => toggleNavSection('folders')}
                aria-expanded={navSections.folders}
              >
                <span>Pastas</span>
                {navSections.folders ? <ChevronDownRegular /> : <ChevronRightRegular />}
              </button>
              {navSections.folders && (
                <div className={styles.navGroup}>
                  <button
                    type="button"
                    className={mergeClasses(styles.navItem, activeNav === 'all' && styles.navItemActive)}
                    onClick={() => handleSelectFolder(null)}
                  >
                    Tudo
                  </button>
                  {folderTree.length === 0 && <p className={styles.muted}>Nenhuma pasta detectada.</p>}
                  {folderTree.length > 0 && renderFolderNodes(folderTree)}
                </div>
              )}

              <button
                type="button"
                className={styles.navSectionButton}
                onClick={() => toggleNavSection('views')}
                aria-expanded={navSections.views}
              >
                <span>Views</span>
                {navSections.views ? <ChevronDownRegular /> : <ChevronRightRegular />}
              </button>
              {navSections.views && (
                <div className={styles.navGroup}>
                  <button
                    type="button"
                    className={mergeClasses(styles.navItem, activeNav === 'importados' && styles.navItemActive)}
                    onClick={() => applyNavFilter('importados', { doc_source: 'Importacao' })}
                  >
                    Importados em massa
                  </button>
                  <button
                    type="button"
                    className={mergeClasses(styles.navItem, activeNav === 'needs_review' && styles.navItemActive)}
                    onClick={() => applyNavFilter('needs_review', { doc_status: 'Rascunho' })}
                  >
                    Needs review
                  </button>
                  <button
                    type="button"
                    className={mergeClasses(styles.navItem, activeNav === 'nao_classificado' && styles.navItemActive)}
                    onClick={() => applyNavFilter('nao_classificado', { category: 'other' })}
                  >
                    Nao classificado
                  </button>
                </div>
              )}

              <button
                type="button"
                className={styles.navSectionButton}
                onClick={() => toggleNavSection('custody')}
                aria-expanded={navSections.custody}
              >
                <span>Custodia</span>
                {navSections.custody ? <ChevronDownRegular /> : <ChevronRightRegular />}
              </button>
              {navSections.custody && (
                <div className={styles.navGroup}>
                  <button
                    type="button"
                    className={styles.navItem}
                    onClick={() => openCustodyCenter('links')}
                  >
                    Links seguros
                  </button>
                  <button
                    type="button"
                    className={styles.navItem}
                    onClick={() => openCustodyCenter('artifacts')}
                  >
                    Artefatos
                  </button>
                  <button type="button" className={styles.navItem} onClick={() => openCustodyCenter('links')}>
                    Solicitacoes de original
                  </button>
                </div>
              )}
            </aside>

            <div className={styles.driveMain}>
              <div className={styles.driveHeader}>
                <div>
                  <div className={styles.driveTitle}>Biblioteca GED</div>
                  <div className={styles.driveSub}>Biblioteca central de documentos do paciente</div>
                </div>
                <div className={styles.driveCounters}>
                  <div className={styles.counter}>
                    Total <span className={styles.counterValue}>{documents.length}</span>
                  </div>
                  <div className={styles.counter}>
                    Needs review <span className={styles.counterValue}>{needsReviewCount}</span>
                  </div>
                  <div className={styles.counter}>
                    Links ativos <span className={styles.counterValue}>{activeSecureLinks}</span>
                  </div>
                </div>
              </div>

              <div className={styles.driveToolbar}>
                <Button appearance="primary" icon={<AddRegular />} onClick={() => setIsUploadOpen(true)}>
                  Upload rapido
                </Button>
                <Button onClick={() => setIsImportOpen(true)}>Importar ZIP</Button>
                <Button onClick={() => openCustodyCenter('links')}>Gestao de custodia</Button>
                <Button icon={<ArrowClockwiseRegular />} onClick={loadDocuments} disabled={loading}>
                  Recarregar
                </Button>
                {loading && <Spinner size="tiny" />}
              </div>

              <div className={styles.driveFilters}>
                <div className={styles.filters}>
                  <Field label="Busca">
                    <div className={styles.searchRow}>
                      <Input
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handleSearch();
                          }
                        }}
                        placeholder="Titulo, tag, hash, ID..."
                      />
                      <Button icon={<SearchRegular />} onClick={handleSearch}>
                        Buscar
                      </Button>
                      {isSearchActive && (
                        <Button appearance="secondary" onClick={handleClearSearch}>
                          Limpar
                        </Button>
                      )}
                    </div>
                  </Field>
                  <Field label="Dominio">
                    <Select
                      value={filters.doc_domain ?? ''}
                      onChange={(event) => {
                        setActiveNav((prev) => (isSearchActive ? prev : 'custom'));
                        setFilters((prev) => ({
                          ...prev,
                          doc_domain: event.target.value
                            ? (event.target.value as GedDocumentFilters['doc_domain'])
                            : undefined,
                        }));
                      }}
                    >
                      <option value="">Todos</option>
                      {gedDocDomainOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Tipo">
                    <Select
                      value={filters.doc_type ?? ''}
                      onChange={(event) => {
                        setActiveNav((prev) => (isSearchActive ? prev : 'custom'));
                        setFilters((prev) => ({
                          ...prev,
                          doc_type: event.target.value
                            ? (event.target.value as GedDocumentFilters['doc_type'])
                            : undefined,
                        }));
                      }}
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
                      onChange={(event) => {
                        setActiveNav((prev) => (isSearchActive ? prev : 'custom'));
                        setFilters((prev) => ({
                          ...prev,
                          doc_status: event.target.value
                            ? (event.target.value as GedDocumentFilters['doc_status'])
                            : undefined,
                        }));
                      }}
                    >
                      <option value="">Todos</option>
                      {gedDocStatusEnumOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Origem">
                    <Select
                      value={filters.doc_origin ?? ''}
                      onChange={(event) => {
                        setActiveNav((prev) => (isSearchActive ? prev : 'custom'));
                        setFilters((prev) => ({
                          ...prev,
                          doc_origin: event.target.value
                            ? (event.target.value as GedDocumentFilters['doc_origin'])
                            : undefined,
                        }));
                      }}
                    >
                      <option value="">Todas</option>
                      {gedDocOriginOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </div>

              {selectedCount > 0 && (
                <div className={styles.selectionBar}>
                  <span className={styles.selectionText}>{selectedCount} selecionado(s)</span>
                  <div className={styles.inlineActions}>
                    <Button
                      size="small"
                      appearance="primary"
                      onClick={() => selectedSingle && handleSelectDocument(selectedSingle)}
                      disabled={!selectedSingle}
                    >
                      Abrir
                    </Button>
                    <Button size="small" onClick={handleArchiveSelection} disabled={archiveBusy}>
                      Arquivar
                    </Button>
                    <Button size="small" onClick={handleBulkOriginals} disabled={bulkOriginalBusy}>
                      Solicitar originais (ZIP)
                    </Button>
                    <Button size="small" appearance="secondary" onClick={clearSelection}>
                      Limpar selecao
                    </Button>
                    {(archiveBusy || bulkOriginalBusy) && <Spinner size="tiny" />}
                  </div>
                </div>
              )}

              <div className={styles.tableWrap}>
                <div
                  className={mergeClasses(
                    styles.tableRow,
                    styles.tableRowHeader,
                    isSearchActive && styles.tableRowSearch,
                  )}
                >
                  <div></div>
                  <div>Arquivo</div>
                  <div>Tipo</div>
                  <div>Status</div>
                  <div>Origem</div>
                  <div>Atualizado</div>
                  {isSearchActive && <div>Caminho</div>}
                </div>
                {visibleDocuments.length === 0 && !loading && (
                  <p className={styles.muted} style={{ padding: '12px 16px' }}>
                    Nenhum documento encontrado.
                  </p>
                )}
                {visibleDocuments.map((doc) => {
                  const statusClass =
                    doc.document_status === 'Ativo'
                      ? styles.tagOk
                      : doc.document_status === 'Arquivado' || doc.document_status === 'Substituido'
                        ? styles.tagWarn
                        : styles.tagDanger;

                  return (
                    <div
                      key={doc.id}
                      className={mergeClasses(
                        styles.tableRow,
                        selectedDocId === doc.id && styles.tableRowActive,
                        isSearchActive && styles.tableRowSearch,
                      )}
                      onClick={() => handleSelectDocument(doc)}
                    >
                      <div>
                        <Checkbox
                          checked={selectedIds.has(doc.id)}
                          onChange={(event) => {
                            event.stopPropagation();
                            toggleSelection(doc.id);
                          }}
                          onClick={(event) => event.stopPropagation()}
                          aria-label="Selecionar documento"
                        />
                      </div>
                      <div>
                        <div className={styles.tableCellTitle}>{doc.title ?? 'Documento'}</div>
                        <div className={styles.tableCellMeta}>
                          {doc.subcategory ?? '—'} • {doc.domain_type ?? '—'}
                        </div>
                      </div>
                      <div className={styles.tableCellMeta}>{doc.subcategory ?? doc.category ?? '—'}</div>
                      <div>
                        <span className={mergeClasses(styles.tag, statusClass)}>{doc.document_status ?? '—'}</span>
                      </div>
                      <div className={styles.tableCellMeta}>{doc.origin_module ?? doc.source_module ?? '—'}</div>
                      <div className={styles.tableCellMeta}>{formatDateTime(doc.uploaded_at)}</div>
                      {isSearchActive && (
                        <div className={styles.tableCellMeta}>
                          {documentPathMap.get(doc.id)?.displayPath ??
                            `${doc.domain_type ?? 'Misto'}/${doc.subcategory ?? doc.category ?? 'outros'}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>

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
        formatDateTime={formatDateTime}
        onClose={() => setIsCustodyOpen(false)}
        onTabChange={setCustodyTab}
        onRevokeLink={handleRevokeLink}
        onDownloadArtifact={handleDownloadArtifact}
      />

      <GedDocumentViewerModal
        open={isViewerOpen && Boolean(selectedDocId)}
        document={displayDoc}
        previewUrl={previewUrl}
        previewMime={previewMime}
        viewerLoading={viewerLoading}
        viewerError={viewerError}
        isDicom={isDicom}
        allowCapture={allowCapture}
        onToggleCapture={(checked) => setAllowCapture(checked)}
        isDev={isDev}
        watermarkPattern={displayDoc ? buildWatermarkPattern(watermarkText) : ''}
        onPrint={handlePrint}
        printBusy={printBusy}
        onSecureLink={handleSecureLink}
        secureBusy={secureBusy}
        secureToken={secureToken}
        shareLink={shareLink}
        onConsumeSecureLink={handleConsumeSecureLink}
        onClearToken={() => setSecureToken(null)}
        secureLinks={secureLinks}
        artifacts={artifacts}
        logs={logs}
        formatDateTime={formatDateTime}
        onRevokeLink={handleRevokeLink}
        onClose={() => {
          setIsViewerOpen(false);
          setAllowCapture(false);
          setSecureToken(null);
        }}
      />
    </div>
  );
}
