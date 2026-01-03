'use client';

import { useMemo } from 'react';
import { Button, Field, Input, Select, makeStyles, tokens } from '@fluentui/react-components';
import { DismissRegular, DocumentArrowUpRegular } from '@fluentui/react-icons';
import type { Database } from '@/types/supabase';
import {
  gedCategoryOptions,
  gedDocDomainOptions,
  gedDocOriginOptions,
  gedDocSourceOptions,
  gedDocTypeOptions,
  type GedDocumentInput,
} from '@/features/pacientes/schemas/aba05Ged.schema';
type GedImportItem = Database['public']['Tables']['document_import_job_items']['Row'];

type GedBulkImportModalProps = {
  open: boolean;
  bulkFile: File | null;
  bulkBusy: boolean;
  bulkJobId: string | null;
  bulkItems: GedImportItem[];
  reviewItem: GedImportItem | null;
  reviewPayload: GedDocumentInput;
  onClose: () => void;
  onFileChange: (file: File | null) => void;
  onStartImport: () => void;
  onReviewSelect: (item: GedImportItem) => void;
  onReviewChange: (payload: GedDocumentInput) => void;
  onReviewSubmit: () => void;
};

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
    maxWidth: '1180px',
    maxHeight: '92vh',
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
  title: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '16px',
  },
  body: {
    padding: '16px',
    overflowY: 'auto',
    display: 'grid',
    gap: '16px',
    flex: 1,
    minHeight: 0,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    '@media (max-width: 860px)': {
      gridTemplateColumns: '1fr',
    },
  },
  formFull: {
    gridColumn: '1 / -1',
  },
  inlineActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  section: {
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: '12px',
    display: 'grid',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '12px',
    letterSpacing: '.4px',
    textTransform: 'uppercase',
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
  },
  hint: {
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
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '13px',
    color: tokens.colorNeutralForeground1,
  },
  listCellMeta: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  codeBlock: {
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '11px',
    overflowX: 'auto',
    margin: 0,
  },
  fileInput: {
    width: '100%',
  },
});

function downloadTemplate(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function GedBulkImportModal({
  open,
  bulkFile,
  bulkBusy,
  bulkJobId,
  bulkItems,
  reviewItem,
  reviewPayload,
  onClose,
  onFileChange,
  onStartImport,
  onReviewSelect,
  onReviewChange,
  onReviewSubmit,
}: GedBulkImportModalProps) {
  const styles = useStyles();

  const manifestJson = useMemo(
    () =>
      JSON.stringify(
        {
          items: [
            {
              file_path: 'Clinico/receita_2025-01-10.pdf',
              title: 'Receita Antibioticoterapia',
              category: 'clinical',
              doc_type: 'receita',
              doc_domain: 'Clinico',
              doc_source: 'Importacao',
              doc_origin: 'Importacao',
              document_status: 'Ativo',
            },
          ],
        },
        null,
        2,
      ),
    [],
  );

  const manifestCsv = useMemo(
    () =>
      [
        'file_path,title,category,doc_type,doc_domain,doc_source,doc_origin,document_status',
        'Clinico/receita_2025-01-10.pdf,Receita Antibioticoterapia,clinical,receita,Clinico,Importacao,Importacao,Ativo',
      ].join('\n'),
    [],
  );

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Importacao em massa (ZIP)</div>
          <Button icon={<DismissRegular />} onClick={onClose}>
            Fechar
          </Button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGrid}>
            <Field label="ZIP" className={styles.formFull}>
              <input
                className={styles.fileInput}
                type="file"
                onChange={(event) => onFileChange(event.currentTarget.files?.[0] ?? null)}
              />
            </Field>
          </div>

          <div className={styles.inlineActions}>
            <Button appearance="primary" icon={<DocumentArrowUpRegular />} onClick={onStartImport} disabled={bulkBusy}>
              {bulkBusy ? 'Processando...' : 'Iniciar importacao'}
            </Button>
            {bulkFile && <span className={styles.hint}>Arquivo selecionado: {bulkFile.name}</span>}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Como preparar o ZIP</div>
            <p className={styles.hint}>
              Este ZIP sera importado apenas para este paciente. O manifest.json (ou manifest.csv) e recomendado para
              declarar taxonomia e titulo por arquivo.
            </p>
            <p className={styles.hint}>
              Se o manifest nao existir, o GED tenta inferir por pastas: /{`{doc_domain}`}/{`{doc_type}`}/{`{yyyy-mm}`}/arquivo.ext.
              Arquivos sem taxonomia valida vao para needs_review sem quebrar custodia.
            </p>
            <div className={styles.inlineActions}>
              <Button onClick={() => downloadTemplate('manifest.json', manifestJson)}>Baixar manifest.json</Button>
              <Button onClick={() => downloadTemplate('manifest.csv', manifestCsv)}>Baixar manifest.csv</Button>
            </div>
            <pre className={styles.codeBlock}>{manifestJson}</pre>
          </div>

          {bulkJobId && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Itens importados</div>
              <p className={styles.hint}>Job: {bulkJobId}</p>
              {bulkItems.length > 0 && (
                <div className={styles.list}>
                  {bulkItems.map((item) => (
                    <div key={item.id} className={styles.listRow}>
                      <div>
                        <div className={styles.listCellTitle}>{item.original_file_name ?? item.file_path}</div>
                        <div className={styles.listCellMeta}>{item.status}</div>
                      </div>
                      <div className={styles.listCellMeta}>{item.error_detail ?? '--'}</div>
                      <div className={styles.listCellMeta}>{item.patient_id ?? '--'}</div>
                      <div className={styles.inlineActions}>
                        {item.status === 'needs_review' && (
                          <Button size="small" onClick={() => onReviewSelect(item)}>
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

          {reviewItem && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Revisao de item</div>
              <div className={styles.formGrid}>
                <Field label="Titulo">
                  <Input
                    value={reviewPayload.title}
                    onChange={(event) => onReviewChange({ ...reviewPayload, title: event.target.value })}
                  />
                </Field>
                <Field label="Categoria">
                  <Select
                    value={reviewPayload.category}
                    onChange={(event) =>
                      onReviewChange({
                        ...reviewPayload,
                        category: event.target.value as GedDocumentInput['category'],
                      })
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
                      onReviewChange({
                        ...reviewPayload,
                        doc_type: event.target.value as GedDocumentInput['doc_type'],
                      })
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
                      onReviewChange({
                        ...reviewPayload,
                        doc_domain: event.target.value as GedDocumentInput['doc_domain'],
                      })
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
                      onReviewChange({
                        ...reviewPayload,
                        doc_source: event.target.value as GedDocumentInput['doc_source'],
                      })
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
                      onReviewChange({
                        ...reviewPayload,
                        doc_origin: event.target.value as GedDocumentInput['doc_origin'],
                      })
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
              <div className={styles.inlineActions}>
                <Button appearance="primary" onClick={onReviewSubmit} disabled={bulkBusy}>
                  Aprovar item
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
