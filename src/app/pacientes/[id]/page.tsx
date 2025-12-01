'use client';

import { useState, use } from 'react';
import {
  makeStyles,
  tokens,
  Tab,
  TabList,
  SelectTabEvent,
  SelectTabData,
} from '@fluentui/react-components';
import {
  PersonRegular,
  LocationRegular,
  PeopleRegular,
  DocumentRegular,
} from '@fluentui/react-icons';
import { Header, AppBreadcrumb, CommandBar } from '@/components/layout';
import {
  DadosPessoaisTab,
  EnderecoLogisticaTab,
  RedeApoioTab,
  AdministrativoTab,
} from '@/components/patient';
import type { PatientTab, DadosPessoais, Endereco, RedeApoio, Administrativo } from '@/types/patient';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  tabsContainer: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    paddingLeft: '16px',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: tokens.colorNeutralBackground2,
  },
});

// Mock data for demonstration
const mockDadosPessoais: DadosPessoais = {
  id: '1',
  nome_completo: 'Maria da Silva Santos',
  cpf: '123.456.789-00',
  data_nascimento: '1955-03-15',
  sexo: 'F',
  estado_civil: 'viuvo',
  rg: '12.345.678-9',
  orgao_emissor_rg: 'SSP-SP',
  telefone_principal: '(11) 99999-8888',
  telefone_secundario: '(11) 3333-4444',
  email: 'maria.silva@email.com',
};

const mockEndereco: Endereco = {
  id: '1',
  paciente_id: '1',
  cep: '01310-100',
  logradouro: 'Avenida Paulista',
  numero: '1578',
  complemento: 'Apto 42',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  estado: 'SP',
  pais: 'Brasil',
  referencia: 'Próximo ao MASP',
  instrucoes_acesso: 'Entrar pela portaria principal, subir ao 4º andar. Interfone 42.',
};

const mockRedeApoio: RedeApoio[] = [
  {
    id: '1',
    paciente_id: '1',
    nome: 'Ana Silva',
    parentesco: 'Filha',
    telefone: '(11) 99999-7777',
    email: 'ana.silva@email.com',
    is_responsavel_legal: true,
    is_contato_emergencia: true,
    observacoes: 'Disponível após 18h',
  },
  {
    id: '2',
    paciente_id: '1',
    nome: 'Carlos Silva',
    parentesco: 'Filho',
    telefone: '(11) 98888-6666',
    email: 'carlos.silva@email.com',
    is_responsavel_legal: false,
    is_contato_emergencia: true,
  },
];

const mockAdministrativo: Administrativo = {
  id: '1',
  paciente_id: '1',
  convenio: 'Unimed',
  numero_carteirinha: '0123456789',
  validade_carteirinha: '2025-12-31',
  plano: 'Nacional Plus',
  data_inicio_atendimento: '2024-01-15',
  status: 'ativo',
  observacoes: 'Paciente com autorização para home care integral.',
  created_at: '2024-01-10T10:00:00Z',
  updated_at: '2024-06-15T14:30:00Z',
};

const tabIcons = {
  'dados-pessoais': <PersonRegular />,
  'endereco-logistica': <LocationRegular />,
  'rede-apoio': <PeopleRegular />,
  'administrativo': <DocumentRegular />,
};

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params);
  
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<PatientTab>('dados-pessoais');
  const [isEditing, setIsEditing] = useState(false);

  // In a real app, you would fetch patient data using the id
  console.log('Patient ID:', id);

  // Data states
  const [dadosPessoais, setDadosPessoais] = useState<DadosPessoais>(mockDadosPessoais);
  const [endereco, setEndereco] = useState<Endereco>(mockEndereco);
  const [redeApoio, setRedeApoio] = useState<RedeApoio[]>(mockRedeApoio);
  const [administrativo, setAdministrativo] = useState<Administrativo>(mockAdministrativo);

  const breadcrumbItems = [
    { label: 'Pacientes', href: '/pacientes' },
    { label: dadosPessoais.nome_completo, isCurrent: true },
  ];

  const handleTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value as PatientTab);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Here you would save to Supabase
    console.log('Saving data...');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setDadosPessoais(mockDadosPessoais);
    setEndereco(mockEndereco);
    setRedeApoio(mockRedeApoio);
    setAdministrativo(mockAdministrativo);
    setIsEditing(false);
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'dados-pessoais':
        return (
          <DadosPessoaisTab
            data={dadosPessoais}
            isEditing={isEditing}
            onChange={(updates) => setDadosPessoais({ ...dadosPessoais, ...updates })}
          />
        );
      case 'endereco-logistica':
        return (
          <EnderecoLogisticaTab
            data={endereco}
            isEditing={isEditing}
            onChange={(updates) => setEndereco({ ...endereco, ...updates })}
          />
        );
      case 'rede-apoio':
        return (
          <RedeApoioTab
            data={redeApoio}
            isEditing={isEditing}
            onChange={setRedeApoio}
          />
        );
      case 'administrativo':
        return (
          <AdministrativoTab
            data={administrativo}
            isEditing={isEditing}
            onChange={(updates) => setAdministrativo({ ...administrativo, ...updates })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <AppBreadcrumb items={breadcrumbItems} />
      <CommandBar
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={isEditing}
        showEditingControls={isEditing}
      />
      
      <div className={styles.tabsContainer}>
        <TabList selectedValue={selectedTab} onTabSelect={handleTabSelect}>
          <Tab value="dados-pessoais" icon={tabIcons['dados-pessoais']}>
            Dados pessoais
          </Tab>
          <Tab value="endereco-logistica" icon={tabIcons['endereco-logistica']}>
            Endereço & logística
          </Tab>
          <Tab value="rede-apoio" icon={tabIcons['rede-apoio']}>
            Rede de apoio
          </Tab>
          <Tab value="administrativo" icon={tabIcons['administrativo']}>
            Administrativo
          </Tab>
        </TabList>
      </div>

      <main className={styles.content}>
        {renderTabContent()}
      </main>
    </div>
  );
}
