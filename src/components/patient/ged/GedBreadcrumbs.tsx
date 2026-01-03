'use client';

import { makeStyles, tokens } from '@fluentui/react-components';

export type GedBreadcrumb = { id: string | null; label: string };

type GedBreadcrumbsProps = {
  items: GedBreadcrumb[];
  onSelect: (id: string | null) => void;
};

const useStyles = makeStyles({
  bar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    padding: '12px 16px 0',
  },
  crumb: {
    border: 0,
    background: 'transparent',
    color: '#0f6cbd',
    cursor: 'pointer',
    fontSize: '12.5px',
    fontWeight: tokens.fontWeightSemibold,
  },
  current: {
    color: tokens.colorNeutralForeground1,
    cursor: 'default',
  },
  divider: {
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
});

export function GedBreadcrumbs({ items, onSelect }: GedBreadcrumbsProps) {
  const styles = useStyles();

  return (
    <div className={styles.bar}>
      {items.map((crumb, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${crumb.label}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className={`${styles.crumb} ${isLast ? styles.current : ''}`}
              onClick={() => !isLast && onSelect(crumb.id)}
              disabled={isLast}
            >
              {crumb.label}
            </button>
            {!isLast && <span className={styles.divider}>/</span>}
          </div>
        );
      })}
    </div>
  );
}
