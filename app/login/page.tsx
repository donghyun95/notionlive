import { auth } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/app/login/login-form';

export default async function Page() {
  const session = await auth();
  console.log(session);
  if (session) {
    redirect('/dashboard');
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
