'use client';

import { ChevronDownRegular, ChevronRightRegular, FolderRegular } from '@fluentui/react-icons';
import { makeStyles, tokens } from '@fluentui/react-components';

export type GedFolderNode = {
  id: string;
  name: string;
  depth: number;
  is_system: boolean | null;
  children: GedFolderNode[];
};

type GedFolderTreeProps = {
  nodes: GedFolderNode[];
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
};

const useStyles = makeStyles({
  tree: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  node: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 8px',
    borderRadius: '8px',
    border: '1px solid transparent',
    cursor: 'pointer',
    fontSize: '12.5px',
    color: tokens.colorNeutralForeground1,
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  nodeActive: {
    backgroundColor: '#eef4fb',
    borderTopColor: '#cfe0f4',
    borderRightColor: '#cfe0f4',
    borderBottomColor: '#cfe0f4',
    borderLeftColor: '#cfe0f4',
    color: '#0f6cbd',
  },
  nodeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flex: 1,
  },
  nodeToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    color: tokens.colorNeutralForeground3,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#e9e9e9',
    },
  },
});

export function GedFolderTree({ nodes, expandedIds, selectedId, onToggle, onSelect }: GedFolderTreeProps) {
  const styles = useStyles();

  const renderNode = (node: GedFolderNode) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const paddingLeft = 6 + node.depth * 16;

    return (
      <div key={node.id}>
        <div
          className={`${styles.node} ${selectedId === node.id ? styles.nodeActive : ''}`}
          style={{ paddingLeft }}
          onClick={() => onSelect(node.id)}
        >
          <span
            className={styles.nodeToggle}
            onClick={(event) => {
              event.stopPropagation();
              if (hasChildren) {
                onToggle(node.id);
              }
            }}
          >
            {hasChildren ? (isExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />) : <span />}
          </span>
          <span className={styles.nodeLabel}>
            <FolderRegular />
            {node.name}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div className={styles.tree}>{node.children.map((child) => renderNode(child))}</div>
        )}
      </div>
    );
  };

  return <div className={styles.tree}>{nodes.map((node) => renderNode(node))}</div>;
}
