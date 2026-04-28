import { NextResponse } from 'next/server';

export async function GET() {
  const siteKey = process.env.TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return NextResponse.json(
      { error: 'TURNSTILE_SITE_KEY is not set' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    turnstileSiteKey: siteKey,
  });
}
