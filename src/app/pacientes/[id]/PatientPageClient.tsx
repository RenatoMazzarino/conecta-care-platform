'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { makeStyles, tokens, Spinner } from '@fluentui/react-components';
import {
  ArrowClockwiseRegular,
  DismissRegular,
  EditRegular,
  PrintRegular,
  SaveRegular,
  ShareRegular,
} from '@fluentui/react-icons';
import { Header } from '@/components/layout';
import { DadosPessoaisTab, type DadosPessoaisTabHandle } from '@/components/patient/DadosPessoaisTab';
import { EnderecoLogisticaTab, type EnderecoLogisticaTabHandle } from '@/components/patient/EnderecoLogisticaTab';
import { getPatientById, type PatientRow } from '@/features/pacientes/actions/getPatientById';
import { getSupabaseClient } from '@/lib/supabase/client';

const isDevBypassEnabled =
  process.env.NODE_ENV === 'development' && Boolean(process.env.NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN);

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f3f2f1',
    color: tokens.colorNeutralForeground1,
  },
  container: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 14px',
    boxSizing: 'border-box',
  },
  commandBarOuter: {
    backgroundColor: '#ffffff',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  commandBar: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    padding: '10px 0',
  },
  cmd: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
    ':hover': {
      backgroundColor: '#f8f8f8',
      border: '1px solid #f1f1f1',
    },
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
  },
  cmdPrimary: {
    backgroundColor: '#0f6cbd',
    border: '1px solid #0f6cbd',
    color: '#ffffff',
    ':hover': {
      backgroundColor: '#005a9e',
      border: '1px solid #005a9e',
    },
    ':disabled': {
      backgroundColor: '#0f6cbd',
      border: '1px solid #0f6cbd',
      opacity: 0.55,
    },
  },
  cmdSep: {
    marginLeft: 'auto',
  },
  recordHeader: {
    paddingTop: '14px',
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
  },
  recordAvatar: {
    width: '46px',
    height: '46px',
    borderRadius: '6px',
    backgroundColor: '#e6f2fb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    color: '#0f6cbd',
    flexShrink: 0,
  },
  titleBlock: {
    minWidth: '280px',
  },
  title: {
    fontSize: '24px',
    margin: 0,
    lineHeight: 1.15,
  },
  subtitle: {
    marginTop: '2px',
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
  },
  metaRow: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '26px',
    flexWrap: 'wrap',
    '@media (max-width: 1100px)': {
      display: 'none',
    },
  },
  meta: {
    minWidth: '130px',
  },
  metaKey: {
    color: tokens.colorNeutralForeground3,
    fontSize: '11px',
    letterSpacing: '.3px',
    textTransform: 'uppercase',
    marginBottom: '3px',
  },
  metaValue: {
    fontWeight: 700,
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#107c10',
  },
  link: {
    color: '#005a9e',
    fontWeight: 800,
  },
  tabs: {
    marginTop: '14px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    gap: '18px',
    overflowX: 'auto',
    backgroundColor: 'transparent',
  },
  tab: {
    padding: '10px 2px',
    color: tokens.colorNeutralForeground3,
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '13px',
    borderBottom: '2px solid transparent',
    borderTop: 0,
    borderLeft: 0,
    borderRight: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    color: tokens.colorNeutralForeground1,
    borderBottomColor: '#0f6cbd',
  },
  main: {
    marginTop: '14px',
    paddingBottom: '40px',
  },
  tabGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '16px',
    alignItems: 'start',
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1fr',
    },
  },
  tabLeftCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    '@media (max-width: 1100px)': {
      gridTemplateColumns: '1fr',
    },
  },
  tabRightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,.08)',
    overflow: 'hidden',
  },
  cardSpan: {
    gridColumn: '1 / -1',
  },
  cardHeader: {
    padding: '14px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  cardTitle: {
    fontSize: '12px',
    letterSpacing: '.6px',
    textTransform: 'uppercase',
    fontWeight: 900,
    color: tokens.colorNeutralForeground1,
  },
  cardBody: {
    padding: '14px 16px',
  },
  definitionList: {
    margin: 0,
    display: 'grid',
    gridTemplateColumns: '180px 1fr',
    rowGap: '10px',
    columnGap: '12px',
    '& dt': {
      color: tokens.colorNeutralForeground3,
      fontSize: '12px',
      margin: 0,
    },
    '& dd': {
      margin: 0,
      fontWeight: tokens.fontWeightSemibold,
      fontSize: '12.5px',
      overflowWrap: 'anywhere',
      color: tokens.colorNeutralForeground1,
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '140px 1fr',
    },
  },
  muted: {
    margin: 0,
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },
});

