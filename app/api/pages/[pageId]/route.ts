import { NextRequest, NextResponse } from 'next/server';
import { getSelfandChildren } from '@/server/users/queries';
import { auth } from '@/lib/auth';

type RouteContext = {
  params: {
    pageId: string;
  };
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

    // 여기부터 정상 로직
    if (userId) {
      const result = await getSelfandChildren(userId, pageid);
      console.log(result);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
