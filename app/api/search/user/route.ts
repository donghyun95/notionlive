// app/api/search/user/route.ts

import { searchUsersByEmailPrefix } from '@/server/invite/queries';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const requesterId = session?.user?.id;

    if (!requesterId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keyword = (req.nextUrl.searchParams.get('keyword') ?? '').trim();
    const workspaceIdParam = req.nextUrl.searchParams.get('workspaceId') ?? '';
    const limitParam = req.nextUrl.searchParams.get('limit') ?? '10';

    const workspaceId = Number(workspaceIdParam);
    const requestedLimit = Number(limitParam);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 10)
      : 10;

    if (!Number.isInteger(workspaceId) || workspaceId < 1) {
      return NextResponse.json(
        { message: '유효하지 않은 workspaceId입니다.' },
        { status: 400 },
      );
    }

    if (keyword.length < 2) {
      return NextResponse.json([]);
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: requesterId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await searchUsersByEmailPrefix(keyword, workspaceId, limit);
    return NextResponse.json(users);
  } catch (error) {
    console.error('USER SEARCH ERROR:', error);

    return NextResponse.json(
      { message: '검색 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
