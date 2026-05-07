export async function PendingInvitesfetch() {
  const res = await fetch('/api/invite/pending', {
    method: 'GET',
    cache: 'no-store', // 최신 데이터 보장
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch pending invites');
  }

  return res.json();
}
