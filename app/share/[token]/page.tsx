import { findPageByPublicToken } from '@/server/page/queries';
import Room from './readonlyRoom';
import { notFound } from 'next/navigation';
import AccessDeniedPage from '../../accesDenied';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ PageId?: string }>;
}) {
  const { token } = await params;
  if (!token) notFound();
  try {
    const pageData = await findPageByPublicToken(token);

    if (!pageData.id) {
      return null;
    }
    return <Room pageid={pageData.id}></Room>;
  } catch (e) {
    console.error(e);
    return <AccessDeniedPage />;
  }
}
