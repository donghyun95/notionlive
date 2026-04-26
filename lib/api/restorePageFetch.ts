export type RestorePageResponse = {
  pageId: number;
  restoredToRoot: true;
};

export async function restorePageFetch(
  pageId: number,
): Promise<RestorePageResponse> {
  const res = await fetch(`/api/pages/${pageId}/restore`, {
    method: 'PATCH',
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || data.message || '페이지 복원에 실패했습니다.',
    );
  }

  return data;
}
