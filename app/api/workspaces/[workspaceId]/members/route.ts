// app/api/workspaces/[workspaceId]/members/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaceMembers } from '@/server/workspace/queries';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;
    const workspaceIdNum = Number(workspaceId);
    if (
      isNaN(workspaceIdNum) ||
      !Number.isInteger(workspaceIdNum) ||
      workspaceIdNum < 1
    ) {
      return NextResponse.json(
        { error: 'Invalid workspaceId' },
        { status: 400 },
      );
    }

    const members = await getWorkspaceMembers(workspaceIdNum);

    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    console.error('GET /api/workspaces/[workspaceId]/members error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch workspace members' },
      { status: 500 },
    );
  }
}
