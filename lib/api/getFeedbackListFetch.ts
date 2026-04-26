import { FeedbackCategory } from '@prisma/client';

export type FeedbackListItem = {
  id: number;
  category: FeedbackCategory;
  title: string;
  message: string;
  email: string | null;
  mood: number;
  pageUrl: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type GetFeedbackListResponse = {
  items: FeedbackListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getFeedbackListFetch({
  page,
  pageSize,
  category,
}: {
  page: number;
  pageSize: number;
  category?: FeedbackCategory;
}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (category) {
    params.set('category', category);
  }

  const res = await fetch(`/api/feedback?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.error ?? data?.message ?? '피드백 목록 조회에 실패했습니다.',
    );
  }

  return data as GetFeedbackListResponse;
}
