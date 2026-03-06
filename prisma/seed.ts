import "dotenv/config";
import { PrismaClient, WorkspaceRole, WorkspaceType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

/**
 * workspaceId + parentId + title 조합으로 "논리적 유니크" 취급.
 * (DB에 유니크가 없으니 seed에서 강제)
 */
async function getOrCreatePage(params: {
  workspaceId: number;
  parentId: number | null;
  title: string;
  order?: number;
  authorId: number | null;
}) {
  const { workspaceId, parentId, title, order = 0, authorId } = params;

  const existing = await prisma.page.findFirst({
    where: { workspaceId, parentId, title },
  });

  if (!existing) {
    return prisma.page.create({
      data: { workspaceId, parentId, title, order, authorId },
    });
  }

  // seed 재실행 시에도 값이 기대 상태로 유지되도록 update로 맞춰줌
  return prisma.page.update({
    where: { id: existing.id },
    data: { order, authorId },
  });
}

/**
 * PERSONAL workspace를 "유저당 1개"로 운용한다는 전제:
 * - type=PERSONAL
 * - members에 (userId, role=OWNER)가 존재
 */
async function getOrCreatePersonalWorkspace(params: {
  userId: number;
  name: string;
}) {
  const { userId, name } = params;

  const existing = await prisma.workspace.findFirst({
    where: {
      type: WorkspaceType.PERSONAL,
      members: { some: { userId, role: WorkspaceRole.OWNER } },
    },
  });

  if (!existing) {
    return prisma.workspace.create({
      data: {
        name,
        type: WorkspaceType.PERSONAL,
        members: { create: { userId, role: WorkspaceRole.OWNER } },
      },
    });
  }

  return prisma.workspace.update({
    where: { id: existing.id },
    data: { name }, // 이름도 seed 기준으로 맞춰줌
  });
}

/**
 * TEAM workspace를 idempotent하게 만드는 "현실적" 기준:
 * - type=TEAM
 * - name 일치
 * - owner(여기서는 alice)가 OWNER로 속해있음
 *
 * 진짜로 강하게 보장하려면 DB에 유니크 키를 추가하는 게 정석.
 */
async function getOrCreateTeamWorkspace(params: {
  ownerUserId: number;
  name: string;
}) {
  const { ownerUserId, name } = params;

  const existing = await prisma.workspace.findFirst({
    where: {
      type: WorkspaceType.TEAM,
      name,
      members: { some: { userId: ownerUserId, role: WorkspaceRole.OWNER } },
    },
  });

  if (!existing) {
    return prisma.workspace.create({
      data: { name, type: WorkspaceType.TEAM },
    });
  }

  return prisma.workspace.update({
    where: { id: existing.id },
    data: { name },
  });
}

async function ensureMembership(params: {
  userId: number;
  workspaceId: number;
  role: WorkspaceRole;
}) {
  const { userId, workspaceId, role } = params;

  // WorkspaceMember는 @@id([userId, workspaceId])라 createMany + skipDuplicates가 안전
  await prisma.workspaceMember.createMany({
    data: [{ userId, workspaceId, role }],
    skipDuplicates: true,
  });

  // role이 바뀌었을 수 있으니 seed 기준으로 맞춰줌
  await prisma.workspaceMember.update({
    where: { userId_workspaceId: { userId, workspaceId } },
    data: { role },
  });
}

async function main() {
  console.log("🌱 Seeding (idempotent)...");

  // --------------------
  // Users (idempotent)
  // --------------------
  const alice = await prisma.user.upsert({
    where: { email: "alice@test.com" },
    update: { name: "Alice" },
    create: { email: "alice@test.com", name: "Alice" },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@test.com" },
    update: { name: "Bob" },
    create: { email: "bob@test.com", name: "Bob" },
  });

  // --------------------
  // Personal Workspace (Alice) (idempotent)
  // --------------------
  const personalWs = await getOrCreatePersonalWorkspace({
    userId: alice.id,
    name: "Alice Personal",
  });

  // (개인 워크스페이스 멤버십은 create에서 같이 만들지만, role 보정용으로 한 번 더 확실히)
  await ensureMembership({
    userId: alice.id,
    workspaceId: personalWs.id,
    role: WorkspaceRole.OWNER,
  });

  // --------------------
  // Team Workspace (idempotent)
  // --------------------
  const teamWs = await getOrCreateTeamWorkspace({
    ownerUserId: alice.id,
    name: "Frontend Team",
  });

  // memberships (idempotent)
  await ensureMembership({
    userId: alice.id,
    workspaceId: teamWs.id,
    role: WorkspaceRole.OWNER,
  });

  await ensureMembership({
    userId: bob.id,
    workspaceId: teamWs.id,
    role: WorkspaceRole.MEMBER,
  });

  // --------------------
  // Pages (Team Tree) (idempotent)
  // --------------------
  const teamRoot = await getOrCreatePage({
    workspaceId: teamWs.id,
    parentId: null,
    title: "Project Docs",
    order: 0,
    authorId: alice.id,
  });

  const apiSpec = await getOrCreatePage({
    workspaceId: teamWs.id,
    parentId: teamRoot.id,
    title: "API Spec",
    order: 0,
    authorId: alice.id,
  });

  await getOrCreatePage({
    workspaceId: teamWs.id,
    parentId: teamRoot.id,
    title: "UI Planning",
    order: 1,
    authorId: bob.id,
  });

  await getOrCreatePage({
    workspaceId: teamWs.id,
    parentId: apiSpec.id,
    title: "Auth Flow",
    order: 0,
    authorId: alice.id,
  });

  // --------------------
  // Pages (Personal Tree) - root + 3 depth (idempotent)
  // --------------------
  const pRoot = await getOrCreatePage({
    workspaceId: personalWs.id,
    parentId: null,
    title: "Home",
    order: 0,
    authorId: alice.id,
  });

  // depth 1
  const pDaily = await getOrCreatePage({
    workspaceId: personalWs.id,
    parentId: pRoot.id,
    title: "Daily Notes",
    order: 0,
    authorId: alice.id,
  });

  const pProjects = await getOrCreatePage({
    workspaceId: personalWs.id,
    parentId: pRoot.id,
    title: "Personal Projects",
    order: 1,
    authorId: alice.id,
  });

  // depth 2
  const p2026 = await getOrCreatePage({
    workspaceId: personalWs.id,
    parentId: pDaily.id,
    title: "2026",
    order: 0,
    authorId: alice.id,
  });

  const pReading = await getOrCreatePage({
    workspaceId: personalWs.id,
    parentId: pProjects.id,
    title: "Reading List",
    order: 0,
    authorId: alice.id,
  });

  // depth 3
  await getOrCreatePage({
    workspaceId: personalWs.id,
    parentId: p2026.id,
    title: "2026-03",
    order: 0,
    authorId: alice.id,
  });

  await getOrCreatePage({
    workspaceId: personalWs.id,
    parentId: pReading.id,
    title: "Backend",
    order: 0,
    authorId: alice.id,
  });

  await getOrCreatePage({
    workspaceId: personalWs.id,
    parentId: pReading.id,
    title: "Product",
    order: 1,
    authorId: alice.id,
  });

  console.log("✅ Seed complete (idempotent)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
