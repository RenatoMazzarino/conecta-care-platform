'use client';

import { Button, makeStyles } from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  FolderAddRegular,
  FolderOpenRegular,
  DocumentAddRegular,
  ArchiveRegular,
  LinkRegular,
  FolderRegular,
} from '@fluentui/react-icons';

type GedCommandBarProps = {
  onCreateFolder: () => void;
  onQuickUpload: () => void;
  onImportZip: () => void;
  onOpenCustody: () => void;
  onArchiveSelected: () => void;
  onRestoreSelected: () => void;
  onMoveSelected: () => void;
  onRequestOriginals: () => void;
  onReload: () => void;
  onToggleArchivedView: () => void;
  hasSelection: boolean;
  archivedView: boolean;
};

const useStyles = makeStyles({
  bar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '10px 16px',
  },
  spacer: {
    marginLeft: 'auto',
  },
});

export function GedCommandBar({
  onCreateFolder,
  onQuickUpload,
  onImportZip,
  onOpenCustody,
  onArchiveSelected,
  onRestoreSelected,
  onMoveSelected,
  onRequestOriginals,
  onReload,
  onToggleArchivedView,
  hasSelection,
  archivedView,
}: GedCommandBarProps) {
  const styles = useStyles();

  return (
    <div className={styles.bar}>
      <Button icon={<FolderAddRegular />} appearance="secondary" onClick={onCreateFolder}>
        Nova pasta
      </Button>
      <Button icon={<DocumentAddRegular />} appearance="primary" onClick={onQuickUpload}>
        Upload rapido
      </Button>
      <Button icon={<FolderOpenRegular />} appearance="secondary" onClick={onImportZip}>
        Importar ZIP
      </Button>
      <Button icon={<LinkRegular />} appearance="secondary" onClick={onOpenCustody}>
        Centro de Custodia
      </Button>
      <Button
        icon={<FolderRegular />}
        appearance="secondary"
        onClick={onMoveSelected}
        disabled={!hasSelection}
      >
        Mover
      </Button>
      <Button
        icon={<ArchiveRegular />}
        appearance="secondary"
        onClick={archivedView ? onRestoreSelected : onArchiveSelected}
        disabled={!hasSelection}
      >
        {archivedView ? 'Desarquivar' : 'Arquivar'}
      </Button>
      <Button
        icon={<LinkRegular />}
        appearance="secondary"
        onClick={onRequestOriginals}
        disabled={!hasSelection}
      >
        Solicitar originais
      </Button>
      <Button icon={<ArchiveRegular />} appearance="secondary" onClick={onToggleArchivedView}>
        {archivedView ? 'Ver ativos' : 'Ver arquivados'}
      </Button>
      <span className={styles.spacer} />
      <Button icon={<ArrowClockwiseRegular />} appearance="secondary" onClick={onReload}>
        Recarregar
      </Button>
    </div>
  );
}
