import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { createId } from '@paralleldrive/cuid2';
import { auth } from '@/lib/auth';
import { WorkspaceType, WorkspaceRole } from '@prisma/client';
export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });
}

type RegisterUserInput = {
  email: string;
  password: string;
  name?: string;
};

export async function registerUser({
  email,
  password,
  name,
}: RegisterUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('이미 가입된 이메일입니다.');
  }
  const randomImageSeed = createId();
  const hashedPassword = await hashPassword(password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        image: `https://api.dicebear.com/9.x/pixel-art/svg?seed=TeamSpace-${randomImageSeed}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: `${name}'s Personal WorkSpace`,
        type: WorkspaceType.PERSONAL,
      },
    });
    await tx.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: WorkspaceRole.OWNER,
      },
    });
    const page = await tx.page.create({
      data: {
        workspaceId: workspace.id,
        authorId: user.id,
        title: 'UnTitled',
        order: 0,
      },
    });
    return {
      user,
      workspace,
      page,
    };
  });
}

export async function getSidebarData(userId: string) {
  // 1) 참여 워크스페이스 목록 (개인/팀 모두)
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: true,
    },
    orderBy: { joinedAt: 'asc' },
  });

  // 2) PERSONAL 워크스페이스 찾기 (보통 1개라고 가정)
  const personalWorkspace = memberships
    .map((m) => m.workspace)
    .find((w) => w.type === 'PERSONAL');

  const teamWorkspace = memberships
    .map((m) => m.workspace)
    .filter((w) => w.type === 'TEAM');
  // 3) 개인 워크스페이스 루트 페이지만 (사이드바용)
  const personalRootPages = personalWorkspace
    ? await prisma.page.findMany({
        where: {
          workspaceId: personalWorkspace.id,
          parentId: null,
        },
        orderBy: { order: 'asc' },
      })
    : [];
  return {
    workspaces: teamWorkspace,
    personal: personalWorkspace
      ? { workspace: personalWorkspace, rootPages: personalRootPages }
      : null,
  };
}

export async function getChildrenPageByParentsId(parentId: number) {
  const ChildrenPage = await prisma.page.findMany({
    where: {
      parentId,
    },
  });
  return ChildrenPage;
}

export async function getWorkSpacePageByWorkSpaceId(workspaceId: number) {
  const RootPage = await prisma.page.findMany({
    where: { workspaceId, parentId: null },
  });
  console.log('RootPage', RootPage);
  return RootPage;
}

export async function getPagePartRooms(userId: string, pageId: number) {
  return prisma.page.findMany({
    where: {
      id: pageId,

      workspace: {
        members: {
          some: { userId },
        },
      },
    },
    select: {
      id: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}
