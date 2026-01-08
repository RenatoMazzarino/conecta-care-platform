'use client';

import type { MouseEvent } from 'react';
import { Checkbox, makeStyles, tokens } from '@fluentui/react-components';
import type { Database } from '@/types/supabase';

export type GedDocumentRow = Database['public']['Tables']['patient_documents']['Row'];

type GedFileTableProps = {
  documents: GedDocumentRow[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onOpen: (doc: GedDocumentRow) => void;
  onContextMenu?: (event: MouseEvent, doc: GedDocumentRow) => void;
  showPath: boolean;
  getPathLabel: (doc: GedDocumentRow) => string;
};

const useStyles = makeStyles({
  table: {
    display: 'grid',
    minWidth: '860px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '36px 2.4fr 1fr 1fr 1fr 1fr',
    gap: '8px',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: '12.5px',
    cursor: 'pointer',
  },
  rowWide: {
    gridTemplateColumns: '36px 2.2fr 1fr 1fr 1fr 1fr 1.3fr',
  },
  header: {
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
  cellTitle: {
    fontWeight: tokens.fontWeightSemibold,
  },
  cellMeta: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
  tag: {
    display: 'inline-flex',
    padding: '3px 8px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: tokens.fontWeightSemibold,
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
  empty: {
    padding: '32px 16px',
    color: tokens.colorNeutralForeground3,
  },
});

function getStatusClass(status?: string | null): 'tag' | 'tagOk' | 'tagWarn' | 'tagDanger' {
  if (!status) return 'tag';
  if (status === 'Ativo') return 'tagOk';
  if (status === 'Arquivado') return 'tagWarn';
  if (status === 'Rascunho') return 'tagDanger';
  return 'tag';
}

export function GedFileTable({
  documents,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onOpen,
  onContextMenu,
  showPath,
  getPathLabel,
}: GedFileTableProps) {
  const styles = useStyles();
  const allSelected = documents.length > 0 && documents.every((doc) => selectedIds.has(doc.id));
  const statusMap = {
    tag: '',
    tagOk: styles.tagOk,
    tagWarn: styles.tagWarn,
    tagDanger: styles.tagDanger,
  } as const;

  return (
    <div className={styles.table}>
      <div className={`${styles.row} ${styles.header} ${showPath ? styles.rowWide : ''}`}>
        <Checkbox
          checked={allSelected}
          onChange={(_, data) => onSelectAll(Boolean(data.checked))}
        />
        <div>Arquivo</div>
        <div>Tipo</div>
        <div>Status</div>
        <div>Origem</div>
        <div>Atualizado</div>
        {showPath && <div>Caminho</div>}
      </div>
      {documents.length === 0 && <div className={styles.empty}>Nenhum documento encontrado.</div>}
      {documents.map((doc) => {
        const statusClass = getStatusClass(doc.document_status ?? doc.status ?? undefined);
        return (
          <div
            key={doc.id}
            className={`${styles.row} ${showPath ? styles.rowWide : ''}`}
            onClick={() => onOpen(doc)}
            onContextMenu={(event) => onContextMenu?.(event, doc)}
          >
            <Checkbox
              checked={selectedIds.has(doc.id)}
              onClick={(event) => event.stopPropagation()}
              onChange={(_, data) => onToggleSelect(doc.id, Boolean(data.checked))}
            />
            <div>
              <div className={styles.cellTitle}>{doc.title}</div>
              <div className={styles.cellMeta}>{doc.subcategory ?? '—'} • {doc.domain_type ?? '—'}</div>
            </div>
            <div className={styles.cellMeta}>{doc.subcategory ?? '—'}</div>
            <div>
              <span className={`${styles.tag} ${statusMap[statusClass] ?? ''}`}>
                {doc.document_status ?? doc.status ?? '—'}
              </span>
            </div>
            <div className={styles.cellMeta}>{doc.origin_module ?? '—'}</div>
            <div className={styles.cellMeta}>
              {doc.updated_at ? new Date(doc.updated_at).toLocaleString('pt-BR') : '—'}
            </div>
            {showPath && <div className={styles.cellMeta}>{getPathLabel(doc)}</div>}
          </div>
        );
      })}
    </div>
  );
}
