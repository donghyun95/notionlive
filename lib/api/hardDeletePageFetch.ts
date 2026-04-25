export type HardDeletePageResponse = {
  pageId: number;
  deletedCount: number;
};

export async function hardDeletePageFetch(
  pageId: number,
  type?: 'personal',
): Promise<HardDeletePageResponse> {
  const query =
    type === 'personal' ? '?hardDelete=true&type=personal' : '?hardDelete=true';

  const res = await fetch(`/api/pages/${pageId}${query}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || data.message || '페이지 영구 삭제에 실패했습니다.',
    );
  }

  return data;
}
