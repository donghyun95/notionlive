export async function getPersonalDeletedPagesFetch() {
  const res = await fetch('/api/pages/deleted', {
    method: 'GET',
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || '삭제된 페이지 조회 실패');
  }

  return data;
}
