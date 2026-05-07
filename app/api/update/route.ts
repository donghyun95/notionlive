import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateTitle, updateIcon } from '@/server/create/queries';

const updateRequestSchema = z
  .object({
    pageID: z.coerce.number().int().positive(),
    title: z.string().optional(),
    icon: z.string().optional(),
  })
  .refine((data) => data.title !== undefined || data.icon !== undefined, {
    message: 'title or icon is required',
  });

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const parsedBody = updateRequestSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { pageID, title, icon } = parsedBody.data;

    const pageAccess = await prisma.page.findFirst({
      where: {
        id: pageID,
        deletedAt: null,
      },
      select: {
        authorId: true,
        workspace: {
          select: {
            members: {
              where: { userId },
              select: { userId: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!pageAccess) {
      return NextResponse.json({ error: 'Page not found' }, { status: 403 });
    }

    const isAuthor = pageAccess.authorId === userId;
    const isWorkspaceMember = pageAccess.workspace.members.length > 0;

    if (!isAuthor && !isWorkspaceMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (icon === undefined && title !== undefined) {
      if (title.trim().length === 0) {
        const result = await updateTitle(pageID, 'UnTitled');
        return NextResponse.json(result);
      }
      const result = await updateTitle(pageID, title);
      return NextResponse.json(result);
    }
    if (title === undefined && icon !== undefined) {
      if (icon.trim().length === 0) {
        return NextResponse.json(
          { error: 'Bad Request', details: 'icon cannot be empty' },
          { status: 400 },
        );
      }
      const result = await updateIcon(pageID, icon);
      return NextResponse.json(result);
    }


    return NextResponse.json(
      { error: 'Bad Request', details: 'Provide either title or icon' },
      { status: 400 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
