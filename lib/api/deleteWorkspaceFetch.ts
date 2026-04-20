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

  const result = (await response.json().catch(() => null)) as
    | DeleteWorkspaceResponse
    | null;

  if (!response.ok) {
    throw new Error(result?.error || 'Failed to delete workspace.');
  }

  return result;
}
