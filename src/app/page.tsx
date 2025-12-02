'use client';

import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Button,
  Title1,
  Body1,
} from '@fluentui/react-components';
import {
  PeopleRegular,
  CalendarRegular,
  DocumentRegular,
  MoneyRegular,
  BoxRegular,
  ArrowRightRegular,
} from '@fluentui/react-icons';
import Link from 'next/link';
import { Header } from '@/components/layout';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '32px',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },
  cardsGrid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  },
  card: {
    cursor: 'pointer',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    ':hover': {
      boxShadow: tokens.shadow8,
      transform: 'translateY(-2px)',
    },
  },
  cardIcon: {
    fontSize: '32px',
    color: tokens.colorBrandForeground1,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px 0',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
});

const modules = [
  {
    key: 'pacientes',
    title: 'Pacientes',
    description: 'Cadastro e gerenciamento de pacientes, prontuários e histórico de atendimentos.',
    icon: <PeopleRegular />,
    href: '/pacientes',
    count: 45,
  },
  {
    key: 'agenda',
    title: 'Agenda',
    description: 'Agendamento de visitas, escalas de profissionais e gerenciamento de rotinas.',
    icon: <CalendarRegular />,
    href: '/agenda',
    count: 12,
  },
  {
    key: 'prontuarios',
    title: 'Prontuários',
    description: 'Acompanhamento clínico, evoluções e registros de saúde dos pacientes.',
    icon: <DocumentRegular />,
    href: '/prontuarios',
    count: 128,
  },
  {
    key: 'financeiro',
    title: 'Financeiro',
    description: 'Faturamento, cobranças, contratos e gestão financeira.',
    icon: <MoneyRegular />,
    href: '/financeiro',
    count: 8,
  },
  {
    key: 'inventario',
    title: 'Inventário',
    description: 'Controle de materiais, equipamentos e insumos utilizados.',
    icon: <BoxRegular />,
    href: '/inventario',
    count: 156,
  },
];

export default function Home() {
  const styles = useStyles();

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.content}>
        <div className={styles.hero}>
          <Title1>Bem-vindo ao Conecta Care</Title1>
          <Body1>
            Selecione um módulo abaixo para começar a gerenciar suas operações de home care.
          </Body1>
        </div>

        <div className={styles.cardsGrid}>
          {modules.map((module) => (
            <Link key={module.key} href={module.href} className={styles.link}>
              <Card className={styles.card}>
                <CardHeader
                  image={<span className={styles.cardIcon}>{module.icon}</span>}
                  header={<span style={{ fontWeight: tokens.fontWeightSemibold, fontSize: tokens.fontSizeBase400 }}>{module.title}</span>}
                  description={<span>{module.count} registros</span>}
                />
                <div className={styles.cardContent}>
                  <Body1>{module.description}</Body1>
                  <Button
                    appearance="subtle"
                    icon={<ArrowRightRegular />}
                    iconPosition="after"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Acessar
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
