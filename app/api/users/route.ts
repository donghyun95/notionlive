import { NextResponse } from 'next/server';
import { getUsers, getSidebarData, registerUser } from '@/server/users/queries';
import { auth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { userId: string; parentId: string } },
) {
  const { searchParams } = new URL(request.url);

  const userId = searchParams.get('userId');

  const users = await getSidebarData(Number(userId));

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: '필수값이 비어 있습니다.' },
        { status: 400 },
      );
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
