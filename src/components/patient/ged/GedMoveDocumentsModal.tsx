'use client';

import { useMemo, useState } from 'react';
import {
  Button,
  Field,
  Select,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import type { GedFolderRow } from '@/features/pacientes/actions/aba05/gedFolders';

type GedMoveDocumentsModalProps = {
  open: boolean;
  folders: GedFolderRow[];
  currentFolderId: string | null;
  selectedCount: number;
  busy: boolean;
  onClose: () => void;
  onConfirm: (folderId: string | null) => void;
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
    maxWidth: '560px',
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
    display: 'grid',
    gap: '16px',
  },
  footer: {
    padding: '12px 16px 16px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  hint: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
});

export function GedMoveDocumentsModal({
  open,
  folders,
  currentFolderId,
  selectedCount,
  busy,
  onClose,
  onConfirm,
}: GedMoveDocumentsModalProps) {
  const styles = useStyles();
  const [targetFolder, setTargetFolder] = useState<string | null>(null);

  const options = useMemo(() => {
    return folders
      .filter((folder) => !folder.deleted_at)
      .map((folder) => {
        const indent = ' '.repeat(Math.max(0, folder.depth ?? 0) * 2);
        return {
          id: folder.id,
          label: `${indent}${folder.name}`,
        };
      });
  }, [folders]);

  const resolvedTarget = targetFolder ?? (currentFolderId ?? '');

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      onClick={() => {
        setTargetFolder(null);
        onClose();
      }}
    >
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>Mover documentos</div>
          <Button
            icon={<DismissRegular />}
            onClick={() => {
              setTargetFolder(null);
              onClose();
            }}
          >
            Fechar
          </Button>
        </div>
        <div className={styles.body}>
          <div className={styles.hint}>{selectedCount} documento(s) selecionado(s).</div>
          <Field label="Destino">
            <Select value={resolvedTarget} onChange={(_, data) => setTargetFolder(data.value)}>
              <option value="">Sem pasta</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className={styles.footer}>
          <Button
            appearance="secondary"
            onClick={() => {
              setTargetFolder(null);
              onClose();
            }}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button
            appearance="primary"
            onClick={() => {
              onConfirm(resolvedTarget || null);
              setTargetFolder(null);
            }}
            disabled={busy || selectedCount === 0}
          >
            Mover
          </Button>
        </div>
      </div>
    </div>
  );
}
