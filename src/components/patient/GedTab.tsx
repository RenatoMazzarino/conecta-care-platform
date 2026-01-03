'use client';

import { useRouter } from 'next/navigation';
import { Button, makeStyles, tokens } from '@fluentui/react-components';
import { FolderOpenRegular } from '@fluentui/react-icons';

interface GedTabProps {
  patientId: string;
}

const useStyles = makeStyles({
  wrapper: {
    display: 'grid',
    gap: '16px',
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '8px',
    padding: '24px',
    display: 'grid',
    gap: '8px',
    boxShadow: '0 1px 2px rgba(0,0,0,.08)',
  },
  title: {
    fontSize: '16px',
    fontWeight: tokens.fontWeightSemibold,
  },
  subtitle: {
    fontSize: '12.5px',
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
});

export function GedTab({ patientId }: GedTabProps) {
  const styles = useStyles();
  const router = useRouter();

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.title}>GED agora esta em pagina dedicada</div>
        <div className={styles.subtitle}>
          A biblioteca de documentos do paciente abriu em uma pagina exclusiva com pastas, busca e centro de custodia.
        </div>
        <div className={styles.actions}>
          <Button appearance="primary" icon={<FolderOpenRegular />} onClick={() => router.push(`/pacientes/${patientId}/ged`)}>
            Abrir GED
          </Button>
        </div>
      </div>
    </section>
  );
}
