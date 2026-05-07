type TurnstileResponse = {
  success: boolean;
  'error-codes'?: string[];
};

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not set');

    return false;
  }

  try {
    const formData = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      },
    );

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as TurnstileResponse;

    return data.success;
  } catch (error) {
    console.error('Turnstile verification failed:', error);

    return false;
  }
}
