// app/api/search/user/route.ts

import { searchUsersByEmailPrefix } from '@/server/invite/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const keyword = req.nextUrl.searchParams.get('keyword') ?? '';
    const workspaceId = req.nextUrl.searchParams.get('workspaceId') ?? null;
    if (!workspaceId || !keyword) {
      return NextResponse.json(
        { message: '검색 중 오류가 발생했습니다.' },
        { status: 500 },
      );
    }
    const users = await searchUsersByEmailPrefix(keyword, Number(workspaceId));
    return NextResponse.json(users);
  } catch (error) {
    console.error('USER SEARCH ERROR:', error);

    return NextResponse.json(
      { message: '검색 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
