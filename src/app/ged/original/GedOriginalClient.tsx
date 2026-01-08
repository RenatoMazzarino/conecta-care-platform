'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Spinner, makeStyles, tokens } from '@fluentui/react-components';
import { consumeGedSecureLink } from '@/features/pacientes/actions/aba05/consumeGedSecureLink';

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f2f1',
    color: tokens.colorNeutralForeground1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    backgroundColor: '#ffffff',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,.08)',
    padding: '24px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 800,
  },
  subtitle: {
    marginTop: '8px',
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
  },
});

export function GedOriginalClient() {
  const styles = useStyles();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(token ? 'idle' : 'error');
  const [message, setMessage] = useState<string>(token ? '' : 'Token nao informado.');

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const run = async () => {
      setStatus('loading');
      setMessage('');
      try {
        const result = await consumeGedSecureLink(token);
        if (cancelled) return;
        setStatus('success');
        setMessage('Download autorizado. Abrindo o original...');
        window.location.assign(result.url);
      } catch (error) {
        if (cancelled) return;
        const text = error instanceof Error ? error.message : 'Falha ao consumir link seguro';
        setStatus('error');
        setMessage(text);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>GED • Link seguro</h1>
        <p className={styles.subtitle}>Autenticacao necessaria. O download e unico e expira automaticamente.</p>
        {status === 'loading' && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Spinner size="medium" />
            <span>Validando link...</span>
          </div>
        )}
        {status !== 'loading' && message && <p style={{ marginTop: '16px' }}>{message}</p>}
      </div>
    </div>
  );
}
