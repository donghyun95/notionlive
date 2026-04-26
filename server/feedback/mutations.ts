import { prisma } from '@/lib/prisma';

import { FeedbackInput, mapFeedbackCategory } from './schema';

type CreateFeedbackParams = FeedbackInput & {
  userEmail?: string | null;
};

export async function createFeedback({
  category,
  title,
  message,
  email,
  mood,
  pageUrl,
  userAgent,
  userEmail,
}: CreateFeedbackParams) {
  const normalizedEmail = email?.trim() || userEmail?.trim() || null;

  const item = await prisma.feedback.create({
    data: {
      category: mapFeedbackCategory(category),
      title: title.trim(),
      message: message.trim(),
      email: normalizedEmail,
      mood,
      pageUrl,
      userAgent,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return item;
}
