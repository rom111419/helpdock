import Link from 'next/link';
import { redirect } from 'next/navigation';
import { brand } from '@/config/strings';
import { Logo } from '@/components/Logo';
import { AuthForm } from '@/components/auth/AuthForm';
import { currentUser } from '@/lib/session';

export default async function LoginPage(props: PageProps<'/login'>) {
  const params = await props.searchParams;
  const user = await currentUser();
  if (user) redirect('/app');

  const mode = params.mode === 'signup' ? 'signup' : 'signin';
  const next = typeof params.next === 'string' ? params.next : '/app';

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <Link href="/" className="flex items-center gap-2">
        <Logo />
        <span className="display text-xl">{brand.name}</span>
      </Link>
      <AuthForm mode={mode} next={next} />
    </main>
  );
}
