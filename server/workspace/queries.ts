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
          image: true,
        },
      },
    },
  });
}

export async function updateWorkspaceMemberRole(
  workspaceId: number,
  userId: string,
  role: 'OWNER' | 'MEMBER',
) {
  if (role !== 'OWNER' && role !== 'MEMBER') {
    throw new Error('Invalid role');
  }

  return prisma.$transaction(async (tx) => {
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
      throw new Error('Member not found');
    }

    if (membership.role === 'OWNER') {
      if (role === 'MEMBER') {
        const ownerCount = await tx.workspaceMember.count({
          where: {
            workspaceId,
            role: 'OWNER',
          },
        });

        if (ownerCount <= 1) {
          throw new Error('At least one OWNER must remain in this workspace');
        }
      }
    }
    return tx.workspaceMember.update({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      data: {
        role,
      },
    });
  });
}

export async function removeWorkspaceMember(
  workspaceId: number,
  userId: string,
) {
  return prisma.$transaction(async (tx) => {
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
      throw new Error('Member not found');
    }

    if (membership.role === 'OWNER') {
      const ownerCount = await tx.workspaceMember.count({
        where: {
          workspaceId,
          role: 'OWNER',
        },
      });

      if (ownerCount <= 1) {
        throw new Error('At least one OWNER must remain in this workspace');
      }
    }

    return tx.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });
  });
}

export async function deleteWorkspace(
  workspaceId: number,
  requesterId: string,
) {
  return prisma.$transaction(async (tx) => {
    const membership = await tx.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: requesterId,
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

    if (membership.role !== 'OWNER') {
      throw new Error('Only OWNER can delete workspace');
    }

    return tx.workspace.delete({
      where: {
        id: workspaceId,
      },
    });
  });
}
