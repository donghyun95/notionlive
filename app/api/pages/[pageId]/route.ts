import { NextRequest, NextResponse } from 'next/server';
import { getSelfandChildren } from '@/server/users/queries';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWorkspaceMembership } from '@/server/common/queries';

type RouteContext = {
  params: Promise<{
    pageId: string;
  }>;
};

type PageAction = 'soft-delete' | 'restore' | 'purge';

async function collectDescendantPageIds(pageId: number) {
  const descendantIds: number[] = [];
  let frontier = [pageId];

  while (frontier.length > 0) {
    const children = await prisma.page.findMany({
      where: {
        parentId: {
          in: frontier,
        },
      },
      select: {
        id: true,
      },
    });

    const childIds = children.map((child) => child.id);

    if (childIds.length === 0) {
      break;
    }

    descendantIds.push(...childIds);
    frontier = childIds;
  }

  return descendantIds;
}

async function handlePageTreeMutation(
  pageId: number,
  action: PageAction,
  requesterId: string,
) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      id: true,
      workspaceId: true,
      parentId: true,
      deletedAt: true,
    },
  });

  if (!page) {
    return NextResponse.json({ error: 'PAGE_NOT_FOUND' }, { status: 404 });
  }

  const membership = await getWorkspaceMembership(requesterId, page.workspaceId);

  if (membership.role === 'VIEWER') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  if (action === 'purge' && membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  if (action === 'restore' && page.parentId) {
    const parent = await prisma.page.findUnique({
      where: { id: page.parentId },
      select: { deletedAt: true },
    });

    if (parent?.deletedAt) {
      return NextResponse.json(
        { error: 'PARENT_SOFT_DELETED_RESTORE_BLOCKED' },
        { status: 409 },
      );
    }
  }

  const descendantIds = await collectDescendantPageIds(page.id);
  const pageIds = [page.id, ...descendantIds];

  if (action === 'purge') {
    await prisma.page.deleteMany({
      where: {
        id: {
          in: pageIds,
        },
      },
    });

    return NextResponse.json({
      action,
      pageId: page.id,
      affectedCount: pageIds.length,
    });
  }

  const deletedAt = action === 'soft-delete' ? new Date() : null;
  const deletedBy = action === 'soft-delete' ? requesterId : null;

  const result = await prisma.page.updateMany({
    where: {
      id: {
        in: pageIds,
      },
    },
    data: {
      deletedAt,
      deletedBy,
    },
  });

  return NextResponse.json({
    action,
    pageId: page.id,
    affectedCount: result.count,
  });
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 400 });
    }
    const userId = session.user?.id;
    const { pageId } = await params;
    const pageid = Number(pageId);

    if (!pageId || !Number.isFinite(pageid)) {
      return new NextResponse(null, { status: 400 });
    }

    if (userId) {
      const result = await getSelfandChildren(userId, pageid);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    const requesterId = session?.user?.id;

    if (!requesterId) {
      return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 401 });
    }

    const { pageId } = await params;
    const pageIdNumber = Number(pageId);

    if (!Number.isInteger(pageIdNumber) || pageIdNumber < 1) {
      return NextResponse.json({ error: 'INVALID_PAGE_ID' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action as PageAction | undefined;

    if (action !== 'soft-delete' && action !== 'restore' && action !== 'purge') {
      return NextResponse.json({ error: 'INVALID_ACTION' }, { status: 400 });
    }

    return await handlePageTreeMutation(pageIdNumber, action, requesterId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'Not a workspace member') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    const requesterId = session?.user?.id;

    if (!requesterId) {
      return NextResponse.json({ error: 'LOGIN_REQUIRED' }, { status: 401 });
    }

    const { pageId } = await params;
    const pageIdNumber = Number(pageId);

    if (!Number.isInteger(pageIdNumber) || pageIdNumber < 1) {
      return NextResponse.json({ error: 'INVALID_PAGE_ID' }, { status: 400 });
    }

    const purge = req.nextUrl.searchParams.get('purge') === 'true';
    const action: PageAction = purge ? 'purge' : 'soft-delete';

    return await handlePageTreeMutation(pageIdNumber, action, requesterId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'Not a workspace member') {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
