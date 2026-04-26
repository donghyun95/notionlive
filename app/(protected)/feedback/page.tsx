import { auth } from '@/lib/auth';
import { isAdminEmail } from '@/lib/auth/isAdminEmail';
import { redirect } from 'next/navigation';

import FeedbackAdminListClient from './FeedbackAdminListClient';

export default async function FeedbackAdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!isAdminEmail(session.user.email)) {
    redirect('/dashboard');
  }

  return <FeedbackAdminListClient />;
}
