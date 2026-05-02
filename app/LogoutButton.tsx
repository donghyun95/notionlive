import { signOut } from '@/lib/auth';
import { RefreshCw } from 'lucide-react';

export default function LogoutButton() {
  async function logout() {
    'use server';
    await signOut({ redirectTo: '/' });
  }

  return (
    <form action={logout}>
      <button
        type="submit"
        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-br from-[#4e45e4] to-[#4135d8] text-[#fbf7ff] font-medium rounded-xl"
      >
        <RefreshCw size={18} className="mr-2" />
        LogOut
      </button>
    </form>
  );
}
