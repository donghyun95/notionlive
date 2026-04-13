import { NextRequest, NextResponse } from 'next/server';
import { acceptInvite, declineInvite } from '@/server/invite/queries';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      //user 검증
      return NextResponse.json('인증되지 않은 사용자입니다.', { status: 401 });
    }

    const body = await req.json();
    const { inviteId, type } = body;
    if (type === 'ACCEPT') {
      const result = await acceptInvite(inviteId, userId);
      return NextResponse.json(
        {
          message: '초대가 수락되었습니다.',
          data: result,
        },
        { status: 200 },
      );
    } else if (type === 'DECLINE') {
      const result = await declineInvite(inviteId, userId);
      return NextResponse.json(
        {
          message: '초대가 거절되었습니다.',
          data: result,
          userId,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error('[POST /app/invite/acceptReject]', error);

    return NextResponse.json('Error', { status: 401 });
  }
}
