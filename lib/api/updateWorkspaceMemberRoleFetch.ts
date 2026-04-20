type UpdateWorkspaceMemberRoleParams = {
  workspaceId: number;
  userId: string;
  role: 'OWNER' | 'MEMBER';
};

type UpdateWorkspaceMemberRoleResponse = {
  success?: boolean;
  error?: string;
};

export async function updateWorkspaceMemberRoleFetch({
  workspaceId,
  userId,
  role,
}: UpdateWorkspaceMemberRoleParams) {
  const response = await fetch(
    `/api/workspaces/${workspaceId}/members/${userId}/role`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    },
  );

  const result =
    (await response.json()) as UpdateWorkspaceMemberRoleResponse;

  if (!response.ok) {
    throw new Error(result.error || '멤버 권한 수정에 실패했습니다.');
  }

  return result;
}
