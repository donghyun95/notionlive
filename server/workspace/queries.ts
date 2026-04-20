import { prisma } from '@/lib/prisma';

export async function getUserWorkspaceRole(
  userId: string,
  workspaceId: number,
) {
  const membership = await prisma.workspaceMember.findUnique({
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

  return membership.role;
}

export async function renameWorkspace(workspaceId: number, name: string) {
  return await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      name,
    },
  });
}

export async function getWorkspaceMembers(workspaceId: number) {
  return await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
    },
    select: {
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
