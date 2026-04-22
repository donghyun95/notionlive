import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { restorePageWithDescendants } from '@/server/page/queries';

type RouteContext = {
  params: Promise<{
    pageId: string;
  }>;
};

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 401 });
    }

    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'INVALID_SESSION' }, { status: 401 });
    }

    const { pageId } = await params;
    const parsedPageId = Number(pageId);

    if (!pageId || !Number.isFinite(parsedPageId)) {
      return NextResponse.json({ error: 'INVALID_PAGE_ID' }, { status: 400 });
    }

    const result = await restorePageWithDescendants(parsedPageId, userId);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (message === 'Not a workspace member') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message === 'Only OWNER can delete page') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message === 'Page not found') {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    console.error('PATCH /api/pages/[pageId]/restore error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
