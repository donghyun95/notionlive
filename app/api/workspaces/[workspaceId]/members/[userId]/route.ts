import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getWorkspaceMembership } from '@/server/common/queries';
import { removeWorkspaceMember } from '@/server/workspace/queries';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; userId: string }> },
) {
  try {
    const session = await auth();
    const requesterId = session?.user?.id;

    if (!requesterId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId: workspaceIdParam, userId } = await params;
    const workspaceId = Number(workspaceIdParam);

    if (!Number.isInteger(workspaceId) || workspaceId < 1 || !userId) {
      return NextResponse.json(
        { error: 'Invalid workspaceId or userId' },
        { status: 400 },
      );
    }

    const requesterMembership = await getWorkspaceMembership(
      requesterId,
      workspaceId,
    );

    if (requesterMembership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only OWNER can remove members' },
        { status: 403 },
      );
    }

    await removeWorkspaceMember(workspaceId, userId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'Member not found') {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    if (message === 'At least one OWNER must remain in this workspace') {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (message === 'Not a workspace member') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    console.error(
      'DELETE /api/workspaces/[workspaceId]/members/[userId] error:',
      error,
    );
    return NextResponse.json(
      { error: 'Failed to remove workspace member' },
      { status: 500 },
    );
  }
}
