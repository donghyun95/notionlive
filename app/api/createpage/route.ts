import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { createPage } from '@/server/create/queries';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 401 });
    }
    const body = await req.json(); // 여기서 파싱
    const userID = session.user?.id;

    if (!userID) {
      return NextResponse.json({ error: 'INVALID_SESSION' }, { status: 401 });
    }
    if (body.pageID === null) {
      const result = await createPage(userID, null);
      return NextResponse.json(result);
    }
    // 현재 페이지 ID를 부모로 하는 페이지를 생성
    const parentID = Number(body.pageID);

    if (!Number.isInteger(parentID) || parentID <= 0) {
      return new NextResponse(null, { status: 400 });
    }
    const result = await createPage(userID, parentID);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
