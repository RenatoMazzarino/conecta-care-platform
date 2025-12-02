'use client';

import {
  makeStyles,
  tokens,
  Card,
  Button,
  Input,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Avatar,
  Badge,
  Title2,
  Body1,
} from '@fluentui/react-components';
import {
  AddRegular,
  SearchRegular,
  FilterRegular,
  PersonRegular,
  PhoneRegular,
} from '@fluentui/react-icons';
import Link from 'next/link';
import { Header, AppBreadcrumb, CommandBar } from '@/components/layout';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchSection: {
    display: 'flex',
    gap: '8px',
    flex: 1,
    maxWidth: '400px',
  },
  tableCard: {
    padding: '0',
    overflow: 'hidden',
  },
  patientLink: {
    textDecoration: 'none',
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    ':hover': {
      textDecoration: 'underline',
    },
  },
  patientCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px',
    gap: '16px',
    color: tokens.colorNeutralForeground3,
  },
});

// Mock patient data
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

const statusColors: Record<string, 'success' | 'warning' | 'danger'> = {
  ativo: 'success',
  pendente: 'warning',
  inativo: 'danger',
};

const statusLabels: Record<string, string> = {
  ativo: 'Ativo',
  pendente: 'Pendente',
  inativo: 'Inativo',
};

export default function PacientesPage() {
  const styles = useStyles();

  const breadcrumbItems = [
    { label: 'Pacientes', isCurrent: true },
  ];

  return (
    <div className={styles.page}>
      <Header />
      <AppBreadcrumb items={breadcrumbItems} />
      <CommandBar
        onAdd={() => window.location.href = '/pacientes/novo'}
      />
      
      <main className={styles.content}>
        <div className={styles.toolbar}>
          <Title2>Lista de Pacientes</Title2>
          <div className={styles.searchSection}>
            <Input
              placeholder="Buscar por nome ou CPF..."
              contentBefore={<SearchRegular />}
              style={{ flex: 1 }}
            />
            <Button appearance="outline" icon={<FilterRegular />}>
              Filtros
            </Button>
          </div>
        </div>

        <Card className={styles.tableCard}>
          {mockPatients.length === 0 ? (
            <div className={styles.emptyState}>
              <PersonRegular style={{ fontSize: '48px' }} />
              <Title2>Nenhum paciente cadastrado</Title2>
              <Body1>Comece adicionando o primeiro paciente ao sistema.</Body1>
              <Button appearance="primary" icon={<AddRegular />}>
                Adicionar paciente
              </Button>
            </div>
          ) : (
            <Table aria-label="Lista de pacientes">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Paciente</TableHeaderCell>
                  <TableHeaderCell>CPF</TableHeaderCell>
                  <TableHeaderCell>Telefone</TableHeaderCell>
                  <TableHeaderCell>Convênio</TableHeaderCell>
                  <TableHeaderCell>Cidade</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className={styles.patientCell}>
                        <Avatar
                          name={patient.nome}
                          size={32}
                          color="colorful"
                        />
                        <Link href={`/pacientes/${patient.id}`} className={styles.patientLink}>
                          {patient.nome}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{patient.cpf}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PhoneRegular />
                        {patient.telefone}
                      </div>
                    </TableCell>
                    <TableCell>{patient.convenio}</TableCell>
                    <TableCell>{patient.cidade}</TableCell>
                    <TableCell>
                      <Badge
                        appearance="filled"
                        color={statusColors[patient.status]}
                      >
                        {statusLabels[patient.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>
    </div>
  );
}
