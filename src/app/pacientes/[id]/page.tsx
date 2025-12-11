'use client';

import { useMemo, useState, use } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { Header, CommandBar } from '@/components/layout';
import type { PatientTab, DadosPessoais, Endereco, RedeApoio, Administrativo } from '@/types/patient';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f3f2f1',
    color: tokens.colorNeutralForeground1,
  },
  shell: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 16px 32px',
    boxSizing: 'border-box',
  },
  patientHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: '#ffffff',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '4px',
    padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  patientHeaderMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  patientName: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: tokens.fontWeightSemibold,
  },
  badgeStatus: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '999px',
    backgroundColor: '#e4f6e4',
    color: '#0b6a0b',
    border: '1px solid #c0e6c0',
  },
  badgeAllergy: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '999px',
    backgroundColor: '#fde7e9',
    color: '#a4262c',
    border: '1px solid #f3babf',
  },
  patientMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  patientHeaderSide: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  highlight: {
    fontWeight: tokens.fontWeightSemibold,
    color: '#005a9e',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
    fontSize: '13px',
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: '8px',
    color: tokens.colorNeutralForeground1,
  },
  definitionList: {
    margin: 0,
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    rowGap: '6px',
    columnGap: '8px',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    '& dt': {
      fontWeight: tokens.fontWeightSemibold,
      color: tokens.colorNeutralForeground2,
    },
    '& dd': {
      margin: 0,
    },
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listItemTitle: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    fontSize: '13px',
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  pillList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: 0,
    margin: '8px 0 0 0',
    listStyle: 'none',
  },
  pill: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '999px',
    backgroundColor: '#f3f2f1',
    color: tokens.colorNeutralForeground2,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  actionLink: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: '#ffffff',
    color: '#005a9e',
    borderRadius: '2px',
    fontSize: '12px',
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
    marginTop: '8px',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
      borderColor: '#0078d4',
    },
    ':active': {
      backgroundColor: tokens.colorNeutralBackground2Pressed,
    },
  },
  timeline: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
});

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

const patientTabs: { value: PatientTab; label: string }[] = [
  { value: 'dados-pessoais', label: 'Dados pessoais' },
  { value: 'endereco-logistica', label: 'Endereço & logística' },
  { value: 'rede-apoio', label: 'Rede de apoio' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'clinico', label: 'Clínico' },
  { value: 'documentos', label: 'Documentos (GED)' },
  { value: 'historico', label: 'Histórico & Auditoria' },
];

