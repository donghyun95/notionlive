// app/api/invites/pending/route.ts

import { getPendingInvitesByUserId } from '@/server/invite/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'userId is required' },
        { status: 400 },
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
