'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpDialog } from './signUp-dialog';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TurnstileWidget from './TurnstileWidget';
import { useState } from 'react';
import { verifyTurnstile } from '@/lib/api/verigyTurnstileFetch';
import { Cloud, Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [token, setToken] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitError('');

    if (!token) {
      setSubmitError('Please complete the human verification.');
      return;
    }

    setIsSubmitting(true);

    const verifyData = await verifyTurnstile(token);
    if (!verifyData.ok) {
      if (verifyData.code === 'EXPIRED') {
        setSubmitError('Security verification expired. Please try again.');
      } else {
        setSubmitError('Verification failed. Please try again.');
      }

      setToken('');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        turnstileToken: token,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setSubmitError('Invalid email or password.');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setSubmitError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={cn('min-h-screen bg-[#fafaf5] text-[#30332e]', className)}
      {...props}
    >
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-[980px] overflow-hidden rounded-[24px] bg-white shadow-[0_20px_40px_rgba(48,51,46,0.06)] lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left visual */}
          <section className="relative hidden min-h-[620px] overflow-hidden bg-[#f3f4ee] lg:block">
            <div className="absolute inset-0">
              <img
                alt="Modern minimalist workspace"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVMe5ZztwtwCTgN6tjNjOAQr6eAnqZ7hhHTb7d_7s0srKsUW2E_BgD_KBIFJxGvvayvOuX3ztmvaHsLb-qBqKdj4XQo2e1qWIdnZjA6oL2U-W_oXOgcdJIsYukL1JAGSDXOXEefxT2d8_LFCUjweuHnlixCktua8m5qkcN6IZK3OQREGVzrCm96x9xRG-OUtfNAQPMXW4sKK1cDHu15drURF7MWyoIrXWbSe13BBvJAbtreSHvKXWOlZYlqJPbN-1yjKT0A_3Zu4Xm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#f3f4ee]/90 via-[#f3f4ee]/20 to-transparent" />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between p-9">
              <div>
                <div className="inline-flex items-center rounded-full bg-[#dafe92] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#476303]">
                  The Digital Sanctuary
                </div>
              </div>

              <div className="max-w-[320px] space-y-5">
                <h2 className="text-[32px] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#30332e]">
                  A collaborative architecture built for focus.
                </h2>
                <p className="text-sm leading-6 text-[#5c605a]">
                  Calm, structured, and human-centered. For once, a workspace
                  that does not look like it was designed during a caffeine
                  emergency.
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex -space-x-3">
                    <img
                      alt="Team member"
                      className="h-9 w-9 rounded-full border-2 border-white object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCumnFHkl45142JlHc8IX8WnI6saNEt9Us5awvcWw0MgwCiV0onlXtufYk8CkoAZ2hM9bPJxMOqWWDgmsZa-zosUPbhNbK6uEFDaf4IIitBn8hy3grBcyg75KHrbvLP2vlGC5TTwTqf4cUeLGQQNt7O4dovAF0Ejwfokxdu02U7vhtvITK7hjtCxY-lIU4KDIPgTPzbtdVLpksQvvxQBpzpjFL2dHtM78pzjKTz9vRRkoVeU1OOTMmK4or8CazxZW7Vtb-hVAiPSwnA"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      alt="Team member"
                      className="h-9 w-9 rounded-full border-2 border-white object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6erUsJr7YWZRcvo_XmnZ92in6IJ1fMjaKKT8kW2ctPLok0LxvMd_Js2AgAjPHLKmS4qvj66aa2QkA2RnGQq-gGYgnnt1rHPRC1I1skJCPZdOhhk4HPKYwhXeYf4goSqywdLc28zSAZEUdHzNqvRtRLATJH4qSSiIltewD8EiRYN2bw27-rZqxMSdwTpZZWbmv3taakWMElSIPxHmimzj-q7uRK21n-clQfT90uFe5ii8cHk33TkIgAxaECbNp3kajQMmsslpfzd4Y"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      alt="Team member"
                      className="h-9 w-9 rounded-full border-2 border-white object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj-60otKgLZCz5WjHrFCLR_6TdrJxc9dd68OevOYaaW1JGcK5foU0kmenZbqAhxIQPSEZYWY_RwZ1FW9esG5npSH7YcRVunHUhSmN8cqFqPFEHqK2-B0aFTqwq3zGhvsBdWveuXM5yRe50GzxXq6JfyDXvL2GJ9uzK2PuMcD6LTfwTtVeRzkjxDb54YUKuRNt8WyFPfr3s_E53m3NYEEi8bEFHr2RIQ2NQtIb3obvtOca4p6egv_NCdKRhNJJ4hFA2GoiykRWFsNGu"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-xs font-medium text-[#5c605a]">
                    +400 teams joined today
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Right form */}
          <section className="flex items-center justify-center bg-[#ffffff] px-6 py-8 sm:px-8 lg:px-10">
            <div className="w-full max-w-[360px] space-y-8">
              <div className="flex items-center justify-between">
                <Link href="/" className="inline-flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#4e45e4] to-[#bdbaff]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                      <rect width="64" height="64" rx="16" fill="#4e45e4" />
                      <text
                        x="32"
                        y="40"
                        textAnchor="middle"
                        fontSize="30"
                        fontWeight="700"
                        fill="white"
                        fontFamily="Arial, sans-serif"
                      >
                        T
                      </text>
                      <circle cx="49" cy="16" r="4" fill="white" />
                      <circle
                        cx="53"
                        cy="30"
                        r="3"
                        fill="white"
                        opacity="0.75"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[22px] font-bold tracking-[-0.03em] text-[#30332e]">
                      TeamSpace
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[#787c75]">
                      Workspace access
                    </div>
                  </div>
                </Link>

                <div className="hidden sm:block [&_button]:h-10 [&_button]:rounded-full [&_button]:bg-[#4e45e4] [&_button]:px-4 [&_button]:text-xs [&_button]:font-semibold [&_button]:text-[#fbf7ff]">
                  <SignUpDialog />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-[30px] font-extrabold tracking-[-0.04em] text-[#30332e]">
                  Welcome back
                </h1>
                <p className="text-sm leading-6 text-[#5c605a]">
                  Enter your details to return to your sanctuary.
                </p>
              </div>

              <form
                id="email-form"
                className="space-y-5"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="space-y-4">
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <label className="mb-2 flex items-center gap-2 px-1 text-sm font-medium text-[#5c605a]">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </label>
                        <div className="relative">
                          <Input
                            {...field}
                            type="email"
                            placeholder="name@company.com"
                            className="h-12 rounded-xl border-none bg-[#e0e4dc] px-4 text-sm text-[#30332e] placeholder:text-[#787c75] shadow-none transition-all duration-300 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#4e45e4]/20"
                          />

                          {fieldState.invalid && (
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500">
                              {fieldState.error?.message}
                            </div>
                          )}
                        </div>
                      </Field>
                    )}
                  />

                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <div className="mb-2 flex items-center justify-between px-1">
                          <label className="flex items-center gap-2 text-sm font-medium text-[#5c605a]">
                            <Lock className="h-4 w-4" />
                            Password
                          </label>
                          <span className="text-xs font-semibold text-[#4e45e4]">
                            Forgot Password?
                          </span>
                        </div>
                        <div className="relative">
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            className="h-12 rounded-xl border-none bg-[#e0e4dc] px-4 pr-24 text-sm"
                          />

                          {fieldState.invalid && (
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500">
                              {fieldState.error?.message}
                            </div>
                          )}
                        </div>
                      </Field>
                    )}
                  />
                </div>

                <Field>
                  <div className="rounded-2xl bg-[#f3f4ee] px-2 pt-4">
                    <div className="flex items-center justify-center pt-2">
                      <TurnstileWidget
                        onVerify={setToken}
                        handleSubmitError={setSubmitError}
                      />
                    </div>
                    <div className="flex justify-center min-h-[30px]">
                      {submitError && (
                        <div className="pt-0.5 flex justify-center pb-2">
                          <FieldError errors={[{ message: submitError }]} />
                        </div>
                      )}
                    </div>
                  </div>
                </Field>

                <Button
                  type="submit"
                  disabled={!token || isSubmitting}
                  className="h-12 w-full rounded-2xl border-0 bg-[#4e45e4] text-sm font-bold text-[#fbf7ff] shadow-[0_12px_24px_rgba(78,69,228,0.18)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2">
                    {isSubmitting ? 'Logging...' : 'Login to Sanctuary'}
                    {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                  </span>
                </Button>

                <div className="relative flex items-center py-1">
                  <div className="flex-1 border-t border-[#b0b3ac]/30" />
                  <span className="px-4 text-[10px] uppercase tracking-[0.18em] text-[#787c75]">
                    Or continue with
                  </span>
                  <div className="flex-1 border-t border-[#b0b3ac]/30" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border border-transparent bg-[#f3f4ee] text-sm font-semibold text-[#30332e] hover:border-[#b0b3ac]/30 hover:bg-[#e7e9e2]"
                  >
                    Google
                  </Button>

                  <div className="[&_button]:h-11 [&_button]:w-full [&_button]:rounded-xl [&_button]:border [&_button]:border-transparent [&_button]:bg-[#f3f4ee] [&_button]:text-sm [&_button]:font-semibold [&_button]:text-[#30332e] hover:[&_button]:border-[#b0b3ac]/30 hover:[&_button]:bg-[#e7e9e2]">
                    <SignUpDialog />
                  </div>
                </div>

                <p className="pt-1 text-center text-sm text-[#5c605a] sm:hidden">
                  Don&apos;t have an account?{' '}
                  <span className="font-semibold text-[#4e45e4]">Sign up</span>
                </p>
              </form>

              <footer className="flex items-center justify-between border-t border-[#b0b3ac]/20 pt-5">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#787c75]">
                  © 2024 TeamSpace
                </span>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-[#787c75]">
                  <span>Privacy</span>
                  <span>Terms</span>
                </div>
              </footer>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
