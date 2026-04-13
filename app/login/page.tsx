import { auth } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/app/login/login-form';

export default async function Page() {
  const session = await auth();
  console.log(session);
  if (!session) {
    console.log(session);
    return <LoginForm />;
  } else {
    redirect(`/dashboard/${session.user.id}`);
  }
}
