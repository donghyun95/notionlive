import {
  CloudOff,
  HelpCircle,
  Settings,
  RefreshCw,
  Home,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function TeamSpaceErrorPage() {
  return (
    <div className="bg-[#fafaf5] text-[#30332e] min-h-screen flex flex-col antialiased selection:bg-[#bdbaff] selection:text-[#270ac3] font-sans">
      {/* Header */}
      <header className="bg-[#f3f4ee] text-[#30332e] sticky top-0 flex justify-between items-center px-8 h-16 w-full max-w-full z-50">
        <div className="flex items-center gap-12">
          <Link
            className="text-2xl font-bold tracking-tight text-[#30332e] hover:opacity-80 transition-opacity"
            href="/"
          >
            TeamSpace
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              className="text-[#5c605a] hover:text-[#30332e] transition-colors font-medium"
              href="/dashboard"
            >
              Workspaces
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center justify-center text-[#5c605a] hover:bg-[#e7e9e2]/50 transition-all p-2 rounded-full active:scale-90 duration-300">
            <HelpCircle size={20} />
          </button>

          <button className="hidden md:flex items-center justify-center text-[#5c605a] hover:bg-[#e7e9e2]/50 transition-all p-2 rounded-full active:scale-90 duration-300">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden">
        {/* Ambient Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4e45e4]/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#46655e]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Main Card */}
        <div className="bg-white w-full max-w-xl rounded-[1.5rem] p-12 flex flex-col items-center text-center relative shadow-[0_20px_40px_rgba(48,51,46,0.06)] ring-1 ring-[#b0b3ac]/15">
          {/* Illustration */}
          <div className="w-32 h-32 mb-8 bg-[#e7e9e2] rounded-[1.5rem] flex items-center justify-center rotate-3">
            <div className="w-full h-full bg-white rounded-[1.5rem] flex items-center justify-center -rotate-3 transition-transform hover:rotate-0 duration-500 ease-out shadow-[0_10px_20px_rgba(48,51,46,0.04)] ring-1 ring-[#b0b3ac]/10">
              <CloudOff
                size={64}
                className="text-[#4135d8] opacity-80"
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4 mb-10">
            <div className="inline-flex items-center px-3 py-1 bg-[#f3f4ee] rounded-full mb-2 border border-[#b0b3ac]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#787c75] mr-2" />
              <span className="text-xs font-medium text-[#5c605a] uppercase tracking-wider">
                System Status
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#30332e] leading-tight">
              Something went wrong
            </h1>

            <p className="text-base md:text-lg text-[#5c605a] max-w-md mx-auto leading-relaxed">
              Please try again in a moment or return home. We are looking into
              the issue.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 justify-center items-center">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-br from-[#4e45e4] to-[#4135d8] text-[#fbf7ff] font-medium rounded-xl"
            >
              <LogOut size={18} className="mr-2" />
              LogOut
            </button>

            <Link href="/">
              <button className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-[#d5f8ef] text-[#416059] font-medium rounded-xl hover:bg-[#fafaf5] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#46655e] focus:ring-offset-2 focus:ring-offset-[#fafaf5] relative group overflow-hidden ring-1 ring-[#b0b3ac]/20">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <Home size={18} className="mr-2" />
                Go Home
              </button>
            </Link>
          </div>

          {/* Technical Detail */}
          <div className="mt-12 pt-6 border-t border-[#b0b3ac]/15 w-full text-center">
            <p className="font-mono text-xs text-[#5c605a]/70">
              Error Code: TS_500_UNEXPECTED
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#f3f4ee] text-sm text-[#5c605a] border-t border-[#b0b3ac]/15 flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full mt-auto">
        <div className="mb-6 md:mb-0 flex flex-col items-center md:items-start gap-2">
          <span className="text-lg font-bold text-[#30332e]">TeamSpace</span>
          <p>© 2024 TeamSpace. All rights reserved.</p>
        </div>

        <nav className="flex flex-wrap justify-center gap-6">
          <a
            className="hover:text-[#4e45e4] transition-colors opacity-80 hover:opacity-100"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="hover:text-[#4e45e4] transition-colors opacity-80 hover:opacity-100"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="hover:text-[#4e45e4] transition-colors opacity-80 hover:opacity-100"
            href="#"
          >
            Support
          </a>
          <a
            className="hover:text-[#4e45e4] transition-colors opacity-80 hover:opacity-100"
            href="#"
          >
            Feedback
          </a>
        </nav>
      </footer>
    </div>
  );
}
