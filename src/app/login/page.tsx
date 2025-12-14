'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
});

export default function LoginPage() {
  const styles = useStyles();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => {
    const next = searchParams.get('next');
    if (!next || !next.startsWith('/')) return '/';
    return next;
  }, [searchParams]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
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

      router.replace(nextPath);
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

