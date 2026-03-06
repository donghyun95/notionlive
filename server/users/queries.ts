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
    workspaces: memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      type: m.workspace.type,
      role: m.role,
      createdAt: m.workspace.createdAt,
      updatedAt: m.workspace.updatedAt,
    })),
    personal: personalWorkspace
      ? { workspace: personalWorkspace, rootPages: personalRootPages }
      : null,
  };
}

export async function getChildrenPageByParentsId(id: number) {
  const ChildrenPage = await prisma.page.findMany({
    where: {
      parentId: id,
    },
  });
  return ChildrenPage;
}
