import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { createId } from '@paralleldrive/cuid2';
import { WorkspaceType, WorkspaceRole } from '@prisma/client';
import { generatePremiumHexColor } from '@/lib/common';

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
  const color = generatePremiumHexColor();
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        image: `https://api.dicebear.com/9.x/pixel-art/svg?seed=TeamSpace-${randomImageSeed}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9`,
        color,
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
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: true,
    },
    orderBy: { joinedAt: 'asc' },
  });

  const allWorkspaces = memberships.map(({ workspace }) => workspace);

  const personalWorkspace = allWorkspaces.find(
    (workspace) => workspace.type === 'PERSONAL',
  );

  const teamWorkspaces = allWorkspaces.filter(
    (workspace) => workspace.type === 'TEAM',
  );

  let personal = null;
  if (personalWorkspace) {
    const rootPages = await prisma.page.findMany({
      where: {
        workspaceId: personalWorkspace.id,
        parentId: null,
        deletedAt: null,
      },
      orderBy: { order: 'asc' },
    });

    personal = {
      ...personalWorkspace,
      rootPages,
    };
  }

  const workspaces = await Promise.all(
    teamWorkspaces.map(async (workspace) => {
      const rootPages = await prisma.page.findMany({
        where: {
          workspaceId: workspace.id,
          parentId: null,
          deletedAt: null,
        },
        orderBy: { order: 'asc' },
      });

      return {
        ...workspace,
        rootPages,
      };
    }),
  );

  return {
    workspaces,
    personal,
  };
}

export async function getChildrenPageByParentsId(parentId: number) {
  const ChildrenPage = await prisma.page.findMany({
    where: {
      parentId,
      deletedAt: null,
    },
  });
  return ChildrenPage;
}

export async function getWorkSpacePageByWorkSpaceId(workspaceId: number) {
  const RootPage = await prisma.page.findMany({
    where: { workspaceId, parentId: null, deletedAt: null },
  });
  return RootPage;
}

export async function getSoftDeletedPagesInPersonalWorkspace(userId: string) {
  const personalMembership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspace: {
        type: WorkspaceType.PERSONAL,
      },
    },
    select: {
      workspaceId: true,
    },
  });

  if (!personalMembership) {
    throw new Error('PERSONAL_WORKSPACE_NOT_FOUND');
  }

  return prisma.page.findMany({
    where: {
      workspaceId: personalMembership.workspaceId,
      deletedAt: {
        not: null,
      },
    },
    orderBy: {
      deletedAt: 'desc',
    },
  });
}

export async function getPagePartRooms(userId: string, pageId: number) {
  return prisma.page.findMany({
    where: {
      id: pageId,
      deletedAt: null,
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

// {
//   "id": 7,
//   "workspaceId": 1,
//   "parentId": 1,
//   "authorId": "cmmw4fkw90001ksv6adni91id",
//   "title": "Team Docs",
//   "icon": "📚",
//   "order": 1,
//   "createdAt": "2026-03-18T14:13:05.000Z",
//   "updatedAt": "2026-03-18T14:13:05.000Z",

//   "children": [
//     {
//       "id": 9,
//       "workspaceId": 1,
//       "parentId": 7,
//       "authorId": "cmmw4fkw90001ksv6adni91id",
//       "title": "Backend Guide"
//     },
//     {
//       "id": 10,
//       "workspaceId": 1,
//       "parentId": 7,
//       "authorId": "cmmw4fkw90001ksv6adni91id",
//       "title": "Design Guide"
//     }
//   ]
// }

export async function getSelfandChildren(userId: string, pageId: number) {
  const self = await prisma.page.findFirst({
    where: {
      id: pageId,
      deletedAt: null,
      workspace: {
        members: {
          some: { userId },
        },
      },
    },
  });

  const children = await prisma.page.findMany({
    where: {
      parentId: pageId,
      deletedAt: null,
      workspace: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });
  const page = await prisma.page.findFirst({
    where: { id: pageId, deletedAt: null },
    select: { workspaceId: true },
  });

  if (!page) {
    throw new Error('페이지 없음');
  }
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId: page.workspaceId,
      },
    },
    select: {
      role: true,
    },
  });

  const role = membership?.role;
  return { self, children, role };
}

type PageInfo = {
  id: number;
  workspaceId: number;
  authorId: string | null;
  ispublished: boolean;
  publictoken: string | null;
};

type PageAccessResult = {
  exists: boolean;
  hasAccess: boolean;
  role: WorkspaceRole | null;
  page: PageInfo | null;
};

export async function getUserPageAccess(
  userId: string | null | undefined,
  pageId: number,
): Promise<PageAccessResult> {
  const page = await prisma.page.findFirst({
    where: { id: pageId, deletedAt: null },
    select: {
      id: true,
      workspaceId: true,
      authorId: true,
      ispublished: true,
      publictoken: true,
    },
  });

  if (!page) {
    return {
      exists: false,
      hasAccess: false,
      role: null,
      page: null,
    };
  }

  const pageInfo: PageInfo = {
    id: page.id,
    workspaceId: page.workspaceId,
    authorId: page.authorId,
    ispublished: page.ispublished,
    publictoken: page.publictoken,
  };
  if (!userId) {
    return {
      exists: true,
      hasAccess: false,
      role: null,
      page: pageInfo,
    };
  }
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId: page.workspaceId,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    return {
      exists: true,
      hasAccess: false,
      role: null,
      page: pageInfo,
    };
  }

  return {
    exists: true,
    hasAccess: true,
    role: membership.role,
    page: pageInfo,
  };
}

export async function assertPagePublished(pageId: number) {
  const page = await prisma.page.findFirst({
    where: { id: pageId, deletedAt: null },
    select: {
      id: true,
      ispublished: true,
    },
  });

  if (!page) {
    throw new Error('Page not found');
  }

  if (!page.ispublished) {
    throw new Error('Page is not published');
  }

  return page;
}
export async function getUserPersonalRootPages(userId: string) {
  const personalWorkspace = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspace: {
        type: 'PERSONAL',
      },
    },
    select: {
      workspace: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!personalWorkspace) {
    return [];
  }

  const rootPages = await prisma.page.findMany({
    where: {
      workspaceId: personalWorkspace.workspace.id,
      parentId: null,
      deletedAt: null,
    },
    orderBy: {
      order: 'asc',
    },
  });

  return rootPages;
}

export async function initializeUserByEmail(email: string) {
  const color = generatePremiumHexColor();

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('해당 이메일의 유저를 찾을 수 없습니다.');
    }

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: { color },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: `${user.name ?? user.email}'s Personal WorkSpace`,
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
        parentId: null,
        title: 'UnTitled',
        order: 0,
      },
    });

    return {
      user: updatedUser,
      workspace,
      page,
    };
  });
}
