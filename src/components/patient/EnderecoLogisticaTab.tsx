'use client';

import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Field,
  Input,
  Textarea,
  Button,
} from '@fluentui/react-components';
import {
  LocationRegular,
  MapRegular,
  VehicleCarRegular,
} from '@fluentui/react-icons';
import type { Endereco } from '@/types/patient';

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
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
  },
  addressRow: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 640px)': {
      gridTemplateColumns: '3fr 1fr',
    },
  },
  cityStateRow: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 640px)': {
      gridTemplateColumns: '2fr 1fr 1fr',
    },
  },
  mapSection: {
    height: '200px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: tokens.borderRadiusMedium,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground3,
  },
  mapPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
});

interface EnderecoLogisticaTabProps {
  data?: Endereco;
  isEditing?: boolean;
  onChange?: (data: Partial<Endereco>) => void;
}

export function EnderecoLogisticaTab({ data, isEditing = false, onChange }: EnderecoLogisticaTabProps) {
  const styles = useStyles();

  const handleFieldChange = (field: keyof Endereco, value: string) => {
    onChange?.({ [field]: value });
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader
          header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Endereço</span>}
          action={
            isEditing ? (
              <Button appearance="subtle" size="small">
                Buscar CEP
              </Button>
            ) : undefined
          }
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className={styles.fieldGroup}>
            <Field label="CEP" required>
              <Input
                value={data?.cep || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('cep', e.target.value)}
                placeholder="00000-000"
                contentBefore={<LocationRegular />}
              />
            </Field>
          </div>
          <div className={styles.addressRow}>
            <Field label="Logradouro" required>
              <Input
                value={data?.logradouro || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('logradouro', e.target.value)}
                placeholder="Rua, Avenida, etc."
              />
            </Field>
            <Field label="Número" required>
              <Input
                value={data?.numero || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('numero', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Complemento">
            <Input
              value={data?.complemento || ''}
              disabled={!isEditing}
              onChange={(e) => handleFieldChange('complemento', e.target.value)}
              placeholder="Apartamento, Bloco, etc."
            />
          </Field>
          <div className={styles.cityStateRow}>
            <Field label="Bairro" required>
              <Input
                value={data?.bairro || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('bairro', e.target.value)}
              />
            </Field>
            <Field label="Cidade" required>
              <Input
                value={data?.cidade || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('cidade', e.target.value)}
              />
            </Field>
            <Field label="Estado" required>
              <Input
                value={data?.estado || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('estado', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader
          header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Localização e Acesso</span>}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Ponto de referência">
            <Input
              value={data?.referencia || ''}
              disabled={!isEditing}
              onChange={(e) => handleFieldChange('referencia', e.target.value)}
              contentBefore={<MapRegular />}
              placeholder="Ex: Próximo ao mercado, em frente à praça"
            />
          </Field>
          <Field label="Instruções de acesso">
            <Textarea
              value={data?.instrucoes_acesso || ''}
              disabled={!isEditing}
              onChange={(e) => handleFieldChange('instrucoes_acesso', e.target.value)}
              placeholder="Instruções detalhadas para acesso ao local..."
              rows={3}
            />
          </Field>
        </div>
      </Card>

      <Card className={styles.card}>
        <CardHeader
          header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Mapa</span>}
          description="Localização do paciente para planejamento de rotas"
        />
        <div className={styles.mapSection}>
          <div className={styles.mapPlaceholder}>
            <VehicleCarRegular style={{ fontSize: '48px' }} />
            <span>Mapa será exibido após informar o endereço completo</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
