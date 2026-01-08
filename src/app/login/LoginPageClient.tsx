'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Field,
  Input,
  Button,
  Spinner,
} from '@fluentui/react-components';
import { getSupabaseClient } from '@/lib/supabase/client';

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '12px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '4px',
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  success: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: tokens.fontSizeBase200,
  },
});

export interface LoginPageClientProps {
  nextPath?: string;
  logoutNotice?: boolean;
}

export function LoginPageClient({ nextPath, logoutNotice }: LoginPageClientProps) {
  const styles = useStyles();
  const router = useRouter();

  const safeNextPath = useMemo(() => {
    if (!nextPath || !nextPath.startsWith('/')) return '/';
    return nextPath;
  }, [nextPath]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    logoutNotice ? 'Logout realizado com sucesso. Faça login para continuar.' : null,
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError('Email ou senha inválidos');
        return;
      }

      router.replace(safeNextPath);
    } catch (err) {
      console.error('[auth] signInWithPassword failed', err);
      setError('Email ou senha inválidos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <CardHeader
          header={<span style={{ fontWeight: tokens.fontWeightSemibold }}>Entrar</span>}
          description="Use seu e-mail e senha para acessar."
        />

        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
          {successMessage && <div className={styles.success}>{successMessage}</div>}
          <Field label="E-mail" required>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              disabled={isSubmitting}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Senha" required>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              disabled={isSubmitting}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <Button appearance="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="extra-tiny" />
                  <span style={{ marginLeft: '8px' }}>Entrando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
