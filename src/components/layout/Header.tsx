'use client';

import {
  makeStyles,
  tokens,
  Button,
  Input,
  Avatar,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
  Toaster,
  Toast,
  ToastTitle,
  useId,
  useToastController,
} from '@fluentui/react-components';
import {
  SearchRegular,
  AlertRegular,
  QuestionCircleRegular,
  SettingsRegular,
  PersonRegular,
  SignOutRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from '@fluentui/react-icons';
import { useRouter } from 'next/navigation';
import { AppLauncher } from './AppLauncher';
import { useThemeContext } from '../FluentProviderWrapper';
import { getSupabaseClient } from '@/lib/supabase/client';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    height: '48px',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: '0 8px',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  logo: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  searchSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '600px',
    margin: '0 auto',
  },
  searchInput: {
    width: '100%',
    maxWidth: '400px',
  },
  actionsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  iconButton: {
    color: tokens.colorNeutralForegroundOnBrand,
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  avatarButton: {
    padding: '4px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
});

export function Header() {
  const styles = useStyles();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const router = useRouter();
  const toasterId = useId('header-toast');
  const { dispatchToast } = useToastController(toasterId);

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        dispatchToast(
          <Toast>
            <ToastTitle>Falha ao sair. Tente novamente.</ToastTitle>
          </Toast>,
          { intent: 'error' },
        );
        return;
      }

      router.replace('/login?logout=1');
    } catch (err) {
      console.error('[auth] signOut failed', err);
      dispatchToast(
        <Toast>
          <ToastTitle>Falha ao sair. Tente novamente.</ToastTitle>
        </Toast>,
        { intent: 'error' },
      );
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <AppLauncher />
        <div className={styles.logo}>
          <span>Conecta Care</span>
        </div>
      </div>

      <div className={styles.searchSection}>
        <Input
          className={styles.searchInput}
          placeholder="Pesquisar..."
          contentBefore={<SearchRegular />}
          appearance="filled-lighter"
        />
      </div>

      <div className={styles.actionsSection}>
        <Tooltip content={isDarkMode ? 'Modo claro' : 'Modo escuro'} relationship="label">
          <Button
            appearance="subtle"
            className={styles.iconButton}
            icon={isDarkMode ? <WeatherSunnyRegular /> : <WeatherMoonRegular />}
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
          />
        </Tooltip>
        <Tooltip content="Notificações" relationship="label">
          <Button
            appearance="subtle"
            className={styles.iconButton}
            icon={<AlertRegular />}
            aria-label="Notificações"
          />
        </Tooltip>
        <Tooltip content="Ajuda" relationship="label">
          <Button
            appearance="subtle"
            className={styles.iconButton}
            icon={<QuestionCircleRegular />}
            aria-label="Ajuda"
          />
        </Tooltip>
        <Tooltip content="Configurações" relationship="label">
          <Button
            appearance="subtle"
            className={styles.iconButton}
            icon={<SettingsRegular />}
            aria-label="Configurações"
          />
        </Tooltip>

        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <button className={styles.avatarButton} aria-label="Menu do usuário">
              <Avatar
                name="Usuário"
                size={32}
                color="colorful"
              />
            </button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem icon={<PersonRegular />}>Meu perfil</MenuItem>
              <MenuItem icon={<SettingsRegular />}>Configurações da conta</MenuItem>
              <MenuDivider />
              <MenuItem icon={<SignOutRegular />} onClick={handleSignOut}>
                Sair
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
      <Toaster toasterId={toasterId} />
    </header>
  );
}
