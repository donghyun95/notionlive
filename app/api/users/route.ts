import { NextResponse } from 'next/server';
import { getUsers, getSidebarData, registerUser } from '@/server/users/queries';
import { auth } from '@/lib/auth';
import { verifyTurnstileToken } from '@/lib/turnstile';

export async function GET(request: Request) {
  const session = await auth();
  try {
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session) {
      if (!session?.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const users = await getSidebarData(session?.user.id);
      return NextResponse.json(users);
    }
  } catch {
    return NextResponse.json({ message: 'No Have User' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, turnstileToken } = body;
    if (!email || !password || !name || !turnstileToken) {
      return NextResponse.json(
        { message: '필수값이 비어 있습니다.' },
        { status: 400 },
      );
    }
    const isTurnstileVerified = await verifyTurnstileToken(String(turnstileToken));

    if (!isTurnstileVerified) {
      return NextResponse.json({ message: '로봇 검증에 실패했습니다.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 },
      );
    }
    const registerdUser = await registerUser({ email, password, name });
    return NextResponse.json(registerdUser);
  } catch (error) {
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
