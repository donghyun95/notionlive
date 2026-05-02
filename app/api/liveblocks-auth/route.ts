import { Liveblocks } from '@liveblocks/node';
import { auth } from '@/lib/auth';
import { getUserPageAccess, assertPagePublished } from '@/server/users/queries';
import { generatePremiumHexColor } from '@/lib/common';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(req: Request) {
  const { room } = await req.json();
  const authsession = await auth();
  // ✅ 여기서 유저를 “결정”해야 함 (지금은 더미)
  // 실제 서비스면 session에서 userId 뽑아오면 됨

  const userId = authsession?.user?.id;
  const userName = String(authsession?.user?.name);
  const pageId = Number(room);

  const color = String(authsession?.user?.color);
  const image = String(authsession?.user?.image);
  if (!userId) {
    try {
      await assertPagePublished(pageId);

      const guest = `guest-${crypto.randomUUID()}`;
      const session = liveblocks.prepareSession(guest, {
        userInfo: {
          name: 'guest',
          color: generatePremiumHexColor(),
          image: `https://api.dicebear.com/9.x/adventurer/svg?seed=${Math.random().toString(36).slice(2)}`,
        },
      });

      session.allow(room, session.READ_ACCESS);
      const { status, body } = await session.authorize();
      return new Response(body, { status });
    } catch (error) {
      return new Response('Unauthorized', { status: 403 });
    }
  }

  // ✅ 핵심: userInfo로 name/color 넘김
  try {
    const identifieduser = await getUserPageAccess(userId, pageId);
    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        name: userName,
        color,
        image,
        // avatar: "https://..." // 원하면 추가
      },
    });
    if (identifieduser.role === 'VIEWER') {
      session.allow(room, session.READ_ACCESS);
    } else {
      session.allow(room, session.FULL_ACCESS);
    }
    const { status, body } = await session.authorize();
    return new Response(body, { status });
  } catch (error) {
    return new Response('Unauthorized', { status: 403 });
  }
}
