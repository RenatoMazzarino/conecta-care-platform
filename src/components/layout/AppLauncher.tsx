'use client';

import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Button,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  GridRegular,
  PeopleRegular,
  CalendarRegular,
  DocumentRegular,
  MoneyRegular,
  BoxRegular,
  SettingsRegular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  trigger: {
    minWidth: '40px',
    padding: '0 12px',
    height: '48px',
    borderRadius: 0,
    backgroundColor: 'transparent',
    border: 'none',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  menuList: {
    width: '280px',
    padding: '8px',
  },
  menuItem: {
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: tokens.fontSizeBase300,
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    padding: '8px 12px',
    fontWeight: tokens.fontWeightSemibold,
  },
});

const appModules = [
  { key: 'pacientes', name: 'Pacientes', icon: <PeopleRegular />, href: '/pacientes' },
  { key: 'agenda', name: 'Agenda', icon: <CalendarRegular />, href: '/agenda' },
  { key: 'prontuarios', name: 'Prontuários', icon: <DocumentRegular />, href: '/prontuarios' },
  { key: 'financeiro', name: 'Financeiro', icon: <MoneyRegular />, href: '/financeiro' },
  { key: 'inventario', name: 'Inventário', icon: <BoxRegular />, href: '/inventario' },
  { key: 'configuracoes', name: 'Configurações', icon: <SettingsRegular />, href: '/configuracoes' },
];

export function AppLauncher() {
  const styles = useStyles();

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          className={styles.trigger}
          appearance="subtle"
          icon={<GridRegular />}
          aria-label="Acessar módulos do aplicativo"
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList className={styles.menuList}>
          <div className={styles.sectionTitle}>Módulos</div>
          {appModules.map((module) => (
            <MenuItem
              key={module.key}
              className={styles.menuItem}
              icon={module.icon}
              onClick={() => window.location.href = module.href}
            >
              {module.name}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
