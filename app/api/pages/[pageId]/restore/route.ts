import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { restorePageToRoot } from '@/server/page/queries';

type RouteContext = {
  params: {
    pageId: string;
  };
};

export async function PATCH(_: Request, { params }: RouteContext) {
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

    if (!Number.isInteger(parsedPageId) || parsedPageId <= 0) {
      return NextResponse.json({ error: 'INVALID_PAGE_ID' }, { status: 400 });
    }

    const result = await restorePageToRoot(parsedPageId, userId);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';

    if (
      message === 'Not a workspace member' ||
      message === 'Only OWNER can restore page'
    ) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message === 'Page not found or not deleted') {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
