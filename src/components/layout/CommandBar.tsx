'use client';

import {
  makeStyles,
  tokens,
  Button,
  Divider,
} from '@fluentui/react-components';
import {
  AddRegular,
  EditRegular,
  DeleteRegular,
  SaveRegular,
  ArrowUndoRegular,
  PrintRegular,
  ShareRegular,
  MoreHorizontalRegular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  commandBar: {
    display: 'flex',
    alignItems: 'center',
    height: '44px',
    padding: '0 16px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    gap: '4px',
  },
  commandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  divider: {
    height: '24px',
    margin: '0 8px',
  },
  commandButton: {
    minWidth: 'unset',
    padding: '6px 12px',
    gap: '6px',
  },
  overflowButton: {
    minWidth: '32px',
    padding: '6px 8px',
  },
});

interface CommandBarProps {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  isEditing?: boolean;
  showEditingControls?: boolean;
}

export function CommandBar({
  onAdd,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onPrint,
  onShare,
  isEditing = false,
  showEditingControls = false,
}: CommandBarProps) {
  const styles = useStyles();

  return (
    <div className={styles.commandBar}>
      <div className={styles.commandGroup}>
        <Button
          className={styles.commandButton}
          appearance="subtle"
          icon={<AddRegular />}
          onClick={onAdd}
        >
          Novo
        </Button>
        
        {!showEditingControls && (
          <>
            <Button
              className={styles.commandButton}
              appearance="subtle"
              icon={<EditRegular />}
              onClick={onEdit}
            >
              Editar
            </Button>
            <Button
              className={styles.commandButton}
              appearance="subtle"
              icon={<DeleteRegular />}
              onClick={onDelete}
            >
              Excluir
            </Button>
          </>
        )}

        {showEditingControls && isEditing && (
          <>
            <Button
              className={styles.commandButton}
              appearance="primary"
              icon={<SaveRegular />}
              onClick={onSave}
            >
              Salvar
            </Button>
            <Button
              className={styles.commandButton}
              appearance="subtle"
              icon={<ArrowUndoRegular />}
              onClick={onCancel}
            >
              Cancelar
            </Button>
          </>
        )}
      </div>

      <Divider vertical className={styles.divider} />

      <div className={styles.commandGroup}>
        <Button
          className={styles.commandButton}
          appearance="subtle"
          icon={<PrintRegular />}
          onClick={onPrint}
        >
          Imprimir
        </Button>
        <Button
          className={styles.commandButton}
          appearance="subtle"
          icon={<ShareRegular />}
          onClick={onShare}
        >
          Compartilhar
        </Button>
      </div>

      <div style={{ flex: 1 }} />

      <Button
        className={styles.overflowButton}
        appearance="subtle"
        icon={<MoreHorizontalRegular />}
        aria-label="Mais ações"
      />
    </div>
  );
}
