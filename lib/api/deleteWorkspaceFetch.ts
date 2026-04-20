type DeleteWorkspaceResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

export async function deleteWorkspaceFetch(workspaceId: number) {
  const response = await fetch(`/api/workspaces/${workspaceId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  let result: DeleteWorkspaceResponse | null = null;

  try {
    result = (await response.json()) as DeleteWorkspaceResponse;
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(
      result?.error || result?.message || '워크스페이스 삭제에 실패했습니다.',
    );
  }

  return result;
}
