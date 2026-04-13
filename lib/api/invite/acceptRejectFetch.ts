type InviteActionType = 'ACCEPT' | 'DECLINE';

interface InviteActionParams {
  inviteId: string;
  type: InviteActionType;
}

export async function acceptRejectFetch({
  inviteId,
  type,
}: InviteActionParams) {
  try {
    const res = await fetch('/api/invite/acceptReject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inviteId, type }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || '요청 실패');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('acceptRejectFetch error:', error);
    throw error;
  }
}
