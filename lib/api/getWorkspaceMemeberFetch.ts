export async function WorkspaceMembersfetch(workspaceId: number) {
  try {
    const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 최신 데이터 가져오고 싶으면
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch members: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('fetchWorkspaceMembers error:', error);
    throw error;
  }
}
