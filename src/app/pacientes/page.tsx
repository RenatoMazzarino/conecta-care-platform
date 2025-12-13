'use client';

import { useMemo, useState } from 'react';
import {
  makeStyles,
  tokens,
  Input,
  Button,
  Avatar,
} from '@fluentui/react-components';
import {
  AddRegular,
  SearchRegular,
  FilterRegular,
  PhoneRegular,
} from '@fluentui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, CommandBar } from '@/components/layout';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f3f2f1',
  },
  shell: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 16px 32px',
    boxSizing: 'border-box',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#ffffff',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '4px',
    padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: tokens.fontWeightSemibold,
    margin: 0,
  },
  headerMeta: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  searchRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    minWidth: '320px',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    padding: '0 16px',
    backgroundColor: '#ffffff',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    marginTop: '12px',
    overflowX: 'auto',
  },
  tab: {
    border: 'none',
    background: 'transparent',
    fontSize: '13px',
    padding: '10px 12px',
    color: tokens.colorNeutralForeground3,
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    color: '#005a9e',
    borderBottomColor: '#0078d4',
    fontWeight: tokens.fontWeightSemibold,
  },
  main: {
    paddingTop: '16px',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '12px',
    alignItems: 'start',
  },
  card: {
    backgroundColor: '#ffffff',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '4px',
    padding: '12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: '8px',
  },
  patientName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: tokens.fontWeightSemibold,
    fontSize: '14px',
    textDecoration: 'none',
    color: tokens.colorNeutralForeground1,
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    marginTop: '8px',
  },
  statusBadge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '999px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusSuccess: {
    backgroundColor: '#e4f6e4',
    color: '#0b6a0b',
    border: '1px solid #c0e6c0',
  },
  statusWarning: {
    backgroundColor: '#fff4ce',
    color: '#8a6d1f',
    border: '1px solid #f4e3b0',
  },
  statusDanger: {
    backgroundColor: '#fde7e9',
    color: '#a4262c',
    border: '1px solid #f3babf',
  },
  linkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '2px',
    padding: '6px 10px',
    fontSize: '12px',
    textDecoration: 'none',
    color: '#005a9e',
    backgroundColor: '#ffffff',
    marginTop: '10px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
});

const mockPatients = [
  {
    id: '1',
    nome: 'Maria da Silva Santos',
    cpf: '123.456.789-00',
    telefone: '(11) 99999-8888',
    status: 'ativo' as const,
    convenio: 'Unimed',
    cidade: 'São Paulo - SP',
  },
  {
    id: '2',
    nome: 'João Carlos Oliveira',
    cpf: '987.654.321-00',
    telefone: '(11) 98888-7777',
    status: 'ativo' as const,
    convenio: 'Bradesco Saúde',
    cidade: 'São Paulo - SP',
  },
  {
    id: '3',
    nome: 'Ana Paula Ferreira',
    cpf: '456.789.123-00',
    telefone: '(11) 97777-6666',
    status: 'pendente' as const,
    convenio: 'SulAmérica',
    cidade: 'Campinas - SP',
  },
  {
    id: '4',
    nome: 'Pedro Henrique Lima',
    cpf: '321.654.987-00',
    telefone: '(11) 96666-5555',
    status: 'inativo' as const,
    convenio: 'Particular',
    cidade: 'Santos - SP',
  },
];

const statusLabels: Record<string, string> = {
  ativo: 'Ativo',
  pendente: 'Pendente',
  inativo: 'Inativo',
};

const statusCounts = mockPatients.reduce(
  (acc, patient) => {
    acc[patient.status] = (acc[patient.status] || 0) + 1;
    return acc;
  },
  { ativo: 0, pendente: 0, inativo: 0 } as Record<string, number>,
);

const filterOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'ativo', label: 'Ativos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'inativo', label: 'Inativos' },
] as const;

export default function PacientesPage() {
  const styles = useStyles();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<(typeof filterOptions)[number]['value']>('todos');

  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return mockPatients.filter((patient) => {
      const matchesSearch =
        !term ||
        patient.nome.toLowerCase().includes(term) ||
        patient.cpf.toLowerCase().includes(term);
      const matchesStatus = selectedFilter === 'todos' || patient.status === selectedFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedFilter]);

  const statusClass = (status: string) => {
    if (status === 'ativo') return `${styles.statusBadge} ${styles.statusSuccess}`;
    if (status === 'pendente') return `${styles.statusBadge} ${styles.statusWarning}`;
    return `${styles.statusBadge} ${styles.statusDanger}`;
  };

  const handleNewPatient = () => {
    router.push('/pacientes/novo');
  };

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.shell}>
        <CommandBar
          title="Conecta Care · Pacientes"
          breadcrumb="Pacientes > Lista"
          onPrint={() => undefined}
          onShare={() => undefined}
          onPrimaryAction={handleNewPatient}
          primaryActionLabel="Novo paciente"
        />

        <section className={styles.listHeader}>
          <div>
            <div className={styles.headerTitle}>Lista de Pacientes</div>
            <div className={styles.headerMeta}>
              <span>Total: {mockPatients.length}</span>
              <span>Ativos: {statusCounts.ativo}</span>
              <span>Pendentes: {statusCounts.pendente}</span>
              <span>Inativos: {statusCounts.inativo}</span>
            </div>
          </div>
          <div className={styles.searchRow}>
            <Input
              placeholder="Buscar por nome ou CPF..."
              contentBefore={<SearchRegular />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button appearance="outline" icon={<FilterRegular />}>
              Filtros
            </Button>
          </div>
        </section>

        <div className={styles.tabs}>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.tab} ${selectedFilter === option.value ? styles.tabActive : ''}`}
              onClick={() => setSelectedFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <main className={styles.main}>
          <div className={styles.cardsGrid}>
            {filteredPatients.length === 0 ? (
              <div className={styles.card} style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <div className={styles.cardTitle}>Nenhum paciente encontrado</div>
                <div className={styles.muted}>
                  Ajuste os filtros ou crie um novo cadastro.
                </div>
                <Button
                  icon={<AddRegular />}
                  appearance="primary"
                  style={{ marginTop: '12px' }}
                  onClick={handleNewPatient}
                >
                  Adicionar paciente
                </Button>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div key={patient.id} className={styles.card}>
                  <div className={styles.cardTitle}>PAC-{patient.id.padStart(6, '0')}</div>
                  <Link href={`/pacientes/${patient.id}`} className={styles.patientName}>
                    <Avatar name={patient.nome} size={32} color="colorful" />
                    {patient.nome}
                  </Link>
                  <div className={styles.metaRow}>
                    <span className={statusClass(patient.status)}>
                      {statusLabels[patient.status]}
                    </span>
                    <span>CPF: {patient.cpf}</span>
                    <span className={styles.muted}>
                      <PhoneRegular /> {patient.telefone}
                    </span>
                    <span>Convênio: {patient.convenio}</span>
                    <span>{patient.cidade}</span>
                  </div>
                  <Link href={`/pacientes/${patient.id}`} className={styles.linkButton}>
                    Abrir ficha
                  </Link>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
