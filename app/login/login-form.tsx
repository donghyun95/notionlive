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
import { Mail, Lock, ArrowRight } from 'lucide-react';

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
      className={cn(
        'relative min-h-screen overflow-hidden bg-[#f7f9fb] text-[#545f73] selection:bg-[#2563EB]/20',
        className,
      )}
      {...props}
    >
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(37,99,235,0.05)_0%,transparent_40%),radial-gradient(circle_at_90%_80%,rgba(84,95,115,0.05)_0%,transparent_40%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* nav */}
        <nav>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 md:py-5">
            <div className="flex items-center gap-2 font-headline text-xl font-extrabold text-[#545f73]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-[10px] text-white">
                TS
              </span>
              TeamSpace
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <a className="hidden text-xs font-bold text-[#566166] hover:text-[#2563EB] sm:block">
                Features
              </a>
              <a className="hidden text-xs font-bold text-[#566166] hover:text-[#2563EB] sm:block">
                About
              </a>

              <div className="[&_button]:rounded-full [&_button]:bg-[#545f73] [&_button]:px-5 [&_button]:py-2 [&_button]:text-xs [&_button]:text-white">
                <SignUpDialog />
              </div>
            </div>
          </div>
        </nav>

        {/* main */}
        <main className="flex flex-1 items-center justify-center px-4 py-2">
          <div className="flex w-full max-w-[460px] flex-col items-center">
            {/* hero */}
            <div className="mb-5 text-center">
              <h1 className="mb-3 text-2xl font-extrabold text-[#545f73] sm:text-3xl md:text-4xl">
                Welcome to <span className="text-[#2563EB]">TeamSpace</span>
              </h1>
              <p className="text-xs text-[#566166]/80 md:text-sm">
                Access your digital curator and manage your team&apos;s workflow
              </p>
            </div>

            {/* card */}
            <div className="w-full rounded-2xl border border-white/30 bg-white/80 p-4 backdrop-blur-[12px] shadow-[0px_30px_60px_-20px_rgba(42,52,57,0.08)] md:p-5">
              <form
                id="email-form"
                className="space-y-5"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                {/* email */}
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[#566166]">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>

                      <Input
                        {...field}
                        type="email"
                        placeholder="name@company.com"
                        className="h-10 bg-[#f0f4f7]/70 text-xs"
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* password */}
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-[#566166]">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password
                        </div>
                        <span className="text-[#2563EB] text-[10px]">
                          Forgot
                        </span>
                      </div>

                      <Input
                        {...field}
                        type="password"
                        className="h-10 bg-[#f0f4f7]/70 text-xs"
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* captcha */}
                <Field>
                  <TurnstileWidget
                    onVerify={setToken}
                    handleSubmitError={setSubmitError}
                  />
                  {submitError && (
                    <FieldError errors={[{ message: submitError }]} />
                  )}
                </Field>

                {/* login */}
                <Button
                  type="submit"
                  disabled={!token || isSubmitting}
                  className="h-10 w-full text-sm bg-[#2563EB] text-white"
                >
                  {isSubmitting ? 'Logging...' : 'Login'}
                </Button>

                {/* divider */}
                <div className="flex items-center gap-2 text-[8px] text-[#566166]">
                  <div className="flex-1 border-t" />
                  OR
                  <div className="flex-1 border-t" />
                </div>

                {/* actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-9 text-xs">
                    Google
                  </Button>

                  <SignUpDialog />
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* footer */}
        <footer className="py-3 text-center text-[8px] text-[#566166]/50">
          © 2024 TEAMSPACE
        </footer>
      </div>
    </div>
  );
}
