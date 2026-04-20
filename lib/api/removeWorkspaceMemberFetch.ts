type RemoveWorkspaceMemberParams = {
  workspaceId: number;
  userId: string;
};

type RemoveWorkspaceMemberResponse = {
  success?: boolean;
  error?: string;
};

export async function removeWorkspaceMemberFetch({
  workspaceId,
  userId,
}: RemoveWorkspaceMemberParams) {
  const response = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = (await response.json()) as RemoveWorkspaceMemberResponse;

  if (!response.ok) {
    throw new Error(result.error || '멤버 삭제에 실패했습니다.');
  }

  return result;
}
