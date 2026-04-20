import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteWorkspace } from '@/server/workspace/queries';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId: workspaceIdParam } = await params;
    const workspaceId = Number(workspaceIdParam);

    if (!Number.isInteger(workspaceId) || workspaceId < 1) {
      return NextResponse.json({ error: 'Invalid workspaceId' }, { status: 400 });
    }

    await deleteWorkspace(workspaceId, userId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'Only OWNER can delete workspace') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message === 'Not a workspace member') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    console.error('DELETE /api/workspaces/[workspaceId] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 },
    );
  }
}
