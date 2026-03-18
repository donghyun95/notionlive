'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSeparator,
} from '@/components/ui/field';

import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpDialog } from './signUp-dialog';
import { signIn } from 'next-auth/react';
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email addres'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
      // callbackUrl: '/dashboard',
    });

    console.log('signIn: ', result);
    return;
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form id="email-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Welcome to TeamSpace</h1>
          </div>

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email-login">Email</FieldLabel>
                <Input
                  {...field}
                  id="email-login"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your Email"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password-login">password</FieldLabel>
                <Input
                  {...field}
                  id="password-login"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your password"
                  autoComplete="off"
                  type="password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field>
            <Button type="submit" form="email-form">
              Login
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldSeparator>Or</FieldSeparator>

      <Field className="grid gap-4 sm:grid-cols-2">
        <Button variant="outline" type="button">
          Continue with Google
        </Button>
        <SignUpDialog />
      </Field>
    </div>
  );
}
