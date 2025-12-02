'use client';

import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Field,
  Input,
  Checkbox,
  Textarea,
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
} from '@fluentui/react-components';
import {
  AddRegular,
  EditRegular,
  DeleteRegular,
  PersonRegular,
  PhoneRegular,
  MailRegular,
} from '@fluentui/react-icons';
import type { RedeApoio } from '@/types/patient';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '24px',
  },
  card: {
    padding: '16px',
  },
  tableActions: {
    display: 'flex',
    gap: '8px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    color: tokens.colorNeutralForeground3,
    gap: '16px',
  },
  badgeGroup: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    marginTop: '16px',
  },
  formGrid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
  checkboxGroup: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  formActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
});

interface RedeApoioTabProps {
  data?: RedeApoio[];
  isEditing?: boolean;
  onChange?: (data: RedeApoio[]) => void;
}

// Mock data for demonstration
const mockContatos: RedeApoio[] = [
  {
    id: '1',
    paciente_id: '1',
    nome: 'Maria Silva',
    parentesco: 'Filha',
    telefone: '(11) 99999-8888',
    email: 'maria.silva@email.com',
    is_responsavel_legal: true,
    is_contato_emergencia: true,
    observacoes: 'Disponível após 18h',
  },
  {
    id: '2',
    paciente_id: '1',
    nome: 'João Silva',
    parentesco: 'Filho',
    telefone: '(11) 99999-7777',
    email: 'joao.silva@email.com',
    is_responsavel_legal: false,
    is_contato_emergencia: true,
  },
];

export function RedeApoioTab({ data = mockContatos, isEditing = false, onChange }: RedeApoioTabProps) {
  const styles = useStyles();

  const handleDelete = (id: string) => {
    if (onChange) {
      onChange(data.filter(item => item.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader
          header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Contatos da Rede de Apoio</span>}
          description="Familiares, cuidadores e contatos de emergência"
          action={
            isEditing ? (
              <Button appearance="primary" icon={<AddRegular />}>
                Adicionar contato
              </Button>
            ) : undefined
          }
        />
        
        {data.length === 0 ? (
          <div className={styles.emptyState}>
            <PersonRegular style={{ fontSize: '48px' }} />
            <span>Nenhum contato cadastrado</span>
            {isEditing && (
              <Button appearance="outline" icon={<AddRegular />}>
                Adicionar primeiro contato
              </Button>
            )}
          </div>
        ) : (
          <Table aria-label="Tabela de contatos da rede de apoio">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Nome</TableHeaderCell>
                <TableHeaderCell>Parentesco</TableHeaderCell>
                <TableHeaderCell>Telefone</TableHeaderCell>
                <TableHeaderCell>E-mail</TableHeaderCell>
                <TableHeaderCell>Funções</TableHeaderCell>
                {isEditing && <TableHeaderCell>Ações</TableHeaderCell>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((contato) => (
                <TableRow key={contato.id}>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PersonRegular />
                      {contato.nome}
                    </div>
                  </TableCell>
                  <TableCell>{contato.parentesco}</TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <PhoneRegular />
                      {contato.telefone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {contato.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MailRegular />
                        {contato.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={styles.badgeGroup}>
                      {contato.is_responsavel_legal && (
                        <Badge appearance="filled" color="brand">Responsável legal</Badge>
                      )}
                      {contato.is_contato_emergencia && (
                        <Badge appearance="filled" color="danger">Emergência</Badge>
                      )}
                    </div>
                  </TableCell>
                  {isEditing && (
                    <TableCell>
                      <div className={styles.tableActions}>
                        <Button
                          appearance="subtle"
                          icon={<EditRegular />}
                          aria-label="Editar contato"
                        />
                        <Button
                          appearance="subtle"
                          icon={<DeleteRegular />}
                          aria-label="Excluir contato"
                          onClick={() => handleDelete(contato.id)}
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {isEditing && (
        <Card className={styles.card}>
          <CardHeader
            header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Novo Contato</span>}
          />
          <div className={styles.formSection}>
            <div className={styles.formGrid}>
              <Field label="Nome completo" required>
                <Input
                  placeholder="Nome do contato"
                  contentBefore={<PersonRegular />}
                />
              </Field>
              <Field label="Parentesco/Relação" required>
                <Input
                  placeholder="Ex: Filho(a), Cônjuge, Cuidador"
                />
              </Field>
              <Field label="Telefone" required>
                <Input
                  placeholder="(00) 00000-0000"
                  contentBefore={<PhoneRegular />}
                />
              </Field>
              <Field label="E-mail">
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  contentBefore={<MailRegular />}
                />
              </Field>
            </div>
            <div className={styles.checkboxGroup}>
              <Checkbox label="Responsável legal" />
              <Checkbox label="Contato de emergência" />
            </div>
            <Field label="Observações">
              <Textarea
                placeholder="Observações sobre disponibilidade, preferências de contato, etc."
                rows={2}
              />
            </Field>
            <div className={styles.formActions}>
              <Button appearance="secondary">Cancelar</Button>
              <Button appearance="primary">Salvar contato</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
