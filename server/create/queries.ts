import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { createId } from '@paralleldrive/cuid2';
import { WorkspaceType, WorkspaceRole } from '@prisma/client';

export async function createPage(userID: string, parentID: number | null) {
  return await prisma.$transaction(async (tx) => {
    // 1) 유저 확인
    const user = await tx.user.findUnique({
      where: { id: userID },
      select: { id: true },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // 2) 유저의 PERSONAL 워크스페이스 찾기
    const membership = await tx.workspaceMember.findFirst({
      where: {
        userId: userID,
        workspace: {
          type: 'PERSONAL',
        },
      },
      select: {
        workspace: {
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
      },
    });

    if (!membership?.workspace) {
      throw new Error('PERSONAL_WORKSPACE_NOT_FOUND');
    }

    const workspace = membership.workspace;

    // 3) parentID가 있으면 부모 페이지 검증
    if (parentID !== null) {
      const parentPage = await tx.page.findFirst({
        where: {
          id: parentID,
          workspaceId: workspace.id,
          deletedAt: null,
        },
        select: {
          id: true,
          workspaceId: true,
        },
      });

      if (!parentPage) {
        throw new Error('PARENT_PAGE_NOT_FOUND');
      }
    }

    // 4) 같은 부모 아래 마지막 order 계산
    const lastSibling = await tx.page.findFirst({
      where: {
        workspaceId: workspace.id,
        parentId: parentID,
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    });

    const nextOrder = (lastSibling?.order ?? -1) + 1;

    // 5) 페이지 생성
    const page = await tx.page.create({
      data: {
        workspaceId: workspace.id,
        parentId: parentID,
        authorId: userID,
        title: 'Untitled',
        order: nextOrder,
      },
    });

    return page;
  });
}

export async function getPageAncestorPath(
  userId: string,
  pageId: number,
): Promise<{}> {
  const path = [];

  let current = await prisma.page.findFirst({
    where: {
      id: pageId,
      deletedAt: null,
      workspace: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      parentId: true,
      workspaceId: true,
      order: true,
    },
  });
  const workspaceID = current?.workspaceId;
  if (!current) {
    throw new Error('PAGE_NOT_FOUND_OR_DELETED');
  }

  while (current.parentId !== null) {
    current = await prisma.page.findFirst({
      where: {
        id: current.parentId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        parentId: true,
        workspaceId: true,
        order: true,
      },
    });

    if (!current) {
      throw new Error('PAGE_NOT_FOUND_OR_DELETED');
    }

    path.push(current.id);
  }

  return { path, workspaceID };
}

export async function updateTitle(pageId: number, value: string) {
  try {
    return await prisma.page.update({
      where: { id: pageId },
      data: { title: value },
    });
  } catch (e) {
    console.error(e);
    throw new Error('페이지 업데이트 실패');
  }
}

export async function updateIcon(pageId: number, value: string) {
  try {
    return await prisma.page.update({
      where: { id: pageId },
      data: { icon: value },
    });
  } catch (e) {
    console.error(e);
    throw new Error('페이지 업데이트 실패');
  }
}

export async function createWorkSpacePage(
  userID: string,
  workspaceID: number,
  parentID: number | null,
) {
  return await prisma.$transaction(async (tx) => {
    const membership = await tx.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userID,
          workspaceId: workspaceID,
        },
      },
      select: {
        role: true,
      },
    });

    if (!membership) {
      throw new Error('WORKSPACE_NOT_FOUND_OR_NO_ACCESS');
    }

    if (membership.role === WorkspaceRole.VIEWER) {
      throw new Error('FORBIDDEN');
    }

    if (parentID !== null) {
      const parentPage = await tx.page.findFirst({
        where: {
          id: parentID,
          workspaceId: workspaceID,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!parentPage) {
        throw new Error('PARENT_PAGE_NOT_FOUND');
      }
    }

    const lastSibling = await tx.page.findFirst({
      where: {
        workspaceId: workspaceID,
        parentId: parentID,
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    });

    const nextOrder = (lastSibling?.order ?? -1) + 1;

    const page = await tx.page.create({
      data: {
        workspaceId: workspaceID,
        parentId: parentID,
        authorId: userID,
        title: 'Untitled',
        order: nextOrder,
      },
    });

    return page;
  });
}

export async function createWorkSpace(userID: string) {
  return await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: 'My Workspace',
        type: 'TEAM',
      },
    });

    await tx.workspaceMember.create({
      data: {
        userId: userID,
        workspaceId: workspace.id,
        role: 'OWNER',
      },
    });

    return workspace;
  });
}
