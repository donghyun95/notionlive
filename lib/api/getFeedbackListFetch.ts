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

export type GetFeedbackListParams = {
  page: number;
  pageSize: number;
  category?: 'BUG' | 'IDEA' | 'UX';
};

const FEEDBACK_LIST_ERROR_MESSAGE = '피드백 목록 조회 중 오류가 발생했습니다.';
const FEEDBACK_FORBIDDEN_MESSAGE =
  '관리자 권한이 필요합니다. 관리자 계정으로 다시 로그인해 주세요.';

export async function getFeedbackListFetch(
  { page, pageSize, category }: GetFeedbackListParams,
  options?: { signal?: AbortSignal },
) {
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
    signal: options?.signal,
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(FEEDBACK_FORBIDDEN_MESSAGE);
    }

    throw new Error(FEEDBACK_LIST_ERROR_MESSAGE);
  }

  return (await res.json()) as GetFeedbackListResponse;
}
