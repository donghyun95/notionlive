type PageTreeMutationAction = 'soft-delete' | 'restore';

type PageTreeMutationResponse = {
  action: PageTreeMutationAction;
  pageId: number;
  affectedCount: number;
};

async function pageTreeMutationFetch(
  pageId: number,
  action: PageTreeMutationAction,
) {
  const response = await fetch(`/api/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action }),
  });

  const result = (await response.json().catch(() => null)) as
    | PageTreeMutationResponse
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      (result && 'error' in result && result.error) ||
        '페이지 상태 변경에 실패했습니다.',
    );
  }

  return result as PageTreeMutationResponse;
}

export function trashPageFetch(pageId: number) {
  return pageTreeMutationFetch(pageId, 'soft-delete');
}

export function restorePageFetch(pageId: number) {
  return pageTreeMutationFetch(pageId, 'restore');
}
