'use client';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function Page({ params }: any) {
  const { data: session, status } = useSession();
  console.log(session);
  console.log(status);
  function logout(ev) {
    signOut({ callbackUrl: '/login' });
  }
  return (
    <div>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}
