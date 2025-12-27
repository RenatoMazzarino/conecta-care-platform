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
import { RedeApoioTab, type RedeApoioTabHandle } from '@/components/patient/RedeApoioTab';
import { AdminFinancialTab, type AdminFinancialTabHandle } from '@/components/patient/AdminFinancialTab';
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
  avatarWrap: {
    position: 'relative',
    borderRadius: '10px',
    padding: '3px',
    border: '2px solid var(--status-color)',
    flexShrink: 0,
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
  statusDot: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    borderRadius: '999px',
    backgroundColor: 'var(--status-color)',
    border: '2px solid #ffffff',
    right: '2px',
    bottom: '2px',
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
  statusPanel: {
    marginTop: '12px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '999px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: '11px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
  },
  statusLabel: {
    color: tokens.colorNeutralForeground3,
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '.4px',
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
  | 'visao-geral'
  | 'dados-pessoais'
  | 'endereco-logistica'
  | 'rede-apoio'
  | 'administrativo'
  | 'clinico'
  | 'documentos'
  | 'historico';

const patientTabs: { value: PatientTab; label: string }[] = [
  { value: 'visao-geral', label: 'Visão geral' },
  { value: 'dados-pessoais', label: 'Dados pessoais' },
  { value: 'endereco-logistica', label: 'Endereço & logística' },
  { value: 'rede-apoio', label: 'Rede de apoio' },
  { value: 'administrativo', label: 'Admin & Financeiro' },
  { value: 'clinico', label: 'Clínico' },
  { value: 'documentos', label: 'Documentos (GED)' },
  { value: 'historico', label: 'Histórico & Auditoria' },
];

interface PatientPageClientProps {
  patientId: string;
}

function getStatusColor(recordStatus?: string | null, isActive?: boolean | null) {
  if (!recordStatus) {
    return isActive ? '#107c10' : '#9aa0a6';
  }
  switch (recordStatus) {
    case 'draft':
    case 'onboarding':
      return '#9aa0a6';
    case 'pending_financial':
      return '#f0b429';
    case 'active':
      return '#107c10';
    case 'inactive':
    case 'deceased':
    case 'discharged':
      return '#d13438';
    default:
      return '#9aa0a6';
  }
}

export function PatientPageClient({ patientId }: PatientPageClientProps) {
  const styles = useStyles();
  const router = useRouter();
  const dadosPessoaisRef = useRef<DadosPessoaisTabHandle | null>(null);
  const enderecoLogisticaRef = useRef<EnderecoLogisticaTabHandle | null>(null);
  const redeApoioRef = useRef<RedeApoioTabHandle | null>(null);
  const adminFinancialRef = useRef<AdminFinancialTabHandle | null>(null);
  const [dadosPessoaisUi, setDadosPessoaisUi] = useState({ isEditing: false, isSaving: false });
  const [enderecoLogisticaUi, setEnderecoLogisticaUi] = useState({ isEditing: false, isSaving: false });
  const [redeApoioUi, setRedeApoioUi] = useState({ isEditing: false, isSaving: false });
  const [adminFinancialUi, setAdminFinancialUi] = useState({ isEditing: false, isSaving: false });
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTab, setSelectedTab] = useState<PatientTab>('visao-geral');
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [addressSummary, setAddressSummary] = useState<{ city?: string | null; state?: string | null } | null>(null);
  const [legalGuardianSummary, setLegalGuardianSummary] = useState<{ name?: string | null; status: string } | null>(null);
  const [adminFinancialSummary, setAdminFinancialSummary] = useState<{
    contract_status?: string | null;
    administrative_status?: string | null;
    billing_status?: string | null;
    checklist_complete?: boolean;
    policy_profile_name?: string | null;
  } | null>(null);

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
  const initials = useMemo(() => {
    const name = patient?.full_name?.trim();
    if (!name) return '—';
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
    return letters.join('');
  }, [patient?.full_name]);

  const statusColor = getStatusColor(patient?.record_status ?? null, patient?.is_active ?? null);
  const recordTitle = patient?.full_name ?? 'Paciente';
  const subtitle = `Paciente${cidadeUf ? ` • ${cidadeUf}` : ''}`;
  const legalGuardianMeta = legalGuardianSummary
    ? `${legalGuardianSummary.status}${legalGuardianSummary.name ? ` · ${legalGuardianSummary.name}` : ''}`
    : 'Ausente';

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
    <RedeApoioTab
      ref={redeApoioRef}
      patientId={patientId}
      onStatusChange={setRedeApoioUi}
      onLegalGuardianSummary={setLegalGuardianSummary}
    />
  );

  const renderAdminFinancial = () => (
    <AdminFinancialTab
      ref={adminFinancialRef}
      patientId={patientId}
      onStatusChange={setAdminFinancialUi}
      onStatusSummary={setAdminFinancialSummary}
    />
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

  const renderVisaoGeral = () => (
    <div className={styles.tabGrid}>
      <div className={styles.tabLeftCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Dashboard do paciente</div>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.muted}>
              Esta aba sera o dashboard geral do paciente. Em breve reunira indicadores e atalhos.
            </p>
          </div>
        </section>
      </div>
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
      case 'visao-geral':
        return renderVisaoGeral();
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
        return renderAdminFinancial();
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
  const isRedeApoioTabSelected = selectedTab === 'rede-apoio';
  const isAdminFinancialTabSelected = selectedTab === 'administrativo';
  const isEditableTabSelected =
    isDadosPessoaisTabSelected || isEnderecoLogisticaTabSelected || isRedeApoioTabSelected || isAdminFinancialTabSelected;
  const activeTabUi = isDadosPessoaisTabSelected
    ? dadosPessoaisUi
    : isEnderecoLogisticaTabSelected
      ? enderecoLogisticaUi
      : isRedeApoioTabSelected
        ? redeApoioUi
        : isAdminFinancialTabSelected
          ? adminFinancialUi
          : null;
  const isEditingActiveTab = Boolean(activeTabUi?.isEditing);
  const isSavingActiveTab = Boolean(activeTabUi?.isSaving);

  const handleSave = () => {
    if (isDadosPessoaisTabSelected) {
      dadosPessoaisRef.current?.save();
      return;
    }
    if (isEnderecoLogisticaTabSelected) {
      enderecoLogisticaRef.current?.save();
      return;
    }
    if (isRedeApoioTabSelected) {
      redeApoioRef.current?.save();
      return;
    }
    if (isAdminFinancialTabSelected) {
      adminFinancialRef.current?.save();
    }
  };

  const handleEdit = () => {
    if (isDadosPessoaisTabSelected) {
      dadosPessoaisRef.current?.startEdit();
      return;
    }
    if (isEnderecoLogisticaTabSelected) {
      enderecoLogisticaRef.current?.startEdit();
      return;
    }
    if (isRedeApoioTabSelected) {
      redeApoioRef.current?.startEdit();
      return;
    }
    if (isAdminFinancialTabSelected) {
      adminFinancialRef.current?.startEdit();
    }
  };

  const handleCancel = () => {
    if (isDadosPessoaisTabSelected) {
      dadosPessoaisRef.current?.cancelEdit();
      return;
    }
    if (isEnderecoLogisticaTabSelected) {
      enderecoLogisticaRef.current?.cancelEdit();
      return;
    }
    if (isRedeApoioTabSelected) {
      redeApoioRef.current?.cancelEdit();
      return;
    }
    if (isAdminFinancialTabSelected) {
      adminFinancialRef.current?.cancelEdit();
    }
  };

  const handleReload = () => {
    if (isDadosPessoaisTabSelected) {
      dadosPessoaisRef.current?.reload();
      return;
    }
    if (isEnderecoLogisticaTabSelected) {
      enderecoLogisticaRef.current?.reload();
      return;
    }
    if (isRedeApoioTabSelected) {
      redeApoioRef.current?.reload();
      return;
    }
    if (isAdminFinancialTabSelected) {
      adminFinancialRef.current?.reload();
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

            {isEditableTabSelected && isEditingActiveTab && (
              <>
                <button
                  className={`${styles.cmd} ${styles.cmdPrimary}`}
                  type="button"
                  onClick={handleSave}
                  disabled={isSavingActiveTab}
                >
                  <SaveRegular />
                  Salvar alterações
                </button>
                <button className={styles.cmd} type="button" onClick={handleCancel} disabled={isSavingActiveTab}>
                  <DismissRegular />
                  Cancelar
                </button>
              </>
            )}

            {isEditableTabSelected && !isEditingActiveTab && (
              <button className={styles.cmd} type="button" onClick={handleEdit}>
                <EditRegular />
                Editar
              </button>
            )}

            {isEditableTabSelected && <span className={styles.cmdSep} />}

            <button className={styles.cmd} type="button" onClick={handleReload} disabled={!isEditableTabSelected}>
              <ArrowClockwiseRegular />
              Recarregar
            </button>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <section className={styles.recordHeader}>
          <div className={styles.avatarWrap} style={{ ['--status-color' as string]: statusColor }}>
            <div className={styles.recordAvatar}>{initials}</div>
            <span className={styles.statusDot} />
          </div>

          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{patientLoading ? 'Carregando...' : recordTitle}</h1>
            <div className={styles.subtitle}>{subtitle}</div>
          </div>

          <div className={styles.metaRow}>
            <div className={styles.meta}>
              <div className={styles.metaKey}>Responsável legal</div>
              <div className={styles.metaValue}>{legalGuardianMeta}</div>
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
              <div className={styles.metaKey}>Política</div>
              <div className={styles.metaValue}>{adminFinancialSummary?.policy_profile_name ?? '—'}</div>
            </div>
          </div>
        </section>

        {adminFinancialSummary && (
          <div className={styles.statusPanel}>
            <div className={styles.statusPill}>
              <span className={styles.statusLabel}>Contrato</span>
              <span>{adminFinancialSummary.contract_status ?? '—'}</span>
            </div>
            <div className={styles.statusPill}>
              <span className={styles.statusLabel}>Admin</span>
              <span>{adminFinancialSummary.administrative_status ?? '—'}</span>
            </div>
            <div className={styles.statusPill}>
              <span className={styles.statusLabel}>Faturamento</span>
              <span>{adminFinancialSummary.billing_status ?? '—'}</span>
            </div>
            <div className={styles.statusPill}>
              <span className={styles.statusLabel}>Checklist</span>
              <span>{adminFinancialSummary.checklist_complete ? 'Completo' : 'Pendente'}</span>
            </div>
          </div>
        )}

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
