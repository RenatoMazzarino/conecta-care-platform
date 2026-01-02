'use client';

import {
  Button,
  Field,
  Input,
  Select,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ChevronDownRegular, ChevronRightRegular, DismissRegular } from '@fluentui/react-icons';
import { useCallback, useMemo, useState } from 'react';
import type { Database } from '@/types/supabase';
import { gedDocDomainOptions, gedDocTypeOptions } from '@/features/pacientes/schemas/aba05Ged.schema';

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
    overflowY: 'auto',
  },
  modal: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow8,
    width: '96vw',
    maxWidth: '1300px',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '16px',
  },
  body: {
    padding: '16px',
    overflow: 'hidden',
    display: 'grid',
    gap: '12px',
    flex: 1,
    minHeight: 0,
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: '1.6fr repeat(2, 1fr)',
    gap: '12px',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
  list: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
    minHeight: 0,
    display: 'grid',
  },
  listInner: {
    overflowY: 'auto',
    padding: '12px',
    display: 'grid',
    gap: '12px',
    minHeight: 0,
  },
  card: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    cursor: 'pointer',
    backgroundColor: '#f6f6f6',
  },
  cardTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '12.5px',
  },
  cardMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  statusPill: {
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: 700,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: '#ffffff',
  },
  statusOk: {
    color: '#107c10',
    borderTopColor: 'rgba(16, 124, 16, 0.3)',
    borderRightColor: 'rgba(16, 124, 16, 0.3)',
    borderBottomColor: 'rgba(16, 124, 16, 0.3)',
    borderLeftColor: 'rgba(16, 124, 16, 0.3)',
    backgroundColor: 'rgba(16, 124, 16, 0.08)',
  },
  statusWarn: {
    color: '#8a5a00',
    borderTopColor: 'rgba(240, 180, 41, 0.4)',
    borderRightColor: 'rgba(240, 180, 41, 0.4)',
    borderBottomColor: 'rgba(240, 180, 41, 0.4)',
    borderLeftColor: 'rgba(240, 180, 41, 0.4)',
    backgroundColor: 'rgba(240, 180, 41, 0.1)',
  },
  statusDanger: {
    color: '#d13438',
    borderTopColor: 'rgba(209, 52, 56, 0.35)',
    borderRightColor: 'rgba(209, 52, 56, 0.35)',
    borderBottomColor: 'rgba(209, 52, 56, 0.35)',
    borderLeftColor: 'rgba(209, 52, 56, 0.35)',
    backgroundColor: 'rgba(209, 52, 56, 0.08)',
  },
  cardBody: {
    padding: '12px',
    display: 'grid',
    gap: '8px',
  },
  definitionList: {
    margin: 0,
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    rowGap: '8px',
    columnGap: '12px',
    '& dt': {
      color: tokens.colorNeutralForeground3,
      fontSize: '11px',
      margin: 0,
    },
    '& dd': {
      margin: 0,
      fontWeight: tokens.fontWeightSemibold,
      fontSize: '12px',
      overflowWrap: 'anywhere',
      color: tokens.colorNeutralForeground1,
    },
  },
  inlineActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  muted: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
});

type GedDocumentRow = Database['public']['Tables']['patient_documents']['Row'];
type GedSecureLink = Database['public']['Tables']['document_secure_links']['Row'];
type GedArtifact = Database['public']['Tables']['document_artifacts']['Row'];
type GedLog = Database['public']['Tables']['patient_document_logs']['Row'];

type GedSecureLinkItem = GedSecureLink & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
};

type GedArtifactItem = GedArtifact & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
  log?: Pick<GedLog, 'id' | 'action' | 'happened_at' | 'user_id' | 'details'> | null;
};

type GedCustodyTab = 'links' | 'artifacts';

type GedCustodyCenterModalProps = {
  open: boolean;
  activeTab: GedCustodyTab;
  loading: boolean;
  error: string | null;
  links: GedSecureLinkItem[];
  artifacts: GedArtifactItem[];
  formatDateTime: (value?: string | null) => string;
  onClose: () => void;
  onTabChange: (tab: GedCustodyTab) => void;
  onRevokeLink: (linkId: string) => void;
  onDownloadArtifact: (artifactId: string) => void;
};

