export type SignupInput = {
  email: string;
  password: string;
  name: string;
};

export type SignupResponse = {
  message: string;
};

export async function signupFn(input: SignupInput): Promise<SignupResponse> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || '회원가입에 실패했습니다.');
  }

  return data;
}
