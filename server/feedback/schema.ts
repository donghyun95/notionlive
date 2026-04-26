import { z } from 'zod';

export const feedbackSchema = z.object({
  category: z.enum(['bug', 'idea', 'ux']),
  title: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(5000),
  email: z
    .union([z.string().trim().email().max(320), z.literal('')])
    .optional(),
  mood: z.number().int().min(1).max(5),
  pageUrl: z.string().url().max(2000).optional(),
  userAgent: z.string().max(1000).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export function mapFeedbackCategory(
  category: FeedbackInput['category'],
): 'BUG' | 'IDEA' | 'UX' {
  switch (category) {
    case 'bug':
      return 'BUG';
    case 'idea':
      return 'IDEA';
    case 'ux':
      return 'UX';
  }
}
