'use client';

import {
  Button,
  Checkbox,
  Spinner,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { useEffect, useRef, useState } from 'react';
import type { Database } from '@/types/supabase';

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
    height: '92vh',
    maxWidth: '1500px',
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
    gap: '16px',
    flexWrap: 'wrap',
  },
  headerInfo: {
    display: 'grid',
    gap: '4px',
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '16px',
  },
  meta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  body: {
    padding: '16px',
    overflowY: 'auto',
    flex: 1,
    minHeight: 0,
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2.4fr) minmax(280px, 1fr)',
    gap: '16px',
    alignItems: 'start',
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1fr',
    },
  },
  main: {
    display: 'grid',
    gap: '14px',
  },
  aside: {
    display: 'grid',
    gap: '14px',
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
    height: 'clamp(520px, 65vh, 720px)',
    overflowY: 'auto',
    backgroundColor: '#ffffff',
  },
  viewerCenter: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  pdfStack: {
    display: 'grid',
    gap: '16px',
    padding: '16px',
  },
  pdfStackWrap: {
    position: 'relative',
    minHeight: '100%',
  },
  previewNote: {
    margin: '0 16px 16px',
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  watermark: {
    position: 'absolute',
    inset: 0,
    opacity: 0.3,
    pointerEvents: 'none',
    zIndex: 2,
  },
  watermarkPdf: {
    position: 'absolute',
    inset: 0,
    opacity: 0.3,
    pointerEvents: 'none',
    zIndex: 2,
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
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
  cardBodyScroll: {
    maxHeight: '220px',
    overflowY: 'auto',
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
    backgroundColor: '#fafafa',
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
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
  inlineActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
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

type GedDocumentViewerModalProps = {
  open: boolean;
  document: GedDocumentRow | null;
  previewUrl: string | null;
  previewMime: string | null;
  viewerLoading: boolean;
  viewerError: string | null;
  isDicom: boolean;
  allowCapture: boolean;
  onToggleCapture: (checked: boolean) => void;
  isDev: boolean;
  watermarkPattern: string;
  onPrint: () => void;
  printBusy: boolean;
  onSecureLink: () => void;
  secureBusy: boolean;
  secureToken: string | null;
  shareLink: string;
  onConsumeSecureLink: () => void;
  onClearToken: () => void;
  secureLinks: GedSecureLink[];
  artifacts: GedArtifact[];
  logs: GedDocumentLog[];
  formatDateTime: (value?: string | null) => string;
  onRevokeLink: (linkId: string) => void;
  onDownloadArtifact: (artifactId: string) => void;
  onClose: () => void;
};

export function GedDocumentViewerModal({
  open,
  document,
  previewUrl,
  previewMime,
  viewerLoading,
  viewerError,
  isDicom,
  allowCapture,
  onToggleCapture,
  isDev,
  watermarkPattern,
  onPrint,
  printBusy,
  onSecureLink,
  secureBusy,
  secureToken,
  shareLink,
  onConsumeSecureLink,
  onClearToken,
  secureLinks,
  artifacts,
  logs,
  formatDateTime,
  onRevokeLink,
  onDownloadArtifact,
  onClose,
}: GedDocumentViewerModalProps) {
  const styles = useStyles();

  const resolvedMime = previewMime ?? document?.mime_type ?? '';
  const isPdf = resolvedMime.includes('pdf');
  const isImage = resolvedMime.startsWith('image/');
  const showPdf = !isDicom && Boolean(previewUrl) && isPdf;
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfTotalPages, setPdfTotalPages] = useState<number | null>(null);
  const [pdfRenderedPages, setPdfRenderedPages] = useState<number | null>(null);

  useEffect(() => {
    const container = pdfContainerRef.current;
    if (container) {
      container.innerHTML = '';
    }
    if (!open || !previewUrl || !isPdf || isDicom) {
      setPdfLoading(false);
      setPdfError(null);
      setPdfTotalPages(null);
      setPdfRenderedPages(null);
      return;
    }

    let cancelled = false;
    const renderPdf = async () => {
      setPdfLoading(true);
      setPdfError(null);
      setPdfTotalPages(null);
      setPdfRenderedPages(null);
      try {
        const pdfjs = await import('pdfjs-dist');
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        }
        const loadingTask = pdfjs.getDocument({ url: previewUrl });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        setPdfTotalPages(pdf.numPages);
        const maxPages = Math.min(pdf.numPages, 12);
        let rendered = 0;

        for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = globalThis.document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          canvas.style.borderRadius = '6px';
          canvas.style.background = '#ffffff';
          canvas.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
          canvas.style.position = 'relative';
          canvas.style.zIndex = '1';
          canvas.setAttribute('aria-label', `Pagina ${pageNumber}`);
          canvas.setAttribute('role', 'img');

          const renderTask = page.render({ canvasContext: context, viewport });
          await renderTask.promise;
          if (cancelled) return;
          container?.appendChild(canvas);
          rendered += 1;
        }

        setPdfRenderedPages(rendered);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Falha ao renderizar PDF';
        setPdfError(message);
      } finally {
        if (!cancelled) {
          setPdfLoading(false);
        }
      }
    };

    void renderPdf();

    return () => {
      cancelled = true;
    };
  }, [open, previewUrl, isPdf, isDicom]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && (key === 'p' || key === 's')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.title}>{document?.title ?? 'Documento GED'}</div>
            <div className={styles.meta}>
              {document
                ? `${document.subcategory ?? '--'} - ${document.domain_type ?? '--'} - ${formatDateTime(
                    document.uploaded_at,
                  )}`
                : 'Carregando...'}
            </div>
          </div>
          <div className={styles.inlineActions}>
            {isDev && (
              <Checkbox
                checked={allowCapture}
                onChange={(_, data) => onToggleCapture(Boolean(data.checked))}
                label="Habilitar captura/print (DEV)"
              />
            )}
            <Button icon={<DismissRegular />} onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.layout}>
            <div className={styles.main}>
              <div className={styles.viewerWrap}>
                <div className={styles.viewerBanner}>Documento em custodia Conecta Care</div>
                <div className={styles.viewerContent} onContextMenu={(event) => event.preventDefault()}>
                  {(viewerLoading || (showPdf && pdfLoading)) && (
                    <div className={styles.viewerCenter}>
                      <Spinner />
                    </div>
                  )}
                  {!viewerLoading && !pdfLoading && (viewerError || pdfError) && (
                    <div className={styles.viewerCenter}>
                      <p className={styles.muted}>{viewerError ?? pdfError}</p>
                    </div>
                  )}
                  {!viewerLoading && !pdfLoading && !viewerError && !pdfError && !previewUrl && (
                    <div className={styles.viewerCenter}>
                      <p className={styles.muted}>Pre-visualizacao indisponivel.</p>
                    </div>
                  )}
                  {!viewerLoading && !pdfLoading && isDicom && (
                    <div className={styles.viewerCenter}>
                      <p className={styles.muted}>DICOM (custodia apenas). Solicite o original.</p>
                    </div>
                  )}
                  {showPdf && (
                    <div className={styles.pdfStackWrap}>
                      <div className={styles.pdfStack} ref={pdfContainerRef} />
                      {!allowCapture && watermarkPattern && (
                        <div
                          className={styles.watermarkPdf}
                          style={{
                            backgroundImage: watermarkPattern,
                            backgroundRepeat: 'repeat',
                          }}
                        />
                      )}
                    </div>
                  )}
                  {!viewerLoading && !pdfLoading && !isDicom && previewUrl && isImage && (
                    <div className={styles.viewerCenter}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Documento"
                        className={styles.viewerImage}
                        onContextMenu={(event) => event.preventDefault()}
                        draggable={false}
                      />
                    </div>
                  )}
                  {!viewerLoading && !pdfLoading && !isDicom && previewUrl && !isPdf && !isImage && (
                    <div className={styles.viewerCenter}>
                      <p className={styles.muted}>Formato nao suportado para viewer. Use o link seguro do original.</p>
                    </div>
                  )}
                  {!viewerLoading &&
                    !pdfLoading &&
                    isPdf &&
                    pdfTotalPages &&
                    pdfRenderedPages &&
                    pdfTotalPages > pdfRenderedPages && (
                      <p className={styles.previewNote}>
                        Preview limitado a {pdfRenderedPages} de {pdfTotalPages} paginas.
                      </p>
                    )}
                  {!allowCapture && previewUrl && !isDicom && watermarkPattern && !isPdf && (
                    <div
                      className={styles.watermark}
                      style={{
                        backgroundImage: watermarkPattern,
                        backgroundRepeat: 'repeat',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className={styles.aside}>
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Acoes GED</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.inlineActions}>
                    <Button appearance="primary" onClick={onPrint} disabled={!document || printBusy || isDicom}>
                      Imprimir derivado
                    </Button>
                    <Button onClick={onSecureLink} disabled={!document || secureBusy}>
                      Solicitar original
                    </Button>
                  </div>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Detalhes</div>
                </div>
                <div className={styles.cardBody}>
                  {!document && <p className={styles.muted}>Selecione um documento.</p>}
                  {document && (
                    <dl className={styles.detailsList}>
                      <dt>Titulo</dt>
                      <dd>{document.title}</dd>
                      <dt>Categoria</dt>
                      <dd>{document.category ?? '--'}</dd>
                      <dt>Tipo</dt>
                      <dd>{document.subcategory ?? '--'}</dd>
                      <dt>Status</dt>
                      <dd>{document.document_status ?? '--'}</dd>
                      <dt>Hash</dt>
                      <dd>{document.file_hash ?? '--'}</dd>
                      <dt>Uploaded</dt>
                      <dd>{formatDateTime(document.uploaded_at)}</dd>
                    </dl>
                  )}
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Artefatos</div>
                </div>
                <div className={`${styles.cardBody} ${styles.cardBodyScroll}`}>
                  {artifacts.length === 0 && <p className={styles.muted}>Nenhum artefato gerado.</p>}
                  {artifacts.length > 0 && (
                    <div className={styles.list}>
                      {artifacts.map((artifact) => (
                        <div key={artifact.id} className={styles.listRow}>
                          <div>
                            <div className={styles.listCellTitle}>{artifact.artifact_type}</div>
                            <div className={styles.listCellMeta}>{formatDateTime(artifact.created_at)}</div>
                          </div>
                          <div className={styles.listCellMeta}>{artifact.mime_type ?? '--'}</div>
                          <div className={styles.listCellMeta}>
                            {artifact.file_hash ? `${artifact.file_hash.slice(0, 10)}...` : '--'}
                          </div>
                          <div className={styles.inlineActions}>
                            <Button size="small" onClick={() => onDownloadArtifact(artifact.id)}>
                              Baixar
                            </Button>
                          </div>
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
                <div className={`${styles.cardBody} ${styles.cardBodyScroll}`}>
                  {!document && <p className={styles.muted}>Selecione um documento.</p>}
                  {document && (
                    <div className={styles.list}>
                      {secureToken && (
                        <div className={styles.inlineActions}>
                          <Button appearance="primary" onClick={onConsumeSecureLink} disabled={secureBusy}>
                            Baixar original (download unico)
                          </Button>
                          {shareLink && (
                            <Button onClick={() => navigator.clipboard.writeText(shareLink)} disabled={secureBusy}>
                              Copiar link
                            </Button>
                          )}
                          <Button onClick={onClearToken} disabled={secureBusy}>
                            Limpar token
                          </Button>
                        </div>
                      )}
                      {shareLink && <p className={styles.muted}>Link seguro: {shareLink}</p>}
                      {secureLinks.map((link) => (
                        <div key={link.id} className={styles.listRow}>
                          <div>
                            <div className={styles.listCellTitle}>
                              Expira em {formatDateTime(link.expires_at)}
                            </div>
                            <div className={styles.listCellMeta}>Downloads: {link.downloads_count}</div>
                          </div>
                          <div className={styles.listCellMeta}>{link.revoked_at ? 'Revogado' : 'Ativo'}</div>
                          <div className={styles.inlineActions}>
                            {!link.revoked_at && (
                              <Button size="small" onClick={() => onRevokeLink(link.id)} disabled={secureBusy}>
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
                <div className={`${styles.cardBody} ${styles.cardBodyScroll}`}>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
