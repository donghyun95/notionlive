import { NextRequest, NextResponse } from 'next/server';
import { FeedbackCategory } from '@prisma/client';

import { auth } from '@/lib/auth';
import { createFeedback } from '@/server/feedback/mutations';
import { getFeedbackList } from '@/server/feedback/queries';
import { feedbackSchema } from '@/server/feedback/schema';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function isAdminEmail(email?: string | null) {
  if (!email) return false;

  const adminEmailList = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return adminEmailList.includes(email.toLowerCase());
}

function parseCategory(rawValue: string | null): FeedbackCategory | undefined {
  if (!rawValue) return undefined;

  const normalized = rawValue.trim().toUpperCase();

  if (
    normalized !== FeedbackCategory.BUG &&
    normalized !== FeedbackCategory.IDEA &&
    normalized !== FeedbackCategory.UX
  ) {
    return undefined;
  }

  return normalized as FeedbackCategory;
}


export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = feedbackSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const session = await auth();

    const created = await createFeedback({
      ...parsed.data,
      userEmail: session?.user?.email ?? null,
    });

    return NextResponse.json(
      {
        ok: true,
        id: created.id,
        createdAt: created.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(
      Number(searchParams.get('page')) || DEFAULT_PAGE,
      DEFAULT_PAGE,
    );
    const pageSize = Math.min(
      Math.max(
        Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE,
        DEFAULT_PAGE,
      ),
      MAX_PAGE_SIZE,
    );

    const category = parseCategory(searchParams.get('category'));

    const result = await getFeedbackList({
      page,
      pageSize,
      category,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 },
    );
  }
}
