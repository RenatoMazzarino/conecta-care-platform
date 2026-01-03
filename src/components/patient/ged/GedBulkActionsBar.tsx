'use client';

import { Button, makeStyles, tokens } from '@fluentui/react-components';
import { ArchiveRegular, LinkRegular, DismissRegular } from '@fluentui/react-icons';

type GedBulkActionsBarProps = {
  selectedCount: number;
  onArchive: () => void;
  onRequestOriginals: () => void;
  onClear: () => void;
};

const useStyles = makeStyles({
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: '#fff9f1',
  },
  count: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  spacer: {
    marginLeft: 'auto',
  },
});

export function GedBulkActionsBar({ selectedCount, onArchive, onRequestOriginals, onClear }: GedBulkActionsBarProps) {
  const styles = useStyles();

  return (
    <div className={styles.bar}>
      <span className={styles.count}>{selectedCount} selecionado(s)</span>
      <Button icon={<ArchiveRegular />} appearance="secondary" onClick={onArchive}>
        Arquivar
      </Button>
      <Button icon={<LinkRegular />} appearance="secondary" onClick={onRequestOriginals}>
        Solicitar originais
      </Button>
      <span className={styles.spacer} />
      <Button icon={<DismissRegular />} appearance="secondary" onClick={onClear}>
        Limpar selecao
      </Button>
    </div>
  );
}
