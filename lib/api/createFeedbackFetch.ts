import type { FeedbackInput } from '@/server/feedback/schema';

export async function createFeedbackFetch(payload: FeedbackInput) {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? data?.message ?? '제보 전송에 실패했습니다.');
  }

  return data;
}
