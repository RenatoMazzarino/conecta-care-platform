'use client';

import { useMemo, useState } from 'react';
import { Button, Field, Input, Select, makeStyles, tokens } from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import type { GedFolderRow } from '@/features/pacientes/actions/aba05/gedFolders';

export type GedFolderModalMode = 'create' | 'rename' | 'move';

type GedFolderModalProps = {
  open: boolean;
  mode: GedFolderModalMode;
  folders: GedFolderRow[];
  activeFolder?: GedFolderRow | null;
  onConfirm: (payload: { name?: string; parentId?: string | null }) => void;
  onClose: () => void;
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
  },
  modal: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow8,
    width: 'min(520px, 92vw)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  title: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '15px',
  },
  body: {
    padding: '16px',
    display: 'grid',
    gap: '12px',
  },
  footer: {
    padding: '16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
});

export function GedFolderModal({ open, mode, folders, activeFolder, onConfirm, onClose }: GedFolderModalProps) {
  const styles = useStyles();
  const [name, setName] = useState(activeFolder?.name ?? '');
  const [parentId, setParentId] = useState<string | null>(activeFolder?.parent_id ?? null);

  const title =
    mode === 'create' ? 'Nova pasta' : mode === 'rename' ? 'Renomear pasta' : 'Mover pasta';

  const selectableParents = useMemo(() => {
    if (mode !== 'move') return [];
    return folders.filter((folder) => folder.id !== activeFolder?.id);
  }, [folders, activeFolder?.id, mode]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <Button appearance="secondary" icon={<DismissRegular />} onClick={onClose} />
        </div>
        <div className={styles.body}>
          {(mode === 'create' || mode === 'rename') && (
            <Field label="Nome da pasta">
              <Input value={name} onChange={(_, data) => setName(data.value)} />
            </Field>
          )}
          {mode === 'move' && (
            <Field label="Mover para">
              <Select value={parentId ?? ''} onChange={(_, data) => setParentId(data.value || null)}>
                <option value="">Raiz</option>
                {selectableParents.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
        <div className={styles.footer}>
          <Button appearance="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            appearance="primary"
            onClick={() => onConfirm({ name: name.trim(), parentId })}
            disabled={(mode !== 'move' && !name.trim()) || (mode === 'move' && !activeFolder)}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
