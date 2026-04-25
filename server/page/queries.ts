import { prisma } from '@/lib/prisma';
import { Prisma, WorkspaceRole } from '@prisma/client';
import { randomUUID } from 'crypto';

export const getPagePublicInfo = async (pageId: number) => {
  return await prisma.page.findFirst({
    where: { id: pageId, deletedAt: null },
  });
};

export const togglePublishPage = async (pageId: number) => {
  const page = await getPagePublicInfo(pageId);

  if (!page) {
    throw new Error('페이지 없음');
  }

  const nextIsPublished = !page.ispublished;
  const nextPublicToken = page.publictoken ?? randomUUID();

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: {
      ispublished: nextIsPublished,
      publictoken: nextPublicToken,
    },
    select: {
      id: true,
      ispublished: true,
      publictoken: true,
    },
  });
  return updated;
};
export const findPageByPublicToken = async (token: string) => {
  const page = await prisma.page.findFirst({
    where: {
      publictoken: token,
      deletedAt: null,
    },
  });
  if (!page) {
    throw new Error('페이지 없음');
  }
  return page;
};

async function assertWorkspaceOwner(
  tx: Prisma.TransactionClient,
  workspaceId: number,
  userId: string,
) {
  const membership = await tx.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    throw new Error('Not a workspace member');
  }

  if (membership.role !== WorkspaceRole.OWNER) {
    throw new Error('Only OWNER can delete page');
  }
}

async function collectDescendantIds(
  tx: Prisma.TransactionClient,
  workspaceId: number,
  rootPageId: number,
): Promise<number[]> {
  const allIds: number[] = [rootPageId];
  let frontier: number[] = [rootPageId];

  while (frontier.length > 0) {
    const children = await tx.page.findMany({
      where: {
        workspaceId,
        parentId: { in: frontier },
        deletedAt: null,
      },
      select: { id: true },
    });

    frontier = children.map(({ id }) => id);

    if (frontier.length > 0) {
      allIds.push(...frontier);
    }
  }

  return allIds;
}

export async function softDeletePageWithDescendants(
  pageId: number,
  userId: string,
) {
  return prisma.$transaction(async (tx) => {
    const page = await tx.page.findFirst({
      where: {
        id: pageId,
        deletedAt: null,
      },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    if (!page) {
      throw new Error('Page not found');
    }

    await assertWorkspaceOwner(tx, page.workspaceId, userId);

    const targetIds = await collectDescendantIds(tx, page.workspaceId, page.id);
    const now = new Date();

    const updated = await tx.page.updateMany({
      where: {
        id: { in: targetIds },
        deletedAt: null,
      },
      data: {
        deletedAt: now,
        deletedBy: userId,
      },
    });

    return {
      pageId,
      deletedCount: updated.count,
    };
  });
}

export async function hardDeletePageWithDescendants(
  pageId: number,
  userId: string,
) {
  return prisma.$transaction(async (tx) => {
    const page = await tx.page.findFirst({
      where: {
        id: pageId,
        // deletedAt: null,
      },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    if (!page) {
      throw new Error('Page not found');
    }

    await assertWorkspaceOwner(tx, page.workspaceId, userId);

    const targetIds = await collectDescendantIds(tx, page.workspaceId, page.id);
    const deleted = await tx.page.deleteMany({
      where: {
        id: { in: targetIds },
      },
    });

    return {
      pageId,
      deletedCount: deleted.count,
    };
  });
}

export async function hardDeleteSinglePage(pageId: number, userId: string) {
  return prisma.$transaction(async (tx) => {
    const page = await tx.page.findFirst({
      where: {
        id: pageId,
      },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    if (!page) {
      throw new Error('Page not found');
    }

    await assertWorkspaceOwner(tx, page.workspaceId, userId);

    await tx.page.delete({
      where: {
        id: pageId,
      },
    });

    return {
      pageId,
      deleted: true,
    };
  });
}
