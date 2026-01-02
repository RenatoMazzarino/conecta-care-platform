'use client';

import { useMemo, useRef } from 'react';
import {
  Button,
  Field,
  Input,
  Select,
  Textarea,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ChevronDownRegular, ChevronRightRegular, DismissRegular, DocumentAddRegular } from '@fluentui/react-icons';
import {
  gedCategoryOptions,
  gedDocDomainOptions,
  gedDocOriginOptions,
  gedDocSourceOptions,
  gedDocTypeOptions,
  type GedDocumentInput,
} from '@/features/pacientes/schemas/aba05Ged.schema';

export type GedQuickUploadItem = {
  id: string;
  file: File;
  payload: GedDocumentInput;
  expanded: boolean;
};

type GedQuickUploadModalProps = {
  open: boolean;
  items: GedQuickUploadItem[];
  uploading: boolean;
  maxFiles: number;
  onClose: () => void;
  onAddFiles: (files: FileList) => void;
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, payload: GedDocumentInput) => void;
  onSubmit: () => void;
  onClearAll: () => void;
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
  dropZone: {
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: '8px',
    padding: '16px',
    display: 'grid',
    gap: '8px',
    backgroundColor: '#fafafa',
  },
  dropTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '13px',
  },
  dropMeta: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    margin: 0,
  },
  fileInput: {
    display: 'none',
  },
  fileList: {
    display: 'grid',
    gap: '12px',
  },
  fileCard: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  fileCardHeader: {
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    cursor: 'pointer',
    backgroundColor: '#f6f6f6',
  },
  fileCardTitle: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '12.5px',
  },
  fileCardMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  fileCardBody: {
    padding: '12px',
    display: 'grid',
    gap: '12px',
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
  pill: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground2,
  },
});

function formatFileSize(bytes: number) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function GedQuickUploadModal({
  open,
  items,
  uploading,
  maxFiles,
  onClose,
  onAddFiles,
  onToggleItem,
  onRemoveItem,
  onUpdateItem,
  onSubmit,
  onClearAll,
}: GedQuickUploadModalProps) {
  const styles = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);

  const summary = useMemo(() => {
    if (items.length === 0) return 'Nenhum arquivo selecionado.';
    return `${items.length} arquivo(s) pronto(s) para envio.`;
  }, [items.length]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Upload rapido</div>
          <div className={styles.inlineActions}>
            <Button appearance="secondary" onClick={onClearAll} disabled={items.length === 0 || uploading}>
              Limpar lista
            </Button>
            <Button icon={<DismissRegular />} onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.dropZone}>
            <div className={styles.dropTitle}>Adicionar arquivos</div>
            <p className={styles.dropMeta}>
              Selecione ate {maxFiles} arquivos por envio rapido. Para lotes maiores use Importacao ZIP.
            </p>
            <div className={styles.inlineActions}>
              <Button
                appearance="primary"
                icon={<DocumentAddRegular />}
                onClick={() => inputRef.current?.click()}
                disabled={items.length >= maxFiles || uploading}
              >
                Selecionar arquivos
              </Button>
              <span className={styles.pill}>{summary}</span>
            </div>
            <input
              ref={inputRef}
              className={styles.fileInput}
              type="file"
              multiple
              onChange={(event) => {
                if (event.currentTarget.files?.length) {
                  onAddFiles(event.currentTarget.files);
                  event.currentTarget.value = '';
                }
              }}
            />
          </div>

          {items.length > 0 && (
            <div className={styles.fileList}>
              {items.map((item) => (
                <div key={item.id} className={styles.fileCard}>
                  <div className={styles.fileCardHeader} onClick={() => onToggleItem(item.id)}>
                    <div>
                      <div className={styles.fileCardTitle}>{item.payload.title || item.file.name}</div>
                      <div className={styles.fileCardMeta}>
                        {item.file.name} - {formatFileSize(item.file.size)}
                      </div>
                    </div>
                    <div className={styles.inlineActions}>
                      <Button
                        appearance="secondary"
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemoveItem(item.id);
                        }}
                      >
                        Remover
                      </Button>
                      {item.expanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
                    </div>
                  </div>
                  {item.expanded && (
                    <div className={styles.fileCardBody}>
                      <div className={styles.formGrid}>
                        <Field label="Titulo">
                          <Input
                            value={item.payload.title}
                            onChange={(event) =>
                              onUpdateItem(item.id, { ...item.payload, title: event.target.value })
                            }
                            placeholder="Titulo do documento"
                          />
                        </Field>
                        <Field label="Categoria">
                          <Select
                            value={item.payload.category}
                            onChange={(event) =>
                              onUpdateItem(item.id, {
                                ...item.payload,
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
                            value={item.payload.doc_type}
                            onChange={(event) =>
                              onUpdateItem(item.id, {
                                ...item.payload,
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
                            value={item.payload.doc_domain}
                            onChange={(event) =>
                              onUpdateItem(item.id, {
                                ...item.payload,
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
                            value={item.payload.doc_source}
                            onChange={(event) =>
                              onUpdateItem(item.id, {
                                ...item.payload,
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
                            value={item.payload.doc_origin}
                            onChange={(event) =>
                              onUpdateItem(item.id, {
                                ...item.payload,
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
                        <Field label="Descricao" className={styles.formFull}>
                          <Textarea
                            value={item.payload.description ?? ''}
                            onChange={(event) =>
                              onUpdateItem(item.id, {
                                ...item.payload,
                                description: event.target.value,
                              })
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className={styles.inlineActions}>
            <Button appearance="primary" onClick={onSubmit} disabled={items.length === 0 || uploading}>
              {uploading ? 'Enviando...' : 'Enviar arquivos'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
