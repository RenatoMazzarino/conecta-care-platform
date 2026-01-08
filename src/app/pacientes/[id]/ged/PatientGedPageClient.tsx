'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { makeStyles, tokens, Spinner } from '@fluentui/react-components';
import { ArrowLeftRegular, FolderOpenRegular } from '@fluentui/react-icons';
import { Header } from '@/components/layout';
import { GedExplorerPage } from '@/components/patient/ged/GedExplorerPage';
import { getPatientById, type PatientRow } from '@/features/pacientes/actions/getPatientById';
import { getSupabaseClient } from '@/lib/supabase/client';

interface PatientGedPageClientProps {
  patientId: string;
}

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
  },
  cmdPrimary: {
    backgroundColor: '#0f6cbd',
    border: '1px solid #0f6cbd',
    color: '#ffffff',
    ':hover': {
      backgroundColor: '#005a9e',
      border: '1px solid #005a9e',
    },
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
  main: {
    marginTop: '14px',
    paddingBottom: '40px',
  },
});

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

export function PatientGedPageClient({ patientId }: PatientGedPageClientProps) {
  const styles = useStyles();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);

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

      if (session) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (!user || userError) {
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          setAuthChecked(true);
          router.replace(`/login?next=${encodeURIComponent(`/pacientes/${patientId}/ged`)}`);
          return;
        }

        setIsAuthenticated(true);
        setAuthChecked(true);
        return;
      }

      setIsAuthenticated(false);
      setAuthChecked(true);
      router.replace(`/login?next=${encodeURIComponent(`/pacientes/${patientId}/ged`)}`);
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
        const data = await getPatientById(patientId);
        if (cancelled) return;
        setPatient(data ?? null);
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

  const initials = useMemo(() => {
    const name = patient?.full_name?.trim();
    if (!name) return '—';
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
    return letters.join('');
  }, [patient?.full_name]);

  const statusColor = getStatusColor(patient?.record_status ?? null, patient?.is_active ?? null);
  const recordTitle = patient?.full_name ?? 'Paciente';
  const subtitle = patientError ? patientError : 'GED do paciente';

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
            <button className={styles.cmd} type="button" onClick={() => router.push(`/pacientes/${patientId}`)}>
              <ArrowLeftRegular />
              Voltar para ficha
            </button>
            <button className={`${styles.cmd} ${styles.cmdPrimary}`} type="button">
              <FolderOpenRegular />
              GED
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
        </section>

        <main className={styles.main}>
          <GedExplorerPage patientId={patientId} />
        </main>
      </div>
    </div>
  );
}
