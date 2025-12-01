'use client';

import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Avatar,
  Button,
} from '@fluentui/react-components';
import {
  PersonRegular,
  MailRegular,
  PhoneRegular,
  CameraRegular,
} from '@fluentui/react-icons';
import type { DadosPessoais } from '@/types/patient';

const useStyles = makeStyles({
  container: {
    display: 'grid',
    gap: '24px',
    padding: '24px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '200px 1fr',
    },
  },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusLarge,
    height: 'fit-content',
  },
  photoPlaceholder: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: tokens.colorNeutralBackground4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  card: {
    padding: '16px',
  },
});

interface DadosPessoaisTabProps {
  data?: DadosPessoais;
  isEditing?: boolean;
  onChange?: (data: Partial<DadosPessoais>) => void;
}

export function DadosPessoaisTab({ data, isEditing = false, onChange }: DadosPessoaisTabProps) {
  const styles = useStyles();

  const handleFieldChange = (field: keyof DadosPessoais, value: string) => {
    onChange?.({ [field]: value });
  };

  return (
    <div className={styles.container}>
      <div className={styles.photoSection}>
        {data?.foto_url ? (
          <Avatar
            image={{ src: data.foto_url }}
            name={data.nome_completo || 'Paciente'}
            size={120}
          />
        ) : (
          <div className={styles.photoPlaceholder}>
            <PersonRegular style={{ fontSize: '64px', color: tokens.colorNeutralForeground3 }} />
          </div>
        )}
        {isEditing && (
          <Button appearance="outline" icon={<CameraRegular />}>
            Alterar foto
          </Button>
        )}
      </div>

      <div className={styles.formSection}>
        <Card className={styles.card}>
          <CardHeader
            header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Identificação</span>}
          />
          <div className={styles.fieldGroup}>
            <Field label="Nome completo" required>
              <Input
                value={data?.nome_completo || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('nome_completo', e.target.value)}
                contentBefore={<PersonRegular />}
              />
            </Field>
            <Field label="CPF" required>
              <Input
                value={data?.cpf || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
              />
            </Field>
            <Field label="RG">
              <Input
                value={data?.rg || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('rg', e.target.value)}
              />
            </Field>
            <Field label="Órgão emissor">
              <Input
                value={data?.orgao_emissor_rg || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('orgao_emissor_rg', e.target.value)}
              />
            </Field>
            <Field label="Data de nascimento" required>
              <Input
                type="date"
                value={data?.data_nascimento || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('data_nascimento', e.target.value)}
              />
            </Field>
            <Field label="Sexo" required>
              <Select
                value={data?.sexo || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('sexo', e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="Outro">Outro</option>
              </Select>
            </Field>
            <Field label="Estado civil">
              <Select
                value={data?.estado_civil || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('estado_civil', e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
                <option value="uniao_estavel">União estável</option>
              </Select>
            </Field>
          </div>
        </Card>

        <Card className={styles.card}>
          <CardHeader
            header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Contato</span>}
          />
          <div className={styles.fieldGroup}>
            <Field label="Telefone principal" required>
              <Input
                value={data?.telefone_principal || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('telefone_principal', e.target.value)}
                contentBefore={<PhoneRegular />}
                placeholder="(00) 00000-0000"
              />
            </Field>
            <Field label="Telefone secundário">
              <Input
                value={data?.telefone_secundario || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('telefone_secundario', e.target.value)}
                contentBefore={<PhoneRegular />}
                placeholder="(00) 00000-0000"
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={data?.email || ''}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                contentBefore={<MailRegular />}
              />
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}
