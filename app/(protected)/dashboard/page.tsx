import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  redirect(`/dashboard/${user.id}`);
}
