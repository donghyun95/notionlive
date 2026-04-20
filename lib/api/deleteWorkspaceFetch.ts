type DeleteWorkspaceResponse = {
  success?: boolean;
  error?: string;
};

export async function deleteWorkspaceFetch(workspaceId: number) {
  const response = await fetch(`/api/workspaces/${workspaceId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = (await response.json()) as DeleteWorkspaceResponse;

  if (!response.ok) {
    throw new Error(result.error || '워크스페이스 삭제에 실패했습니다.');
  }

  return result;
}
