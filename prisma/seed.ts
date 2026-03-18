import { PrismaClient, WorkspaceType, WorkspaceRole } from '@prisma/client';
import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

async function main() {
  console.log('🌱 seed start');

  // 유저 생성
  const owner = await prisma.user.create({
    data: {
      email: 'owner@example.com',
      password: 'hashed-password-owner',
      name: 'Owner Kim',
      image: 'https://example.com/images/owner.png',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: 'hashed-password-admin',
      name: 'Admin Lee',
      image: 'https://example.com/images/admin.png',
    },
  });

  const member = await prisma.user.create({
    data: {
      email: 'member@example.com',
      password: 'hashed-password-member',
      name: 'Member Park',
      image: 'https://example.com/images/member.png',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@example.com',
      password: 'hashed-password-viewer',
      name: 'Viewer Choi',
      image: 'https://example.com/images/viewer.png',
    },
  });

  // 워크스페이스 생성
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Team Workspace',
      type: WorkspaceType.TEAM,
    },
  });

  // 워크스페이스 멤버 생성
  await prisma.workspaceMember.createMany({
    data: [
      {
        userId: owner.id,
        workspaceId: workspace.id,
        role: WorkspaceRole.OWNER,
      },
      {
        userId: admin.id,
        workspaceId: workspace.id,
        role: WorkspaceRole.ADMIN,
      },
      {
        userId: member.id,
        workspaceId: workspace.id,
        role: WorkspaceRole.MEMBER,
      },
      {
        userId: viewer.id,
        workspaceId: workspace.id,
        role: WorkspaceRole.VIEWER,
      },
    ],
  });

  // 루트 페이지 생성 (depth 1)
  const rootPage = await createPageWithSnapshot({
    workspaceId: workspace.id,
    authorId: owner.id,
    parentId: null,
    title: 'Workspace Home',
    icon: '🏠',
    order: 0,
    depth: 1,
  });

  // parentId가 실제로 이어지는 depth 6 체인 생성
  // depth 1: rootPage
  // depth 2~6까지 생성
  let currentParentId = rootPage.id;

  for (let depth = 2; depth <= 6; depth++) {
    const page = await createPageWithSnapshot({
      workspaceId: workspace.id,
      authorId: owner.id,
      parentId: currentParentId,
      title: `Depth ${depth} Page`,
      icon: '📄',
      order: 0,
      depth,
    });

    currentParentId = page.id;
  }

  // 루트 아래 형제 페이지들
  const docsPage = await createPageWithSnapshot({
    workspaceId: workspace.id,
    authorId: admin.id,
    parentId: rootPage.id,
    title: 'Team Docs',
    icon: '📚',
    order: 1,
    depth: 2,
  });

  const roadmapPage = await createPageWithSnapshot({
    workspaceId: workspace.id,
    authorId: member.id,
    parentId: rootPage.id,
    title: 'Product Roadmap',
    icon: '🗺️',
    order: 2,
    depth: 2,
  });

  // Team Docs 하위 페이지
  await createPageWithSnapshot({
    workspaceId: workspace.id,
    authorId: admin.id,
    parentId: docsPage.id,
    title: 'Backend Guide',
    icon: '🖥️',
    order: 0,
    depth: 3,
  });

  await createPageWithSnapshot({
    workspaceId: workspace.id,
    authorId: admin.id,
    parentId: docsPage.id,
    title: 'Design Guide',
    icon: '🎨',
    order: 1,
    depth: 3,
  });

  // Product Roadmap 하위 페이지
  await createPageWithSnapshot({
    workspaceId: workspace.id,
    authorId: member.id,
    parentId: roadmapPage.id,
    title: 'Q1 Goals',
    icon: '1️⃣',
    order: 0,
    depth: 3,
  });

  await createPageWithSnapshot({
    workspaceId: workspace.id,
    authorId: member.id,
    parentId: roadmapPage.id,
    title: 'Q2 Goals',
    icon: '2️⃣',
    order: 1,
    depth: 3,
  });

  console.log('✅ seed complete');
  console.log(`workspaceId: ${workspace.id}`);
  console.log(`ownerId: ${owner.id}`);
}

async function createPageWithSnapshot(params: {
  workspaceId: number;
  authorId: string;
  parentId: number | null;
  title: string;
  icon?: string;
  order: number;
  depth: number;
}) {
  const { workspaceId, authorId, parentId, title, icon, order, depth } = params;

  const page = await prisma.page.create({
    data: {
      workspaceId,
      authorId,
      parentId,
      title,
      icon,
      order,
    },
  });

  await prisma.pageSnapshot.create({
    data: {
      pageId: page.id,
      version: 1,
      contentJson: buildSnapshotContent(title, depth),
    },
  });

  return page;
}

function buildSnapshotContent(title: string, depth: number) {
  return {
    type: 'doc',
    meta: {
      title,
      depth,
    },
    content: [
      {
        type: 'heading',
        attrs: {
          level: Math.min(depth, 6),
        },
        content: [
          {
            type: 'text',
            text: title,
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: `${title} 페이지의 샘플 본문입니다. 현재 depth는 ${depth}입니다.`,
          },
        ],
      },
    ],
  };
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ seed error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
