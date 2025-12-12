'use client';

import { ReactNode } from 'react';
import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { PrintRegular, SaveRegular, ShareRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  commandBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    gap: '12px',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  title: {
    fontSize: '14px',
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  breadcrumb: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  actionButton: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: '#ffffff',
    color: tokens.colorNeutralForeground2,
    borderRadius: '2px',
    fontSize: '12px',
    padding: '6px 10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
    ':active': {
      backgroundColor: tokens.colorNeutralBackground2Pressed,
    },
  },
  primaryAction: {
    backgroundColor: '#0078d4',
    border: '1px solid #005a9e',
    color: '#ffffff',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
    ':hover': {
      backgroundColor: '#0b6ebf',
    },
    ':active': {
      backgroundColor: '#005a9e',
    },
  },
  icon: {
    fontSize: '14px',
  },
});

interface CommandBarProps {
  title: string;
  breadcrumb?: string;
  onPrint?: () => void;
  onShare?: () => void;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  extraActions?: ReactNode;
}

export function CommandBar({
  title,
  breadcrumb,
  onPrint,
  onShare,
  onPrimaryAction,
  primaryActionLabel = 'Salvar alterações',
  extraActions,
}: CommandBarProps) {
  const styles = useStyles();

  return (
    <div className={styles.commandBar}>
      <div className={styles.left}>
        <span className={styles.title}>{title}</span>
        {breadcrumb && <span className={styles.breadcrumb}>{breadcrumb}</span>}
      </div>

      <div className={styles.actions}>
        {extraActions}

        {onPrint && (
          <button className={styles.actionButton} onClick={onPrint} type="button">
            <PrintRegular className={styles.icon} />
            Imprimir
          </button>
        )}
        {onShare && (
          <button className={styles.actionButton} onClick={onShare} type="button">
            <ShareRegular className={styles.icon} />
            Compartilhar
          </button>
        )}
        {onPrimaryAction && (
          <button
            className={mergeClasses(styles.actionButton, styles.primaryAction)}
            onClick={onPrimaryAction}
            type="button"
          >
            <SaveRegular className={styles.icon} />
            {primaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