const calculateAge = (birthDate?: string) => {
  if (!birthDate) return null;
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;
  const diff = Date.now() - date.getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = use(params);
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState<PatientTab>('dados-pessoais');
  const [dadosPessoais] = useState<DadosPessoais>(mockDadosPessoais);
  const [endereco] = useState<Endereco>(mockEndereco);
  const [redeApoio] = useState<RedeApoio[]>(mockRedeApoio);
  const [administrativo] = useState<Administrativo>(mockAdministrativo);

  const idade = useMemo(() => calculateAge(dadosPessoais.data_nascimento), [dadosPessoais.data_nascimento]);
  const breadcrumb = `Pacientes > Lista > ${dadosPessoais.nome_completo}`;
  const responsavelLegal = redeApoio.find((item) => item.is_responsavel_legal)?.nome ?? 'Não informado';
  const cidadeUf = endereco.cidade && endereco.estado ? `${endereco.cidade}/${endereco.estado}` : endereco.cidade;

  void id;

  const renderDefinitionList = (items: { label: string; value?: string | number | null }[]) => (
    <dl className={styles.definitionList}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'contents' }}>
          <dt>{item.label}</dt>
          <dd>{item.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );

  const renderDadosPessoais = () => (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Identificação</div>
        {renderDefinitionList([
          { label: 'Nome completo', value: dadosPessoais.nome_completo },
          { label: 'Nome social', value: 'Não informado' },
          { label: 'CPF', value: dadosPessoais.cpf },
          { label: 'Data de nascimento', value: `${dadosPessoais.data_nascimento} ${idade ? `· ${idade} anos` : ''}`.trim() },
          { label: 'Estado civil', value: dadosPessoais.estado_civil || '—' },
          { label: 'Sexo', value: dadosPessoais.sexo },
        ])}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Documentos</div>
        {renderDefinitionList([
          { label: 'RG', value: dadosPessoais.rg },
          { label: 'Órgão emissor', value: dadosPessoais.orgao_emissor_rg },
          { label: 'PAC-ID', value: 'PAC-000134' },
          { label: 'Status', value: 'Ativo' },
        ])}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Contatos</div>
        {renderDefinitionList([
          { label: 'Telefone principal', value: dadosPessoais.telefone_principal },
          { label: 'Telefone secundário', value: dadosPessoais.telefone_secundario },
          { label: 'E-mail', value: dadosPessoais.email },
          { label: 'Responsável legal', value: responsavelLegal },
        ])}
      </div>
    </div>
  );

  const renderEnderecoLogistica = () => (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Endereço</div>
        {renderDefinitionList([
          { label: 'Logradouro', value: `${endereco.logradouro}, ${endereco.numero}` },
          { label: 'Complemento', value: endereco.complemento },
          { label: 'Bairro', value: endereco.bairro },
          { label: 'Cidade/UF', value: cidadeUf },
          { label: 'CEP', value: endereco.cep },
          { label: 'País', value: endereco.pais },
        ])}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Logística de atendimento</div>
        {renderDefinitionList([
          { label: 'Ponto de referência', value: endereco.referencia },
          { label: 'Instruções de acesso', value: endereco.instrucoes_acesso },
          { label: 'Condições de acesso', value: 'Entrada principal · Sem escadas' },
          { label: 'Local de atendimento', value: 'Residência · Térreo' },
        ])}
        <ul className={styles.pillList}>
          <li className={styles.pill}>Sem escadas</li>
          <li className={styles.pill}>Acesso para ambulância</li>
        </ul>
      </div>
    </div>
  );

  const renderRedeApoio = () => (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Responsáveis & contatos</div>
        <ul className={styles.list}>
          {redeApoio.map((contato) => (
            <li key={contato.id}>
              <div className={styles.listItemTitle}>{contato.nome}</div>
              <div className={styles.muted}>{contato.parentesco}</div>
              <div className={styles.muted}>{contato.telefone}</div>
              {contato.email && <div className={styles.muted}>{contato.email}</div>}
              <ul className={styles.pillList}>
                {contato.is_responsavel_legal && <li className={styles.pill}>Responsável legal</li>}
                {contato.is_contato_emergencia && <li className={styles.pill}>Contato de emergência</li>}
                {contato.observacoes && <li className={styles.pill}>{contato.observacoes}</li>}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Rede informal</div>
        <p className={styles.muted}>
          Liste aqui familiares e vizinhos que dão suporte eventual ao paciente.
        </p>
        <ul className={styles.pillList}>
          <li className={styles.pill}>Vizinha de confiança</li>
          <li className={styles.pill}>Contato emergencial</li>
        </ul>
      </div>
    </div>
  );

  const renderAdministrativo = () => (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Contrato / Convênio</div>
        {renderDefinitionList([
          { label: 'Convênio', value: administrativo.convenio },
          { label: 'Plano', value: administrativo.plano },
          { label: 'Carteirinha', value: administrativo.numero_carteirinha },
          { label: 'Validade', value: administrativo.validade_carteirinha },
          { label: 'Status', value: administrativo.status },
          { label: 'Início atendimento', value: administrativo.data_inicio_atendimento },
        ])}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Observações administrativas</div>
        <p className={styles.muted}>
          {administrativo.observacoes || 'Nenhuma observação registrada.'}
        </p>
        <ul className={styles.pillList}>
          <li className={styles.pill}>Autorizações em dia</li>
          <li className={styles.pill}>LGPD assinado</li>
        </ul>
      </div>
    </div>
  );

  const renderFinanceiro = () => (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Resumo financeiro</div>
        {renderDefinitionList([
          { label: 'Modelo de cobrança', value: 'Convênio · Coparticipação' },
          { label: 'Pendências', value: 'Nenhuma pendência aberta' },
          { label: 'Última fatura', value: 'Out/2025' },
          { label: 'Responsável financeiro', value: responsavelLegal },
        ])}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Controles futuros</div>
        <p className={styles.muted}>
          Espaço reservado para visão de cobranças, glosas e acordos com o convênio.
        </p>
        <ul className={styles.pillList}>
          <li className={styles.pill}>Dashboard simplificado</li>
          <li className={styles.pill}>Integração GED faturamento</li>
        </ul>
      </div>
    </div>
  );

  const renderClinico = () => (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Resumo clínico</div>
        {renderDefinitionList([
          { label: 'Diagnósticos', value: 'Hipertensão · Diabetes' },
          { label: 'Riscos', value: 'Quedas · Lesão de pele' },
          { label: 'Medicações', value: 'Em uso · Revisar posologia mensal' },
          { label: 'Dispositivos', value: 'Sem dispositivos invasivos' },
          { label: 'Alergias', value: 'Dipirona' },
        ])}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Equipe e próximas ações</div>
        <p className={styles.muted}>
          Painel rápido para equipe assistencial acompanhar pendências clínicas.
        </p>
        <ul className={styles.pillList}>
          <li className={styles.pill}>Avaliação enfermagem</li>
          <li className={styles.pill}>Revisão de prescrição</li>
          <li className={styles.pill}>Checklist de dispositivos</li>
        </ul>
      </div>
    </div>
  );

  const renderDocumentos = () => (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Documentos (GED)</div>
        <p className={styles.muted}>
          Atalho para o painel de GED: contratos, termos e laudos do paciente.
        </p>
        <button className={styles.actionLink} type="button">
          Abrir GED
        </button>
      </div>
    </div>
  );

  const renderHistorico = () => (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Histórico & auditoria</div>
        <ul className={styles.timeline}>
          <li>29/11/2025 14:32 · Dados administrativos atualizados</li>
          <li>12/11/2025 09:15 · Atualização de endereço e logística</li>
          <li>02/11/2025 17:40 · Inclusão de responsável legal</li>
          <li>20/10/2025 08:05 · Paciente criado no sistema</li>
        </ul>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'dados-pessoais':
        return renderDadosPessoais();
      case 'endereco-logistica':
        return renderEnderecoLogistica();
      case 'rede-apoio':
        return renderRedeApoio();
      case 'administrativo':
        return renderAdministrativo();
      case 'financeiro':
        return renderFinanceiro();
      case 'clinico':
        return renderClinico();
      case 'documentos':
        return renderDocumentos();
      case 'historico':
        return renderHistorico();
      default:
        return null;
    }
  };

  const handleSave = () => {
    // Futuras integrações: persistir dados no backend
  };

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.shell}>
        <CommandBar
          title="Conecta Care · Pacientes"
          breadcrumb={breadcrumb}
          onPrint={() => undefined}
          onShare={() => undefined}
          onPrimaryAction={handleSave}
          primaryActionLabel="Salvar alterações"
        />

        <section className={styles.patientHeader}>
          <div className={styles.patientHeaderMain}>
            <div className={styles.patientName}>
              {dadosPessoais.nome_completo}
              <span className={styles.badgeStatus}>Ativo · Home Care 24h</span>
              <span className={styles.badgeAllergy}>Alergia: Dipirona</span>
            </div>
            <div className={styles.patientMeta}>
              <span>PAC-000134</span>
              <span>{idade ? `${idade} anos` : 'Idade não informada'}</span>
              <span>Responsável: {responsavelLegal}</span>
              <span>Convênio: {administrativo.convenio || 'Não informado'} · {administrativo.plano || 'Plano'}</span>
            </div>
          </div>
          <div className={styles.patientHeaderSide}>
            <span className={styles.highlight}>Complexidade alta</span>
            <span>{cidadeUf || 'Cidade não informada'}</span>
            <span>Última atualização: 29/11/2025 14:32</span>
          </div>
        </section>

        <div className={styles.tabs}>
          {patientTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`${styles.tab} ${selectedTab === tab.value ? styles.tabActive : ''}`}
              onClick={() => setSelectedTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main className={styles.main}>
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
