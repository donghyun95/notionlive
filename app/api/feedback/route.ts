import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { feedbackSchema, mapFeedbackCategory } from '@/server/feedback/schema';

export async function POST(req: NextRequest) {
  try {
    const rawBody: unknown = await req.json();
    const parsedBody = feedbackSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: '요청 바디가 올바르지 않습니다.',
          errors: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { category, title, message, email, mood, pageUrl, userAgent } =
      parsedBody.data;

    const normalizedTitle = title.trim();
    const normalizedMessage = message.trim();
    const normalizedEmail = email?.trim();

    await prisma.feedback.create({
      data: {
        category: mapFeedbackCategory(category),
        title: normalizedTitle,
        message: normalizedMessage,
        email: normalizedEmail ? normalizedEmail : null,
        mood,
        pageUrl,
        userAgent,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: '피드백 저장 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
