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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
  },
  summaryCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '8px',
    padding: '10px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  summaryLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
  },
  summaryValue: {
    marginTop: '6px',
    fontSize: '16px',
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
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
  itemList: {
    display: 'grid',
    gap: '12px',
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
  itemCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '6px',
    padding: '10px',
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'grid',
    gap: '8px',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  itemTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '12.5px',
  },
  itemMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
});

type GedDocumentRow = Database['public']['Tables']['patient_documents']['Row'];
type GedSecureLink = Database['public']['Tables']['document_secure_links']['Row'];
type GedArtifact = Database['public']['Tables']['document_artifacts']['Row'];
type GedLog = Database['public']['Tables']['patient_document_logs']['Row'];
type GedOriginalRequestRow = Database['public']['Tables']['ged_original_requests']['Row'];
type GedOriginalRequestItemRow = Database['public']['Tables']['ged_original_request_items']['Row'];

type GedSecureLinkItem = GedSecureLink & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
  computed_status?: 'Ativo' | 'Consumido' | 'Expirado' | 'Revogado';
};

type GedArtifactItem = GedArtifact & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
  log?: Pick<GedLog, 'id' | 'action' | 'happened_at' | 'user_id' | 'details'> | null;
};

type GedOriginalRequestItem = GedOriginalRequestItemRow & {
  document?: Pick<GedDocumentRow, 'id' | 'title' | 'domain_type' | 'subcategory' | 'category' | 'uploaded_at'> | null;
  link?: GedSecureLink | null;
};

type GedOriginalRequest = GedOriginalRequestRow & {
  items?: GedOriginalRequestItem[] | null;
};

type GedCustodyTab = 'requests' | 'links' | 'artifacts';

type GedCustodyCenterModalProps = {
  open: boolean;
  activeTab: GedCustodyTab;
  loading: boolean;
  error: string | null;
  links: GedSecureLinkItem[];
  artifacts: GedArtifactItem[];
  requests: GedOriginalRequest[];
  downloadsCount: number;
  printsCount: number;
  formatDateTime: (value?: string | null) => string;
  onClose: () => void;
  onTabChange: (tab: GedCustodyTab) => void;
  onRevokeLink: (linkId: string) => void;
  onDownloadArtifact: (artifactId: string) => void;
};

function resolveLinkStatus(link: GedSecureLinkItem) {
  if (link.computed_status) return link.computed_status;
  if (link.revoked_at) return 'Revogado';
  if (link.consumed_at) return 'Consumido';
  return 'Ativo';
}

function statusClass(status: string, styles: ReturnType<typeof useStyles>) {
  if (status === 'Ativo') return styles.statusOk;
  if (status === 'Consumido') return styles.statusWarn;
  return styles.statusDanger;
}

