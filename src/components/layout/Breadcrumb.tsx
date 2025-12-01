'use client';

import {
  makeStyles,
  tokens,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbButton,
  BreadcrumbDivider,
} from '@fluentui/react-components';
import { HomeRegular } from '@fluentui/react-icons';
import Link from 'next/link';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    height: '40px',
    padding: '0 16px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
});

export interface BreadcrumbItemType {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface AppBreadcrumbProps {
  items: BreadcrumbItemType[];
}

export function AppBreadcrumb({ items }: AppBreadcrumbProps) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Breadcrumb className={styles.breadcrumb} aria-label="Navegação estrutural">
        <BreadcrumbItem>
          <Link href="/" className={styles.link}>
            <BreadcrumbButton icon={<HomeRegular />}>
              Início
            </BreadcrumbButton>
          </Link>
        </BreadcrumbItem>
        
        {items.map((item, index) => (
          <span key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <BreadcrumbDivider />
            <BreadcrumbItem>
              {item.isCurrent || !item.href ? (
                <BreadcrumbButton current={item.isCurrent}>
                  {item.label}
                </BreadcrumbButton>
              ) : (
                <Link href={item.href} className={styles.link}>
                  <BreadcrumbButton>
                    {item.label}
                  </BreadcrumbButton>
                </Link>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </Breadcrumb>
    </div>
  );
}
