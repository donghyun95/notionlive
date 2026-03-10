import "dotenv/config";
import { PrismaClient, WorkspaceType, WorkspaceRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

const currentContent = [
  {
    id: "c44ca60c-80e5-47b1-b951-defff56f310f",
    type: "paragraph",
    props: {
      backgroundColor: "default",
      textColor: "default",
      textAlignment: "left",
    },
    content: [],
    children: [],
  },
  {
    id: "02c284c8-6956-4bf8-ade7-7caeaac46846",
    type: "paragraph",
    props: {
      backgroundColor: "default",
      textColor: "default",
      textAlignment: "left",
    },
    content: [
      {
        type: "text",
        text: "asdaㄴ",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: "3e9df4f2-f167-4f5c-964a-828058300c50",
    type: "paragraph",
    props: {
      backgroundColor: "default",
      textColor: "default",
      textAlignment: "left",
    },
    content: [],
    children: [],
  },
];

async function main() {
  console.log("🌱 Start seeding...");

  // 삭제 순서: 자식 -> 부모
  await prisma.pagePartSnapshot.deleteMany();
  await prisma.pagePart.deleteMany();
  await prisma.page.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // 1) Users
  const [alice, bob, charlie, diana] = await Promise.all([
    prisma.user.create({
      data: {
        email: "alice@example.com",
        name: "Alice",
        image: "https://i.pravatar.cc/150?img=1",
      },
    }),
    prisma.user.create({
      data: {
        email: "bob@example.com",
        name: "Bob",
        image: "https://i.pravatar.cc/150?img=2",
      },
    }),
    prisma.user.create({
      data: {
        email: "charlie@example.com",
        name: "Charlie",
        image: "https://i.pravatar.cc/150?img=3",
      },
    }),
    prisma.user.create({
      data: {
        email: "diana@example.com",
        name: "Diana",
        image: "https://i.pravatar.cc/150?img=4",
      },
    }),
  ]);

  // 2) Workspaces
  const personalWorkspace = await prisma.workspace.create({
    data: {
      name: "Alice Personal Workspace",
      type: WorkspaceType.PERSONAL,
    },
  });

  const teamWorkspace = await prisma.workspace.create({
    data: {
      name: "Product Team Workspace",
      type: WorkspaceType.TEAM,
    },
  });

  // 3) Workspace Members
  await prisma.workspaceMember.createMany({
    data: [
      {
        userId: alice.id,
        workspaceId: personalWorkspace.id,
        role: WorkspaceRole.OWNER,
      },
      {
        userId: alice.id,
        workspaceId: teamWorkspace.id,
        role: WorkspaceRole.OWNER,
      },
      {
        userId: bob.id,
        workspaceId: teamWorkspace.id,
        role: WorkspaceRole.ADMIN,
      },
      {
        userId: charlie.id,
        workspaceId: teamWorkspace.id,
        role: WorkspaceRole.MEMBER,
      },
      {
        userId: diana.id,
        workspaceId: teamWorkspace.id,
        role: WorkspaceRole.VIEWER,
      },
    ],
  });

  // ---------------------------------------------------------------------------
  // 4) PERSONAL workspace pages
  // ---------------------------------------------------------------------------

  const personalRoot = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      authorId: alice.id,
      title: "개인 홈",
      icon: "🏠",
      order: 0,
    },
  });

  const personalTodo = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: personalRoot.id,
      authorId: alice.id,
      title: "오늘 할 일",
      icon: "✅",
      order: 0,
    },
  });

  const personalJournal = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: personalRoot.id,
      authorId: alice.id,
      title: "일지",
      icon: "📓",
      order: 1,
    },
  });

  const personalMorning = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: personalTodo.id,
      authorId: alice.id,
      title: "출근 전",
      icon: "🌅",
      order: 0,
    },
  });

  const personalEvening = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: personalTodo.id,
      authorId: alice.id,
      title: "퇴근 후",
      icon: "🌙",
      order: 1,
    },
  });

  const personalDrinkWater = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: personalMorning.id,
      authorId: alice.id,
      title: "물 마시기",
      icon: "💧",
      order: 0,
    },
  });

  const personalCheckSchedule = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: personalMorning.id,
      authorId: alice.id,
      title: "오늘 일정 확인",
      icon: "📅",
      order: 1,
    },
  });

  const personalWorkout = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: personalEvening.id,
      authorId: alice.id,
      title: "운동",
      icon: "🏃",
      order: 0,
    },
  });

  const journal2026 = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: personalJournal.id,
      authorId: alice.id,
      title: "2026년",
      icon: "🗓️",
      order: 0,
    },
  });

  const personalRetrospective = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: personalJournal.id,
      authorId: alice.id,
      title: "회고",
      icon: "🔍",
      order: 1,
    },
  });

  const journalMarch = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: journal2026.id,
      authorId: alice.id,
      title: "3월",
      icon: "🌸",
      order: 0,
    },
  });

  await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: journal2026.id,
      authorId: alice.id,
      title: "4월",
      icon: "🌿",
      order: 1,
    },
  });

  const journalMarch8 = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: journalMarch.id,
      authorId: alice.id,
      title: "3월 8일",
      icon: "📝",
      order: 0,
    },
  });

  const journalMarch9 = await prisma.page.create({
    data: {
      workspaceId: personalWorkspace.id,
      parentId: journalMarch.id,
      authorId: alice.id,
      title: "3월 9일",
      icon: "📝",
      order: 1,
    },
  });

  // ---------------------------------------------------------------------------
  // 5) TEAM workspace pages
  // ---------------------------------------------------------------------------

  const teamRoot = await prisma.page.create({
    data: {
      workspaceId: teamWorkspace.id,
      authorId: alice.id,
      title: "팀 위키",
      icon: "📚",
      order: 0,
    },
  });

  const roadmapPage = await prisma.page.create({
    data: {
      workspaceId: teamWorkspace.id,
      parentId: teamRoot.id,
      authorId: bob.id,
      title: "로드맵",
      icon: "🗺️",
      order: 0,
    },
  });

  const meetingNotesPage = await prisma.page.create({
    data: {
      workspaceId: teamWorkspace.id,
      parentId: teamRoot.id,
      authorId: charlie.id,
      title: "회의록",
      icon: "📝",
      order: 1,
    },
  });

  const backendPage = await prisma.page.create({
    data: {
      workspaceId: teamWorkspace.id,
      parentId: roadmapPage.id,
      authorId: bob.id,
      title: "백엔드 작업",
      icon: "⚙️",
      order: 0,
    },
  });

  const frontendPage = await prisma.page.create({
    data: {
      workspaceId: teamWorkspace.id,
      parentId: roadmapPage.id,
      authorId: charlie.id,
      title: "프론트엔드 작업",
      icon: "🎨",
      order: 1,
    },
  });

  // ---------------------------------------------------------------------------
  // 6) PageParts
  // ---------------------------------------------------------------------------

  const personalTodoPart1 = await prisma.pagePart.create({
    data: {
      pageId: personalTodo.id,
      partNo: 1,
      roomId: "room-personal-todo-1",
    },
  });

  const personalTodoPart2 = await prisma.pagePart.create({
    data: {
      pageId: personalTodo.id,
      partNo: 2,
      roomId: "room-personal-todo-2",
    },
  });

  const personalJournalPart1 = await prisma.pagePart.create({
    data: {
      pageId: personalJournal.id,
      partNo: 1,
      roomId: "room-personal-journal-1",
    },
  });

  const personalMorningPart1 = await prisma.pagePart.create({
    data: {
      pageId: personalMorning.id,
      partNo: 1,
      roomId: "room-personal-morning-1",
    },
  });

  const personalDrinkWaterPart1 = await prisma.pagePart.create({
    data: {
      pageId: personalDrinkWater.id,
      partNo: 1,
      roomId: "room-personal-drink-water-1",
    },
  });

  const personalCheckSchedulePart1 = await prisma.pagePart.create({
    data: {
      pageId: personalCheckSchedule.id,
      partNo: 1,
      roomId: "room-personal-check-schedule-1",
    },
  });

  const personalWorkoutPart1 = await prisma.pagePart.create({
    data: {
      pageId: personalWorkout.id,
      partNo: 1,
      roomId: "room-personal-workout-1",
    },
  });

  const journalMarch8Part1 = await prisma.pagePart.create({
    data: {
      pageId: journalMarch8.id,
      partNo: 1,
      roomId: "room-journal-march8-1",
    },
  });

  const journalMarch9Part1 = await prisma.pagePart.create({
    data: {
      pageId: journalMarch9.id,
      partNo: 1,
      roomId: "room-journal-march9-1",
    },
  });

  const personalRetrospectivePart1 = await prisma.pagePart.create({
    data: {
      pageId: personalRetrospective.id,
      partNo: 1,
      roomId: "room-personal-retrospective-1",
    },
  });

  const roadmapPart1 = await prisma.pagePart.create({
    data: {
      pageId: roadmapPage.id,
      partNo: 1,
      roomId: "room-roadmap-1",
    },
  });

  const roadmapPart2 = await prisma.pagePart.create({
    data: {
      pageId: roadmapPage.id,
      partNo: 2,
      roomId: "room-roadmap-2",
    },
  });

  const meetingNotesPart1 = await prisma.pagePart.create({
    data: {
      pageId: meetingNotesPage.id,
      partNo: 1,
      roomId: "room-meeting-notes-1",
    },
  });

  const backendPart1 = await prisma.pagePart.create({
    data: {
      pageId: backendPage.id,
      partNo: 1,
      roomId: "room-backend-1",
    },
  });

  const frontendPart1 = await prisma.pagePart.create({
    data: {
      pageId: frontendPage.id,
      partNo: 1,
      roomId: "room-frontend-1",
    },
  });

  // ---------------------------------------------------------------------------
  // 7) PagePartSnapshots
  // roomId는 반드시 연결된 PagePart.roomId와 동일해야 함
  // ---------------------------------------------------------------------------

  await prisma.pagePartSnapshot.createMany({
    data: [
      // PERSONAL - 오늘 할 일 / part1
      {
        pagePartId: personalTodoPart1.id,
        version: 1,
        roomId: personalTodoPart1.roomId,
        contentJson: currentContent,
        contentHtml: "<p></p><p>asdaㄴ</p><p></p>",
        contentText: "asdaㄴ",
      },
      {
        pagePartId: personalTodoPart1.id,
        version: 2,
        roomId: personalTodoPart1.roomId,
        contentJson: [
          ...currentContent,
          {
            id: "extra-personal-todo-v2",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "두 번째 버전의 할 일 메모",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml:
          "<p></p><p>asdaㄴ</p><p></p><p>두 번째 버전의 할 일 메모</p>",
        contentText: "asdaㄴ\n두 번째 버전의 할 일 메모",
      },

      // PERSONAL - 오늘 할 일 / part2
      {
        pagePartId: personalTodoPart2.id,
        version: 1,
        roomId: personalTodoPart2.roomId,
        contentJson: [
          {
            id: "personal-todo-extra-2",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "오늘 할 일의 두 번째 파트",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>오늘 할 일의 두 번째 파트</p>",
        contentText: "오늘 할 일의 두 번째 파트",
      },

      // PERSONAL - 일지
      {
        pagePartId: personalJournalPart1.id,
        version: 1,
        roomId: personalJournalPart1.roomId,
        contentJson: [
          {
            id: "journal-1",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "오늘은 시드 데이터를 만들었다.",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>오늘은 시드 데이터를 만들었다.</p>",
        contentText: "오늘은 시드 데이터를 만들었다.",
      },

      // PERSONAL - 출근 전
      {
        pagePartId: personalMorningPart1.id,
        version: 1,
        roomId: personalMorningPart1.roomId,
        contentJson: [
          {
            id: "morning-1",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "아침 루틴 체크",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>아침 루틴 체크</p>",
        contentText: "아침 루틴 체크",
      },

      // PERSONAL - 물 마시기
      {
        pagePartId: personalDrinkWaterPart1.id,
        version: 1,
        roomId: personalDrinkWaterPart1.roomId,
        contentJson: currentContent,
        contentHtml: "<p></p><p>asdaㄴ</p><p></p>",
        contentText: "asdaㄴ",
      },

      // PERSONAL - 오늘 일정 확인
      {
        pagePartId: personalCheckSchedulePart1.id,
        version: 1,
        roomId: personalCheckSchedulePart1.roomId,
        contentJson: [
          {
            id: "schedule-1",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "캘린더 확인 후 우선순위 정리",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>캘린더 확인 후 우선순위 정리</p>",
        contentText: "캘린더 확인 후 우선순위 정리",
      },

      // PERSONAL - 운동
      {
        pagePartId: personalWorkoutPart1.id,
        version: 1,
        roomId: personalWorkoutPart1.roomId,
        contentJson: [
          {
            id: "workout-1",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "저녁 러닝 30분",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>저녁 러닝 30분</p>",
        contentText: "저녁 러닝 30분",
      },

      // PERSONAL - 3월 8일
      {
        pagePartId: journalMarch8Part1.id,
        version: 1,
        roomId: journalMarch8Part1.roomId,
        contentJson: [
          {
            id: "journal-march8-1",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "3월 8일 일지 내용",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>3월 8일 일지 내용</p>",
        contentText: "3월 8일 일지 내용",
      },

      // PERSONAL - 3월 9일
      {
        pagePartId: journalMarch9Part1.id,
        version: 1,
        roomId: journalMarch9Part1.roomId,
        contentJson: [
          {
            id: "journal-march9-1",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "3월 9일 일지 내용",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>3월 9일 일지 내용</p>",
        contentText: "3월 9일 일지 내용",
      },

      // PERSONAL - 회고
      {
        pagePartId: personalRetrospectivePart1.id,
        version: 1,
        roomId: personalRetrospectivePart1.roomId,
        contentJson: [
          {
            id: "retro-1",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "이번 주 회고: 페이지 구조 테스트 완료",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>이번 주 회고: 페이지 구조 테스트 완료</p>",
        contentText: "이번 주 회고: 페이지 구조 테스트 완료",
      },

      // TEAM - 로드맵 / part1
      {
        pagePartId: roadmapPart1.id,
        version: 1,
        roomId: roadmapPart1.roomId,
        contentJson: currentContent,
        contentHtml: "<p></p><p>asdaㄴ</p><p></p>",
        contentText: "asdaㄴ",
      },

      // TEAM - 로드맵 / part2
      {
        pagePartId: roadmapPart2.id,
        version: 1,
        roomId: roadmapPart2.roomId,
        contentJson: [
          {
            id: "roadmap-2-1",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "Q2: 협업 편집 기능 개선",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>Q2: 협업 편집 기능 개선</p>",
        contentText: "Q2: 협업 편집 기능 개선",
      },

      // TEAM - 회의록
      {
        pagePartId: meetingNotesPart1.id,
        version: 1,
        roomId: meetingNotesPart1.roomId,
        contentJson: [
          {
            id: "meeting-1",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "회의 안건: 페이지 트리 정렬 정책 논의",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>회의 안건: 페이지 트리 정렬 정책 논의</p>",
        contentText: "회의 안건: 페이지 트리 정렬 정책 논의",
      },

      // TEAM - 백엔드 작업
      {
        pagePartId: backendPart1.id,
        version: 1,
        roomId: backendPart1.roomId,
        contentJson: [
          {
            id: "backend-1",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "Prisma transaction 적용 검토",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>Prisma transaction 적용 검토</p>",
        contentText: "Prisma transaction 적용 검토",
      },

      // TEAM - 프론트엔드 작업
      {
        pagePartId: frontendPart1.id,
        version: 1,
        roomId: frontendPart1.roomId,
        contentJson: [
          {
            id: "frontend-1",
            type: "paragraph",
            props: {
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
            content: [
              {
                type: "text",
                text: "드래그앤드롭 UI 개선 필요",
                styles: {},
              },
            ],
            children: [],
          },
        ],
        contentHtml: "<p>드래그앤드롭 UI 개선 필요</p>",
        contentText: "드래그앤드롭 UI 개선 필요",
      },
    ],
  });

  const userCount = await prisma.user.count();
  const workspaceCount = await prisma.workspace.count();
  const pageCount = await prisma.page.count();
  const pagePartCount = await prisma.pagePart.count();
  const snapshotCount = await prisma.pagePartSnapshot.count();

  console.log("✅ Seed completed");
  console.log({
    users: userCount,
    workspaces: workspaceCount,
    pages: pageCount,
    pageParts: pagePartCount,
    snapshots: snapshotCount,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
