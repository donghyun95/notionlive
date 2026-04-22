export async function deletePageFetch(pageId: number) {
  const res = await fetch(`/api/pages/${pageId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || '페이지 삭제에 실패했습니다.');
  }

  return data;
}
