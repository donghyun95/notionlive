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
