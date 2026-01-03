'use client';

import { useEffect } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';

export type GedContextMenuItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  intent?: 'danger';
};

type GedContextMenuProps = {
  open: boolean;
  position: { x: number; y: number } | null;
  items: GedContextMenuItem[];
  onClose: () => void;
};

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
  },
  menu: {
    position: 'absolute',
    minWidth: '200px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '8px',
    boxShadow: tokens.shadow8,
    padding: '6px',
    display: 'grid',
    gap: '2px',
  },
  item: {
    appearance: 'none',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    padding: '8px 10px',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
    ':disabled': {
      color: tokens.colorNeutralForeground3,
      cursor: 'not-allowed',
      backgroundColor: 'transparent',
    },
  },
  itemDanger: {
    color: tokens.colorPaletteRedForeground1,
    ':hover': {
      backgroundColor: '#fde7e9',
    },
  },
});

export function GedContextMenu({ open, position, items, onClose }: GedContextMenuProps) {
  const styles = useStyles();

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, open]);

  if (!open || !position) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onContextMenu={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div
        className={styles.menu}
        style={{ top: position.y, left: position.x }}
        onClick={(event) => event.stopPropagation()}
      >
        {items.map((item) => (
          <button
            key={item.label}
            className={`${styles.item} ${item.intent === 'danger' ? styles.itemDanger : ''}`}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            disabled={item.disabled}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