function resolveLinkStatus(link: GedSecureLink) {
  if (link.revoked_at) return 'Revogado';
  const expiresAt = link.expires_at ? new Date(link.expires_at).getTime() : null;
  if (expiresAt && expiresAt < Date.now()) return 'Expirado';
  if (link.consumed_at) return 'Consumido';
  return 'Ativo';
}

function statusClass(status: string, styles: ReturnType<typeof useStyles>) {
  if (status === 'Ativo') return styles.statusOk;
  if (status === 'Consumido') return styles.statusWarn;
  return styles.statusDanger;
}

function extractMetadataField(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== 'object') return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export function GedCustodyCenterModal({
  open,
  activeTab,
  loading,
  error,
  links,
  artifacts,
  formatDateTime,
  onClose,
  onTabChange,
  onRevokeLink,
  onDownloadArtifact,
}: GedCustodyCenterModalProps) {
  const styles = useStyles();
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());
  const [expandedArtifacts, setExpandedArtifacts] = useState<Set<string>>(new Set());

  const resetState = useCallback(() => {
    setSearch('');
    setDomainFilter('');
    setTypeFilter('');
    setExpandedLinks(new Set());
    setExpandedArtifacts(new Set());
  }, []);

  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return links.filter((link) => {
      const doc = link.document;
      if (domainFilter && doc?.domain_type !== domainFilter) return false;
      if (typeFilter && doc?.subcategory !== typeFilter) return false;
      if (!query) return true;
      const title = doc?.title ?? '';
      return title.toLowerCase().includes(query);
    });
  }, [links, search, domainFilter, typeFilter]);

  const filteredArtifacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return artifacts.filter((artifact) => {
      const doc = artifact.document;
      if (domainFilter && doc?.domain_type !== domainFilter) return false;
      if (typeFilter && doc?.subcategory !== typeFilter) return false;
      if (!query) return true;
      const title = doc?.title ?? '';
      return title.toLowerCase().includes(query);
    });
  }, [artifacts, search, domainFilter, typeFilter]);

  const activeList = activeTab === 'links' ? filteredLinks : filteredArtifacts;

  if (!open) return null;

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={handleClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Gestao de custodia</div>
          <Button icon={<DismissRegular />} onClick={handleClose}>
            Fechar
          </Button>
        </div>

        <div className={styles.body}>
          <div className={styles.tabs}>
            <Button
              appearance={activeTab === 'links' ? 'primary' : 'secondary'}
              onClick={() => onTabChange('links')}
            >
              Links do original
            </Button>
            <Button
              appearance={activeTab === 'artifacts' ? 'primary' : 'secondary'}
              onClick={() => onTabChange('artifacts')}
            >
              Artefatos e impressoes
            </Button>
          </div>

          <div className={styles.filters}>
            <Field label="Busca">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Titulo do documento"
              />
            </Field>
            <Field label="Dominio">
              <Select value={domainFilter} onChange={(event) => setDomainFilter(event.target.value)}>
                <option value="">Todos</option>
                {gedDocDomainOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tipo">
              <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="">Todos</option>
                {gedDocTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className={styles.list}>
            <div className={styles.listInner}>
              {loading && <p className={styles.muted}>Carregando dados de custodia...</p>}
              {error && !loading && <p className={styles.muted}>{error}</p>}
              {!loading && !error && activeList.length === 0 && (
                <p className={styles.muted}>Nenhum registro encontrado.</p>
              )}

              {!loading && activeTab === 'links' &&
                filteredLinks.map((link) => {
                  const doc = link.document;
                  const isExpanded = expandedLinks.has(link.id);
                  const status = resolveLinkStatus(link);
                  const metadataIp = extractMetadataField(link.metadata, 'ip');
                  const metadataUa = extractMetadataField(link.metadata, 'user_agent');

                  return (
                    <div key={link.id} className={styles.card}>
                      <div
                        className={styles.cardHeader}
                        onClick={() => {
                          setExpandedLinks((prev) => {
                            const next = new Set(prev);
                            if (next.has(link.id)) {
                              next.delete(link.id);
                            } else {
                              next.add(link.id);
                            }
                            return next;
                          });
                        }}
                      >
                        <div>
                          <div className={styles.cardTitle}>{doc?.title ?? 'Documento'}</div>
                          <div className={styles.cardMeta}>
                            {doc?.domain_type ?? '—'} • {doc?.subcategory ?? doc?.category ?? '—'}
                          </div>
                        </div>
                        <div className={styles.inlineActions}>
                          <span className={`${styles.statusPill} ${statusClass(status, styles)}`}>{status}</span>
                          {isExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className={styles.cardBody}>
                          <dl className={styles.definitionList}>
                            <dt>Solicitado</dt>
                            <dd>{formatDateTime(link.requested_at)}</dd>
                            <dt>Solicitado por</dt>
                            <dd>{link.requested_by ?? '—'}</dd>
                            <dt>Liberado</dt>
                            <dd>{formatDateTime(link.issued_at)}</dd>
                            <dt>Liberado por</dt>
                            <dd>{link.issued_by ?? '—'}</dd>
                            <dt>Ultimo acesso</dt>
                            <dd>{formatDateTime(link.last_accessed_at)}</dd>
                            <dt>Consumido</dt>
                            <dd>{formatDateTime(link.consumed_at)}</dd>
                            <dt>Consumido por</dt>
                            <dd>{link.consumed_by ?? '—'}</dd>
                            <dt>Revogado</dt>
                            <dd>{formatDateTime(link.revoked_at)}</dd>
                            <dt>Revogado por</dt>
                            <dd>{link.revoked_by ?? '—'}</dd>
                            <dt>Downloads</dt>
                            <dd>
                              {link.downloads_count}/{link.max_downloads}
                            </dd>
                            <dt>IP</dt>
                            <dd>{metadataIp ?? '—'}</dd>
                            <dt>User agent</dt>
                            <dd>{metadataUa ?? '—'}</dd>
                          </dl>
                          <div className={styles.inlineActions}>
                            {!link.revoked_at && status === 'Ativo' && (
                              <Button size="small" onClick={() => onRevokeLink(link.id)}>
                                Revogar
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

              {!loading && activeTab === 'artifacts' &&
                filteredArtifacts.map((artifact) => {
                  const doc = artifact.document;
                  const isExpanded = expandedArtifacts.has(artifact.id);
                  const log = artifact.log;

                  return (
                    <div key={artifact.id} className={styles.card}>
                      <div
                        className={styles.cardHeader}
                        onClick={() => {
                          setExpandedArtifacts((prev) => {
                            const next = new Set(prev);
                            if (next.has(artifact.id)) {
                              next.delete(artifact.id);
                            } else {
                              next.add(artifact.id);
                            }
                            return next;
                          });
                        }}
                      >
                        <div>
                          <div className={styles.cardTitle}>{doc?.title ?? 'Documento'}</div>
                          <div className={styles.cardMeta}>
                            {artifact.artifact_type} • {formatDateTime(artifact.created_at)}
                          </div>
                        </div>
                        <div className={styles.inlineActions}>
                          <span className={styles.statusPill}>{artifact.mime_type ?? '—'}</span>
                          {isExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className={styles.cardBody}>
                          <dl className={styles.definitionList}>
                            <dt>Dominio</dt>
                            <dd>{doc?.domain_type ?? '—'}</dd>
                            <dt>Tipo</dt>
                            <dd>{doc?.subcategory ?? doc?.category ?? '—'}</dd>
                            <dt>Hash</dt>
                            <dd>{artifact.file_hash ?? '—'}</dd>
                            <dt>Tamanho</dt>
                            <dd>{artifact.file_size_bytes ?? '—'} bytes</dd>
                            <dt>Log</dt>
                            <dd>{log?.action ?? '—'}</dd>
                            <dt>Log em</dt>
                            <dd>{formatDateTime(log?.happened_at)}</dd>
                            <dt>Usuario</dt>
                            <dd>{log?.user_id ?? artifact.created_by ?? '—'}</dd>
                          </dl>
                          <div className={styles.inlineActions}>
                            <Button size="small" onClick={() => onDownloadArtifact(artifact.id)}>
                              Ver artefato
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
