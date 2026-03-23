import { NextResponse } from 'next/server';
import {
  getChildrenPageByParentsId,
  getWorkSpacePageByWorkSpaceId,
  getSidebarData,
} from '@/server/users/queries';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 400 });
    }

    const result = await getSidebarData(session.user?.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
