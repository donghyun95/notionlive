import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { feedbackSchema, mapFeedbackCategory } from '@/server/feedback/schema';

function errorResponse(error: string, status: number, details?: unknown) {
  return NextResponse.json(
    details ? { error, details } : { error },
    { status },
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // TODO: Add lightweight rate-limiting hook here (IP/user-based) if needed.

    const rawBody: unknown = await request.json();
    const parsedBody = feedbackSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return errorResponse(
        'INVALID_INPUT',
        400,
        parsedBody.error.flatten(),
      );
    }

    const { category, title, message, email, mood, pageUrl, userAgent } =
      parsedBody.data;

    const created = await prisma.feedback.create({
      data: {
        category: mapFeedbackCategory(category),
        title: title.trim(),
        message: message.trim(),
        email: email?.trim() || null,
        mood,
        pageUrl: pageUrl?.trim() || null,
        userAgent: userAgent?.trim() || null,
        userId: session?.user?.id ?? null,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    console.error(error);

    return errorResponse('INTERNAL_SERVER_ERROR', 500);
  }
}
