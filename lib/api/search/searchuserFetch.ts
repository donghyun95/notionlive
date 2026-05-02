export async function searchUserFetch(keyword: string, workspaceId: number) {
  if (!keyword) return [];

  const res = await fetch(
    `/api/search/user?keyword=${encodeURIComponent(keyword)}&workspaceId=${workspaceId}`,
    { cache: 'no-store' },
  );

  if (!res.ok) throw new Error('Failed to fetch');

  return res.json();
}
