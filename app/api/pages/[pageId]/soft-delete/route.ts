import { NextResponse } from 'next/server';
import { softDeletePageWithDescendants } from '@/server/page/queries';
import { auth } from '@/lib/auth';

type RouteContext = {
  params: Promise<{
    pageId: string;
  }>;
};

export async function DELETE(_: Request, { params }: RouteContext) {
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

    const result = await softDeletePageWithDescendants(parsedPageId, userId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    console.log('메세지', message);
    if (message === 'Not a workspace member') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message === 'Only OWNER can delete page') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message === 'Page not found') {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (
      message === '개인 워크스페이스의 마지막 루트 페이지는 삭제할 수 없습니다.'
    ) {
      console.log('잘나옴');
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error('DELETE /api/pages/[pageId]/soft-delete error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
