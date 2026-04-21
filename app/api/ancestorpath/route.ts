import { NextRequest, NextResponse } from 'next/server';
import { getSelfandChildren } from '@/server/users/queries';
import { auth } from '@/lib/auth';
import { getPageAncestorPath } from '@/server/create/queries';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 400 });
    }
    const { searchParams } = new URL(req.url);
    const pageIdParam = searchParams.get('pageId');
    const userId = session.user?.id;
    console.log(pageIdParam);
    const pageid = Number(pageIdParam);

    if (!pageIdParam || !Number.isFinite(pageid)) {
      return new NextResponse(null, { status: 400 });
    }

    // 여기부터 정상 로직
    if (userId) {
      const result = await getPageAncestorPath(userId, pageid);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'PAGE_NOT_FOUND_OR_DELETED') {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
