import { auth } from '@/lib/auth';
import { getWorkspaceMembership } from '@/server/common/queries';
import { updateWorkspaceMemberRole } from '@/server/workspace/queries';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ workspaceId: string; userId: string }>;
  },
) {
  try {
    const { workspaceId: workspaceIdParam, userId } = await params;
    const workspaceId = Number(workspaceIdParam);

    if (!Number.isFinite(workspaceId) || !userId) {
      return NextResponse.json({ error: 'invalid params' }, { status: 400 });
    }

    const result = await getWorkspaceMembership(userId, workspaceId);

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to get user role' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ workspaceId: string; userId: string }>;
  },
) {
  try {
    const session = await auth();
    const requesterId = session?.user?.id;

    if (!requesterId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId: workspaceIdParam, userId } = await params;
    const workspaceId = Number(workspaceIdParam);
    const { role } = (await req.json()) as { role?: string };

    if (!Number.isInteger(workspaceId) || workspaceId < 1 || !userId) {
      return NextResponse.json({ error: 'invalid params' }, { status: 400 });
    }

    if (role !== 'OWNER' && role !== 'MEMBER') {
      return NextResponse.json(
        { error: 'Role must be OWNER or MEMBER' },
        { status: 400 },
      );
    }

    const requesterMembership = await getWorkspaceMembership(
      requesterId,
      workspaceId,
    );

    if (requesterMembership.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only OWNER can update member role' },
        { status: 403 },
      );
    }

    await updateWorkspaceMemberRole(workspaceId, userId, role);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';

    if (message === 'Member not found') {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    if (message === 'Not a workspace member') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    if (message === 'At least one OWNER must remain in this workspace') {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error(e);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 },
    );
  }
}
