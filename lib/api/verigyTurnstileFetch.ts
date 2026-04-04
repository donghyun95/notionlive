export async function verifyTurnstile(token: string) {
  if (!token) {
    return { ok: false, code: 'MISSING' };
  }

  try {
    const res = await fetch('/api/verify-turnstile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    return data; // { ok: true } or { ok: false, code: 'EXPIRED' }
  } catch (error) {
    console.error('Turnstile verify fetch error:', error);

    return { ok: false, code: 'NETWORK' };
  }
}
