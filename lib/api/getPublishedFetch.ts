export const pagePublicInfoFetch = async (pageId: number) => {
  const res = await fetch(`/api/pagepublic?pageId=${pageId}`, {
    method: 'GET',
  });
  if (!res.ok) {
    throw new Error('페이지 조회 실패');
  }

  return await res.json();
};
