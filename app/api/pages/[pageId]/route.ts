import { NextRequest, NextResponse } from 'next/server';
import {
  hardDeletePageWithDescendants,
  softDeletePageWithDescendants,
} from '@/server/page/queries';
import { getSelfandChildren } from '@/server/users/queries';
import { auth } from '@/lib/auth';

type RouteContext = {
  params: Promise<{
    pageId: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 400 });
    }
    const userId = session.user?.id;
    const { pageId } = await params;
    const pageid = Number(pageId);

    if (!pageId || !Number.isFinite(pageid)) {
      return new NextResponse(null, { status: 400 });
    }

    if (userId) {
      const result = await getSelfandChildren(userId, pageid);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'INVALID_SESSION' }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
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

    const hardDeleteParam = req.nextUrl.searchParams.get('hardDelete');

    if (hardDeleteParam && hardDeleteParam !== 'true' && hardDeleteParam !== 'false') {
      return NextResponse.json({ error: 'INVALID_HARD_DELETE_OPTION' }, { status: 400 });
    }

    const shouldHardDelete = hardDeleteParam === 'true';
    const result = shouldHardDelete
      ? await hardDeletePageWithDescendants(parsedPageId, userId)
      : await softDeletePageWithDescendants(parsedPageId, userId);

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

    console.error('DELETE /api/pages/[pageId] error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
