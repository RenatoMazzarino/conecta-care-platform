'use client';

import Link from 'next/link';
import { makeStyles, tokens, Card, CardHeader, Body1 } from '@fluentui/react-components';
import { Header } from './Header';
import { CommandBar } from './CommandBar';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f3f2f1',
  },
  shell: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 16px 32px',
    boxSizing: 'border-box',
  },
  card: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#ffffff',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingTop: '12px',
    color: tokens.colorNeutralForeground2,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '2px',
    padding: '8px 12px',
    fontSize: '12px',
    textDecoration: 'none',
    color: '#005a9e',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
});

interface ComingSoonPageProps {
  moduleName: string;
  description?: string;
}

export function ComingSoonPage({ moduleName, description }: ComingSoonPageProps) {
  const styles = useStyles();

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.shell}>
        <CommandBar title={`Conecta Care · ${moduleName}`} breadcrumb={moduleName} />

        <Card className={styles.card}>
          <CardHeader
            header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>{moduleName} — em construção</span>}
            description={<span>Este módulo será liberado em etapas.</span>}
          />

          <div className={styles.content}>
            <Body1>
              {description ??
                'Enquanto isso, acompanhe os contratos, migrations e PRs para entender o que já está disponível e o que está planejado.'}
            </Body1>

            <div className={styles.actions}>
              <Link href="/" className={styles.link}>
                Voltar para Início
              </Link>
              <Link href="/pacientes" className={styles.link}>
                Ir para Pacientes
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

