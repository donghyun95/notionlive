import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSoftDeletedPagesInPersonalWorkspace } from '@/server/users/queries';

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 401 });
    }

    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'INVALID_SESSION' }, { status: 401 });
    }

    const deletedPages = await getSoftDeletedPagesInPersonalWorkspace(userId);

    return NextResponse.json(deletedPages);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'PERSONAL_WORKSPACE_NOT_FOUND') {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
