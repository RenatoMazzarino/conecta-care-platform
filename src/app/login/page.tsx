import { LoginPageClient } from './LoginPageClient';

interface LoginPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const rawNext = searchParams?.next;
  const nextPath = typeof rawNext === 'string' ? rawNext : Array.isArray(rawNext) ? rawNext[0] : undefined;
  return <LoginPageClient nextPath={nextPath} />;
}

