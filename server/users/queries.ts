import { prisma } from "@/lib/prisma";

export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function getSidebarData(userId: number) {
  // 1) 참여 워크스페이스 목록 (개인/팀 모두)
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: true,
    },
    orderBy: { joinedAt: "asc" },
  });

  // 2) PERSONAL 워크스페이스 찾기 (보통 1개라고 가정)
  const personalWorkspace = memberships
    .map((m) => m.workspace)
    .find((w) => w.type === "PERSONAL");

  const teamWorkspace = memberships
    .map((m) => m.workspace)
    .filter((w) => w.type === "TEAM");
  // 3) 개인 워크스페이스 루트 페이지만 (사이드바용)
  const personalRootPages = personalWorkspace
    ? await prisma.page.findMany({
        where: {
          workspaceId: personalWorkspace.id,
          parentId: null,
        },
        orderBy: { order: "asc" },
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
  console.log("RootPage", RootPage);
  return RootPage;
}

export async function getPagePartRooms(userId: number, pageId: number) {
  return prisma.pagePart.findMany({
    where: {
      pageId,
      page: {
        workspace: {
          members: {
            some: { userId },
          },
        },
      },
    },
    select: {
      id: true,
      partNo: true,
      roomId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
