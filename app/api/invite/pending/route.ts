// app/api/invites/pending/route.ts

import { getPendingInvitesByUserId } from '@/server/invite/queries';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const pending = await getPendingInvitesByUserId(userId);

    return NextResponse.json(pending, { status: 200 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: 'Failed to fetch pending invites' },
      { status: 500 },
    );
  }
}
