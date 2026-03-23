export async function createPage(pageID: Number | String | null) {
  const res = await fetch('/api/createpage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pageID,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || '데이터 가져오기 실패.');
  }

  return data;
}