type PatientTab =
  | 'dados-pessoais'
  | 'endereco-logistica'
  | 'rede-apoio'
  | 'administrativo'
  | 'financeiro'
  | 'clinico'
  | 'documentos'
  | 'historico';

interface RedeApoio {
  id: string;
  paciente_id: string;
  nome: string;
  parentesco: string;
  telefone: string;
  email?: string;
  is_responsavel_legal: boolean;
  is_contato_emergencia: boolean;
  observacoes?: string;
}

interface Administrativo {
  id: string;
  paciente_id: string;
  convenio?: string;
  numero_carteirinha?: string;
  validade_carteirinha?: string;
  plano?: string;
  data_inicio_atendimento?: string;
  status: 'ativo' | 'inativo' | 'pendente' | 'suspenso';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

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

interface PatientPageClientProps {
  patientId: string;
}

export function PatientPageClient({ patientId }: PatientPageClientProps) {
  const styles = useStyles();
  const router = useRouter();
  const dadosPessoaisRef = useRef<DadosPessoaisTabHandle | null>(null);
  const enderecoLogisticaRef = useRef<EnderecoLogisticaTabHandle | null>(null);
  const [dadosPessoaisUi, setDadosPessoaisUi] = useState({ isEditing: false, isSaving: false });
  const [enderecoLogisticaUi, setEnderecoLogisticaUi] = useState({ isEditing: false, isSaving: false });
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTab, setSelectedTab] = useState<PatientTab>('dados-pessoais');
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [addressSummary, setAddressSummary] = useState<{ city?: string | null; state?: string | null } | null>(null);

  const redeApoio = mockRedeApoio;
  const administrativo = mockAdministrativo;

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const supabase = getSupabaseClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (error) {
        console.error('[auth] getSession failed', error);
      }

      if (session || isDevBypassEnabled) {
        setIsAuthenticated(true);
        setAuthChecked(true);
        return;
      }

