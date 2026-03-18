'use client';
import { signOut } from 'next-auth/react';

export default async function Page({ params }: any) {
  function logout(ev) {
    signOut();
  }
  return (
    <div>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}