function requestStatusClass(status: string | null, styles: ReturnType<typeof useStyles>) {
  if (!status) return styles.statusWarn;
  if (['completed', 'consumed'].includes(status)) return styles.statusOk;
  if (['open', 'in_progress', 'issued'].includes(status)) return styles.statusWarn;
  if (['revoked', 'expired'].includes(status)) return styles.statusDanger;
  return styles.statusWarn;
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
  requests,
  downloadsCount,
  printsCount,
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
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());
  const [expandedArtifacts, setExpandedArtifacts] = useState<Set<string>>(new Set());
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());

  const resetState = useCallback(() => {
    setSearch('');
    setDomainFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setExpandedLinks(new Set());
    setExpandedArtifacts(new Set());
    setExpandedRequests(new Set());
  }, []);

  const linkCounters = useMemo(() => {
    let active = 0;
    let consumed = 0;
    let expired = 0;
    let revoked = 0;

    links.forEach((link) => {
      const status = resolveLinkStatus(link);
      if (status === 'Revogado') revoked += 1;
      else if (status === 'Expirado') expired += 1;
      else if (status === 'Consumido') consumed += 1;
      else active += 1;
    });

    return { active, consumed, expired, revoked };
  }, [links]);

  const artifactCounters = useMemo(() => {
    const total = artifacts.length;
    const prints = artifacts.filter((artifact) => artifact.artifact_type === 'print').length;
    return { total, prints };
  }, [artifacts]);

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

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (statusFilter && request.status !== statusFilter) return false;
      const items = request.items ?? [];
      if (domainFilter) {
        const matchesDomain = items.some((item) => item.document?.domain_type === domainFilter);
        if (!matchesDomain) return false;
      }
      if (typeFilter) {
        const matchesType = items.some((item) => item.document?.subcategory === typeFilter);
        if (!matchesType) return false;
      }
      if (!query) return true;
      const requestId = request.id?.toLowerCase() ?? '';
      if (requestId.includes(query)) return true;
      return items.some((item) => (item.document?.title ?? '').toLowerCase().includes(query));
    });
  }, [requests, search, domainFilter, typeFilter, statusFilter]);

  if (!open) return null;

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={handleClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Centro de custodia GED</div>
          <Button icon={<DismissRegular />} onClick={handleClose}>
            Fechar
          </Button>
        </div>

        <div className={styles.body}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Links ativos</div>
              <div className={styles.summaryValue}>{linkCounters.active}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Links consumidos</div>
              <div className={styles.summaryValue}>{linkCounters.consumed}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Links expirados</div>
              <div className={styles.summaryValue}>{linkCounters.expired}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Links revogados</div>
              <div className={styles.summaryValue}>{linkCounters.revoked}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Artefatos</div>
              <div className={styles.summaryValue}>{artifactCounters.total}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Downloads</div>
              <div className={styles.summaryValue}>{downloadsCount}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Impressoes</div>
              <div className={styles.summaryValue}>{printsCount || artifactCounters.prints}</div>
            </div>
          </div>

          <div className={styles.tabs}>
            <Button
              appearance={activeTab === 'requests' ? 'primary' : 'secondary'}
              onClick={() => onTabChange('requests')}
            >
              Requisicoes de originais
            </Button>
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
                placeholder="Titulo do documento ou ID"
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
            {activeTab === 'requests' && (
              <Field label="Status">
                <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="">Todos</option>
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="completed">completed</option>
                  <option value="expired">expired</option>
                  <option value="revoked">revoked</option>
                </Select>
              </Field>
            )}
          </div>

          <div className={styles.list}>
            <div className={styles.listInner}>
              {loading && <p className={styles.muted}>Carregando dados de custodia...</p>}
              {error && !loading && <p className={styles.muted}>{error}</p>}
              {!loading && !error && activeTab === 'requests' && filteredRequests.length === 0 && (
                <p className={styles.muted}>Nenhuma requisicao encontrada.</p>
              )}
              {!loading && !error && activeTab === 'links' && filteredLinks.length === 0 && (
                <p className={styles.muted}>Nenhum link encontrado.</p>
              )}
              {!loading && !error && activeTab === 'artifacts' && filteredArtifacts.length === 0 && (
                <p className={styles.muted}>Nenhum artefato encontrado.</p>
              )}

              {!loading && activeTab === 'requests' &&
                filteredRequests.map((request) => {
                  const items = request.items ?? [];
                  const isExpanded = expandedRequests.has(request.id);

                  return (
                    <div key={request.id} className={styles.card}>
                      <div
                        className={styles.cardHeader}
                        onClick={() => {
                          setExpandedRequests((prev) => {
                            const next = new Set(prev);
                            if (next.has(request.id)) {
                              next.delete(request.id);
                            } else {
                              next.add(request.id);
                            }
                            return next;
                          });
                        }}
                      >
                        <div>
                          <div className={styles.cardTitle}>Requisicao {request.id.slice(0, 8)}...</div>
                          <div className={styles.cardMeta}>
                            {items.length} item(ns) • {formatDateTime(request.created_at)}
                          </div>
                        </div>
                        <div className={styles.inlineActions}>
                          <span className={`${styles.statusPill} ${requestStatusClass(request.status, styles)}`}>
                            {request.status}
                          </span>
                          {isExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className={styles.cardBody}>
                          <dl className={styles.definitionList}>
                            <dt>Solicitado por</dt>
                            <dd>{request.requested_by_user_id ?? '—'}</dd>
                            <dt>Status</dt>
                            <dd>{request.status}</dd>
                            <dt>Criado em</dt>
                            <dd>{formatDateTime(request.created_at)}</dd>
                          </dl>

                          {items.length === 0 && <p className={styles.muted}>Nenhum item registrado.</p>}
                          {items.length > 0 && (
                            <div className={styles.itemList}>
                              {items.map((item) => {
                                const doc = item.document;
                                const link = item.link;
                                const linkStatus = link ? resolveLinkStatus(link) : 'Sem link';
                                const requestIp = extractMetadataField(link?.metadata, 'ip');
                                const requestUa = extractMetadataField(link?.metadata, 'user_agent');
                                const consumeIp = extractMetadataField(link?.metadata, 'consume_ip');
                                const consumeUa = extractMetadataField(link?.metadata, 'consume_user_agent');

                                return (
                                  <div key={item.id} className={styles.itemCard}>
                                    <div className={styles.itemHeader}>
                                      <div>
                                        <div className={styles.itemTitle}>{doc?.title ?? 'Documento'}</div>
                                        <div className={styles.itemMeta}>
                                          {doc?.domain_type ?? '—'} • {doc?.subcategory ?? doc?.category ?? '—'}
                                        </div>
                                      </div>
                                      <span className={`${styles.statusPill} ${requestStatusClass(item.status, styles)}`}>
                                        {item.status}
                                      </span>
                                    </div>
                                    <dl className={styles.definitionList}>
                                      <dt>Solicitado</dt>
                                      <dd>{formatDateTime(request.created_at)}</dd>
                                      <dt>Link gerado</dt>
                                      <dd>{formatDateTime(link?.issued_at)}</dd>
                                      <dt>Acessado</dt>
                                      <dd>{formatDateTime(link?.last_accessed_at)}</dd>
                                      <dt>Download</dt>
                                      <dd>{formatDateTime(link?.consumed_at)}</dd>
                                      <dt>Expira</dt>
                                      <dd>{formatDateTime(link?.expires_at)}</dd>
                                      <dt>Status link</dt>
                                      <dd>{linkStatus}</dd>
                                      <dt>IP solicitacao</dt>
                                      <dd>{requestIp ?? '—'}</dd>
                                      <dt>UA solicitacao</dt>
                                      <dd>{requestUa ?? '—'}</dd>
                                      <dt>IP consumo</dt>
                                      <dd>{consumeIp ?? '—'}</dd>
                                      <dt>UA consumo</dt>
                                      <dd>{consumeUa ?? '—'}</dd>
                                    </dl>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

              {!loading && activeTab === 'links' &&
                filteredLinks.map((link) => {
                  const doc = link.document;
                  const isExpanded = expandedLinks.has(link.id);
                  const status = resolveLinkStatus(link);
                  const metadataIp = extractMetadataField(link.metadata, 'ip');
                  const metadataUa = extractMetadataField(link.metadata, 'user_agent');
                  const consumeIp = extractMetadataField(link.metadata, 'consume_ip');
                  const consumeUa = extractMetadataField(link.metadata, 'consume_user_agent');

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
                            <dt>IP solicitacao</dt>
                            <dd>{metadataIp ?? '—'}</dd>
                            <dt>UA solicitacao</dt>
                            <dd>{metadataUa ?? '—'}</dd>
                            <dt>IP consumo</dt>
                            <dd>{consumeIp ?? '—'}</dd>
                            <dt>UA consumo</dt>
                            <dd>{consumeUa ?? '—'}</dd>
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
