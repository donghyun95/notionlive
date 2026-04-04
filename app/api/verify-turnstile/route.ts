export async function POST(req: Request) {
  const { token } = await req.json();

  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    },
  );
  const data = await res.json();

  if (!data.success) {
    const codes = data['error-codes'] ?? [];

    if (codes.includes('timeout-or-duplicate')) {
      return Response.json({ ok: false, code: 'EXPIRED' });
    }

    return Response.json({ ok: false, code: 'FAILED' });
  }

  return Response.json({ ok: true });
}
