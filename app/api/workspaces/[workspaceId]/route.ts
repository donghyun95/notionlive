import { auth } from '@/lib/auth';
import { deleteWorkspace } from '@/server/workspace/queries';
import { NextResponse } from 'next/server';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const session = await auth();
    const requesterId = session?.user?.id;

    if (!requesterId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId: workspaceIdParam } = await params;
    const workspaceId = Number(workspaceIdParam);

    if (!Number.isInteger(workspaceId) || workspaceId < 1) {
      return NextResponse.json({ error: 'Invalid workspaceId' }, { status: 400 });
    }

    await deleteWorkspace(workspaceId, requesterId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const prismaCode =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
        ? (error as { code: string }).code
        : null;

    if (message === 'Not a workspace member') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message === 'Only OWNER can delete workspace') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (
      prismaCode === 'P2025' ||
      message.includes('Record to delete does not exist') ||
      message.includes('No Workspace found')
    ) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    console.error('DELETE /api/workspaces/[workspaceId] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 },
    );
  }
}
