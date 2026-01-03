import { LoginPageClient } from './LoginPageClient';

interface LoginPageProps {
  // No Next.js 15, searchParams é uma Promise em componentes Server
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage(props: LoginPageProps) {
  // Desembrulha a Promise antes de acessar as chaves
  const params = await props.searchParams;
  const rawNext = params?.next;
  const rawLogout = params?.logout;
  const nextPath =
    typeof rawNext === 'string' ? rawNext : Array.isArray(rawNext) ? rawNext[0] : undefined;
  const logoutNotice =
    rawLogout === '1' ||
    rawLogout === 'true' ||
    (Array.isArray(rawLogout) ? rawLogout[0] === '1' || rawLogout[0] === 'true' : false);

  return <LoginPageClient nextPath={nextPath} logoutNotice={logoutNotice} />;
}
