'use client';

import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
  Badge,
} from '@fluentui/react-components';
import {
  CalendarRegular,
  DocumentRegular,
  NoteRegular,
} from '@fluentui/react-icons';
import type { Administrativo } from '@/types/patient';

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
  fieldGroup: {
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
  statusSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  metadataRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  metadataItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

const statusColors: Record<string, 'brand' | 'success' | 'warning' | 'danger' | 'informative'> = {
  ativo: 'success',
  inativo: 'danger',
  pendente: 'warning',
  suspenso: 'informative',
};

const statusLabels: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  pendente: 'Pendente',
  suspenso: 'Suspenso',
};

interface AdministrativoTabProps {
  data?: Administrativo;
  isEditing?: boolean;
  onChange?: (data: Partial<Administrativo>) => void;
}

export function AdministrativoTab({ data, isEditing = false, onChange }: AdministrativoTabProps) {
  const styles = useStyles();

  const handleFieldChange = (field: keyof Administrativo, value: string) => {
    onChange?.({ [field]: value });
  };

  const currentStatus = data?.status || 'pendente';

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader
          header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Status do Paciente</span>}
        />
        <div className={styles.statusSection}>
          <Field label="Status atual" style={{ flex: 1 }}>
            <Select
              value={currentStatus}
              disabled={!isEditing}
              onChange={(e) => handleFieldChange('status', e.target.value)}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="pendente">Pendente</option>
              <option value="suspenso">Suspenso</option>
            </Select>
          </Field>
          <div style={{ paddingTop: '24px' }}>
            <Badge
              appearance="filled"
              color={statusColors[currentStatus]}
              size="large"
            >
              {statusLabels[currentStatus]}
            </Badge>
          </div>
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader
          header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Convênio / Plano de Saúde</span>}
          description="Informações sobre o convênio do paciente"
        />
        <div className={styles.fieldGroup}>
          <Field label="Convênio">
            <Input
              value={data?.convenio || ''}
              disabled={!isEditing}
              onChange={(e) => handleFieldChange('convenio', e.target.value)}
              contentBefore={<DocumentRegular />}
              placeholder="Nome do convênio"
            />
          </Field>
          <Field label="Plano">
            <Input
              value={data?.plano || ''}
              disabled={!isEditing}
              onChange={(e) => handleFieldChange('plano', e.target.value)}
              placeholder="Tipo do plano"
            />
          </Field>
          <Field label="Número da carteirinha">
            <Input
              value={data?.numero_carteirinha || ''}
              disabled={!isEditing}
              onChange={(e) => handleFieldChange('numero_carteirinha', e.target.value)}
            />
          </Field>
          <Field label="Validade da carteirinha">
            <Input
              type="date"
              value={data?.validade_carteirinha || ''}
              disabled={!isEditing}
              onChange={(e) => handleFieldChange('validade_carteirinha', e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader
          header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Período de Atendimento</span>}
        />
        <div className={styles.fieldGroup}>
          <Field label="Data de início">
            <Input
              type="date"
              value={data?.data_inicio_atendimento || ''}
              disabled={!isEditing}
              onChange={(e) => handleFieldChange('data_inicio_atendimento', e.target.value)}
              contentBefore={<CalendarRegular />}
            />
          </Field>
          <Field label="Data de término (prevista)">
            <Input
              type="date"
              value={data?.data_fim_atendimento || ''}
              disabled={!isEditing}
              onChange={(e) => handleFieldChange('data_fim_atendimento', e.target.value)}
              contentBefore={<CalendarRegular />}
            />
          </Field>
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader
          header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Observações Administrativas</span>}
        />
        <Field label="Observações">
          <Textarea
            value={data?.observacoes || ''}
            disabled={!isEditing}
            onChange={(e) => handleFieldChange('observacoes', e.target.value)}
            placeholder="Informações administrativas relevantes, restrições, autorizações especiais..."
            rows={4}
          />
        </Field>

        {data?.created_at && (
          <div className={styles.metadataRow}>
            <div className={styles.metadataItem}>
              <NoteRegular />
              <span>Criado em: {new Date(data.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            {data.updated_at && (
              <div className={styles.metadataItem}>
                <NoteRegular />
                <span>Última atualização: {new Date(data.updated_at).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
