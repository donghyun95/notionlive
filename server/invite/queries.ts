import { prisma } from '@/lib/prisma';

export async function inviteUser({
  workspaceId,
  inviterId,
  inviteeUserId,
  role,
}: {
  workspaceId: number;
  inviterId: string;
  inviteeUserId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}) {
  // 1) 초대자 멤버십 확인
  const inviterMembership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: inviterId,
        workspaceId,
      },
    },
  });

  if (!inviterMembership) {
    throw new Error('워크스페이스 멤버가 아닙니다.');
  }

  if (!['OWNER', 'ADMIN'].includes(inviterMembership.role)) {
    throw new Error('초대 권한이 없습니다.');
  }

  // 2) 자기 자신 초대 방지
  if (inviterId === inviteeUserId) {
    throw new Error('자기 자신은 초대할 수 없습니다.');
  }

  // 3) 이미 멤버인지 확인
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: inviteeUserId,
        workspaceId,
      },
    },
  });

  if (existingMember) {
    throw new Error('이미 워크스페이스 멤버입니다.');
  }

  // 4) 대기중 초대 확인
  const existingInvite = await prisma.workspaceInvite.findFirst({
    where: {
      workspaceId,
      inviteeUserId,
      status: 'PENDING',
    },
  });

  if (existingInvite) {
    throw new Error('이미 대기 중인 초대가 있습니다.');
  }

  // 5) 초대 생성
  return prisma.workspaceInvite.create({
    data: {
      workspaceId,
      inviterId,
      inviteeUserId,
      role,
      status: 'PENDING',
    },
  });
}

async function getMyInvites(userId: string) {
  return prisma.workspaceInvite.findMany({
    where: {
      inviteeUserId: userId,
      status: 'PENDING',
    },
    include: {
      workspace: true,
      inviter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function acceptInvite(inviteId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    // 1. 아직 PENDING인 내 초대만 ACCEPTED로 바꿈
    const updated = await tx.workspaceInvite.updateMany({
      where: {
        id: inviteId,
        inviteeUserId: userId,
        status: 'PENDING',
      },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });

    // 이미 다른 요청이 처리했으면 여기서 막힘
    if (updated.count === 0) {
      throw new Error('이미 처리된 초대이거나 권한이 없습니다.');
    }

    // 2. invite 정보 다시 읽기
    const invite = await tx.workspaceInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new Error('초대를 찾을 수 없습니다.');
    }

    // 3. 멤버 추가
    await tx.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: invite.workspaceId,
        },
      },
      update: {},
      create: {
        userId,
        workspaceId: invite.workspaceId,
        role: invite.role,
      },
    });

    return { success: true };
  });
}

export async function declineInvite(inviteId: string, userId: string) {
  const updated = await prisma.workspaceInvite.updateMany({
    where: {
      id: inviteId,
      inviteeUserId: userId,
      status: 'PENDING',
    },
    data: {
      status: 'DECLINED',
      respondedAt: new Date(),
    },
  });

  if (updated.count === 0) {
    throw new Error('이미 처리된 초대이거나 권한이 없습니다.');
  }

  return { success: true };
}

export async function searchUsersByEmailPrefix(
  keyword: string,
  workspaceId: number,
) {
  const q = keyword.trim();

  if (q.length < 2) {
    return [];
  }
  console.log(workspaceId);
  return await prisma.user.findMany({
    where: {
      email: {
        startsWith: q,
        mode: 'insensitive',
      },
      memberships: {
        none: {
          workspaceId,
        },
      },
      receivedWorkspaceInvites: {
        none: {
          workspaceId,
          status: 'PENDING',
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
    orderBy: {
      email: 'asc',
    },
    take: 10,
  });
}
export async function getPendingInvitesByUserId(userId: string) {
  return prisma.workspaceInvite.findMany({
    where: {
      inviteeUserId: userId,
      status: 'PENDING',
    },
    include: {
      workspace: true,
      inviter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
