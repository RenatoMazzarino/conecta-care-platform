'use client';

import {
  Button,
  Checkbox,
  Field,
  Input,
  Select,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';
import type { GedDocumentFilters } from '@/features/pacientes/actions/aba05/listGedDocuments';
import { gedDocDomainOptions, gedDocStatusEnumOptions, gedDocTypeOptions } from '@/features/pacientes/schemas/aba05Ged.schema';

const useStyles = makeStyles({
  wrapper: {
    display: 'grid',
    gap: '12px',
  },
  searchRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 1.6fr) 140px auto',
    gap: '12px',
    alignItems: 'end',
    '@media (max-width: 920px)': {
      gridTemplateColumns: '1fr',
    },
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    '@media (max-width: 980px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    '@media (max-width: 680px)': {
      gridTemplateColumns: '1fr',
    },
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  helper: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
  },
});

type GedSearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  globalSearch: boolean;
  onToggleGlobal: (value: boolean) => void;
  filters: GedDocumentFilters;
  onFiltersChange: (patch: Partial<GedDocumentFilters>) => void;
};

export function GedSearchBar({
  query,
  onQueryChange,
  onSearch,
  globalSearch,
  onToggleGlobal,
  filters,
  onFiltersChange,
}: GedSearchBarProps) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <Field label="Busca">
          <Input
            value={query}
            placeholder="Titulo, tag, hash, ID..."
            onChange={(_, data) => onQueryChange(data.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSearch();
              }
            }}
          />
        </Field>
        <div className={styles.toggleRow}>
          <Checkbox
            label="Buscar em todo GED"
            checked={globalSearch}
            onChange={(_, data) => onToggleGlobal(Boolean(data.checked))}
          />
        </div>
        <Button appearance="primary" icon={<SearchRegular />} onClick={onSearch}>
          Buscar
        </Button>
      </div>

      <div className={styles.filters}>
        <Field label="Dominio">
          <Select
            value={filters.doc_domain ?? ''}
            onChange={(_, data) =>
              onFiltersChange({
                doc_domain: data.value ? (data.value as GedDocumentFilters['doc_domain']) : undefined,
              })
            }
          >
            <option value="">Todos</option>
            {gedDocDomainOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo">
          <Select
            value={filters.doc_type ?? ''}
            onChange={(_, data) =>
              onFiltersChange({
                doc_type: data.value ? (data.value as GedDocumentFilters['doc_type']) : undefined,
              })
            }
          >
            <option value="">Todos</option>
            {gedDocTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select
            value={filters.doc_status ?? ''}
            onChange={(_, data) =>
              onFiltersChange({
                doc_status: data.value ? (data.value as GedDocumentFilters['doc_status']) : undefined,
              })
            }
          >
            <option value="">Todos</option>
            {gedDocStatusEnumOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className={styles.helper}>Busca padrao considera a pasta atual e subpastas.</div>
    </div>
  );
}