      setIsAuthenticated(false);
      setAuthChecked(true);
      router.replace(`/login?next=${encodeURIComponent(`/pacientes/${patientId}`)}`);
    };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [patientId, router]);

  useEffect(() => {
    if (!authChecked || !isAuthenticated) return;
    let cancelled = false;

    const loadPatient = async () => {
      setPatientLoading(true);
      setPatientError(null);
      try {
        const loaded = await getPatientById(patientId);
        if (cancelled) return;
        setPatient(loaded);
      } catch (error) {
        if (cancelled) return;
        setPatientError(error instanceof Error ? error.message : 'Falha ao carregar paciente');
      } finally {
        if (!cancelled) setPatientLoading(false);
      }
    };

    void loadPatient();

    return () => {
      cancelled = true;
    };
  }, [authChecked, isAuthenticated, patientId]);

  const cidadeUf =
    addressSummary?.city && addressSummary?.state ? `${addressSummary.city}/${addressSummary.state}` : addressSummary?.city;
  const responsavelLegal = redeApoio.find((item) => item.is_responsavel_legal)?.nome ?? 'Não informado';

  const initials = useMemo(() => {
    const name = patient?.full_name?.trim();
    if (!name) return '—';
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
    return letters.join('');
  }, [patient?.full_name]);

  const statusLabel = patient ? (patient.is_active ? 'Ativo' : 'Cadastro') : '—';
  const recordTitle = patient?.full_name ?? 'Paciente';
  const subtitle = `Paciente${cidadeUf ? ` • ${cidadeUf}` : ''}`;

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

  const renderEnderecoLogistica = () => (
    <EnderecoLogisticaTab
      ref={enderecoLogisticaRef}
      patientId={patientId}
      patientName={patient?.full_name ?? null}
      onStatusChange={setEnderecoLogisticaUi}
      onAddressSummary={setAddressSummary}
    />
  );

  const renderRedeApoio = () => (
    <div className={styles.tabGrid}>
      <div className={styles.tabLeftCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Responsáveis & contatos</div>
          </div>
          <div className={styles.cardBody}>
            {redeApoio.map((contato) => (
              <div key={contato.id} style={{ padding: '10px 0', borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                <div style={{ fontWeight: 700 }}>{contato.nome}</div>
                <p className={styles.muted}>
                  {contato.parentesco} · {contato.telefone}
                  {contato.email ? ` · ${contato.email}` : ''}
                </p>
                {contato.observacoes && <p className={styles.muted}>{contato.observacoes}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Rede informal</div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.muted}>Placeholder para futura implementação da aba “Rede de apoio”.</p>
          </div>
        </section>
      </div>

      <aside className={styles.tabRightCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Responsável legal</div>
          </div>
          <div className={styles.cardBody}>
            <p style={{ margin: 0, fontWeight: 700 }}>{responsavelLegal}</p>
          </div>
        </section>
      </aside>
    </div>
  );

  const renderAdministrativo = () => (
    <div className={styles.tabGrid}>
      <div className={styles.tabLeftCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Contrato / Convênio</div>
          </div>
          <div className={styles.cardBody}>
            {renderDefinitionList([
              { label: 'Convênio', value: administrativo.convenio },
              { label: 'Plano', value: administrativo.plano },
              { label: 'Carteirinha', value: administrativo.numero_carteirinha },
              { label: 'Validade', value: administrativo.validade_carteirinha },
              { label: 'Status', value: administrativo.status },
              { label: 'Início atendimento', value: administrativo.data_inicio_atendimento },
            ])}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Observações administrativas</div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.muted}>{administrativo.observacoes || 'Nenhuma observação registrada.'}</p>
          </div>
        </section>
      </div>

      <aside className={styles.tabRightCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Notas</div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.muted}>Placeholder para futura implementação da aba “Administrativo”.</p>
          </div>
        </section>
      </aside>
    </div>
  );

  const renderFinanceiro = () => (
    <div className={styles.tabGrid}>
      <div className={styles.tabLeftCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Resumo financeiro</div>
          </div>
          <div className={styles.cardBody}>
            {renderDefinitionList([
              { label: 'Modelo de cobrança', value: 'Convênio · Coparticipação' },
              { label: 'Pendências', value: 'Nenhuma pendência aberta' },
              { label: 'Última fatura', value: 'Out/2025' },
              { label: 'Responsável financeiro', value: responsavelLegal },
            ])}
          </div>
        </section>
      </div>

      <aside className={styles.tabRightCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Notas</div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.muted}>Placeholder para futura implementação da aba “Financeiro”.</p>
          </div>
        </section>
      </aside>
    </div>
  );

  const renderClinico = () => (
    <div className={styles.tabGrid}>
      <div className={styles.tabLeftCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Resumo clínico</div>
          </div>
          <div className={styles.cardBody}>
            {renderDefinitionList([
              { label: 'Diagnósticos', value: 'Hipertensão · Diabetes' },
              { label: 'Riscos', value: 'Quedas · Lesão de pele' },
              { label: 'Medicações', value: 'Em uso · Revisar posologia mensal' },
              { label: 'Dispositivos', value: 'Sem dispositivos invasivos' },
              { label: 'Alergias', value: 'Dipirona' },
            ])}
          </div>
        </section>
      </div>

      <aside className={styles.tabRightCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Notas</div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.muted}>Placeholder para futura implementação da aba “Clínico”.</p>
          </div>
        </section>
      </aside>
    </div>
  );

  const renderDocumentos = () => (
    <div className={styles.tabGrid}>
      <div className={styles.tabLeftCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Documentos (GED)</div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.muted}>Placeholder para futura implementação de GED.</p>
          </div>
        </section>
      </div>

      <aside className={styles.tabRightCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Notas</div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.muted}>Aba “Documentos” será integrada ao Storage + catálogo GED.</p>
          </div>
        </section>
      </aside>
    </div>
  );

  const renderHistorico = () => (
    <div className={styles.tabGrid}>
      <div className={styles.tabLeftCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Histórico & auditoria</div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.muted}>Placeholder para futura implementação de auditoria/linha do tempo real.</p>
          </div>
        </section>
      </div>

      <aside className={styles.tabRightCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Notas</div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.muted}>Aba “Histórico & Auditoria” exibirá eventos de alteração e acessos.</p>
          </div>
        </section>
      </aside>
    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'dados-pessoais':
        return (
          <DadosPessoaisTab
            ref={dadosPessoaisRef}
            patientId={patientId}
            onPatientUpdated={setPatient}
            onStatusChange={setDadosPessoaisUi}
          />
        );
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

  const isDadosPessoaisTabSelected = selectedTab === 'dados-pessoais';
  const isEnderecoLogisticaTabSelected = selectedTab === 'endereco-logistica';
  const isEditableTabSelected = isDadosPessoaisTabSelected || isEnderecoLogisticaTabSelected;
  const activeTabUi = isDadosPessoaisTabSelected ? dadosPessoaisUi : isEnderecoLogisticaTabSelected ? enderecoLogisticaUi : null;
  const isEditingActiveTab = Boolean(activeTabUi?.isEditing);
  const isSavingActiveTab = Boolean(activeTabUi?.isSaving);

  const handleSave = () => {
    if (isDadosPessoaisTabSelected) {
      dadosPessoaisRef.current?.save();
      return;
    }
    if (isEnderecoLogisticaTabSelected) {
      enderecoLogisticaRef.current?.save();
    }
  };

  const handleEdit = () => {
    if (isDadosPessoaisTabSelected) {
      if (dadosPessoaisUi.isEditing) {
        dadosPessoaisRef.current?.cancelEdit();
        return;
      }
      dadosPessoaisRef.current?.startEdit();
      return;
    }
    if (isEnderecoLogisticaTabSelected) {
      if (enderecoLogisticaUi.isEditing) {
        enderecoLogisticaRef.current?.cancelEdit();
        return;
      }
      enderecoLogisticaRef.current?.startEdit();
    }
  };

  const handleReload = () => {
    if (isDadosPessoaisTabSelected) {
      dadosPessoaisRef.current?.reload();
      return;
    }
    if (isEnderecoLogisticaTabSelected) {
      enderecoLogisticaRef.current?.reload();
    }
  };

  if (!authChecked || !isAuthenticated) {
    return (
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Spinner size="medium" />
        <div>Redirecionando para login...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.commandBarOuter}>
        <div className={styles.container}>
          <div className={styles.commandBar}>
            <button className={styles.cmd} type="button">
              <PrintRegular />
              Imprimir
            </button>
            <button className={styles.cmd} type="button">
              <ShareRegular />
              Compartilhar
            </button>
            <button
              className={`${styles.cmd} ${styles.cmdPrimary}`}
              type="button"
              onClick={handleSave}
              disabled={!isEditableTabSelected || !isEditingActiveTab || isSavingActiveTab}
            >
              <SaveRegular />
              Salvar alterações
            </button>

            <span className={styles.cmdSep} />

            <button className={styles.cmd} type="button" onClick={handleEdit} disabled={!isEditableTabSelected}>
              {isEditingActiveTab ? <DismissRegular /> : <EditRegular />}
              {isEditingActiveTab ? 'Cancelar' : 'Editar'}
            </button>
            <button className={styles.cmd} type="button" onClick={handleReload} disabled={!isEditableTabSelected}>
              <ArrowClockwiseRegular />
              Recarregar
            </button>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <section className={styles.recordHeader}>
          <div className={styles.recordAvatar}>{initials}</div>

          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{patientLoading ? 'Carregando...' : recordTitle}</h1>
            <div className={styles.subtitle}>{subtitle}</div>
          </div>

          <div className={styles.metaRow}>
            <div className={styles.meta}>
              <div className={styles.metaKey}>Status</div>
              <div className={styles.metaValue}>
                <span className={styles.dot} />
                {statusLabel}
              </div>
            </div>
            <div className={styles.meta}>
              <div className={styles.metaKey}>Proprietário</div>
              <div className={styles.metaValue}>
                <span className={styles.link}>—</span>
              </div>
            </div>
            <div className={styles.meta}>
              <div className={styles.metaKey}>Complexidade</div>
              <div className={styles.metaValue} style={{ color: '#a4262c' }}>
                Alta
              </div>
            </div>
            <div className={styles.meta}>
              <div className={styles.metaKey}>Convênio</div>
              <div className={styles.metaValue}>{administrativo.convenio || '—'}</div>
            </div>
          </div>
        </section>

        <nav className={styles.tabs}>
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
        </nav>

        <main className={styles.main}>
          {patientError ? (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>Erro ao carregar paciente</div>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.muted}>{patientError}</p>
              </div>
            </section>
          ) : (
            renderTabContent()
          )}
        </main>
      </div>
    </div>
  );
}
