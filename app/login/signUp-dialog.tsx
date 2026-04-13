import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signupFn } from '@/lib/api/auth';
import { useState } from 'react';
import { Loader2, Mail, LockKeyhole, UserRound } from 'lucide-react';

export type signUpFormValues = z.infer<typeof signUpSchema>;

const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email addres '),
    password: z.string().min(8, 'at least 8 characters '),
    confirmPassword: z.string().min(8, 'at least 8 characters'),
    name: z
      .string()
      .min(2, 'Nickname must be at least 2 characters')
      .max(20, 'Nickname can be down to 20 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Only Can English'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export function SignUpDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<signUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  const mutation = useMutation({
    mutationFn: signupFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['signUp'] });
      form.reset();
      toast.success('Your registration has been completed.', {
        position: 'top-center',
      });
      setOpen(false);
    },
  });

  function onSubmit(values: signUpFormValues) {
    console.log(values);
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className="h-10 rounded-xl border-zinc-200 bg-white px-4 font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <UserRound className="mr-2 h-4 w-4" />
          Sign Up
        </Button>
      </DialogTrigger>

      <DialogContent className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 text-black shadow-2xl sm:max-w-[460px] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
        <form id="signUp-form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
              <UserRound className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
            </div>

            <DialogTitle className="text-xl font-semibold tracking-tight">
              Create your account
            </DialogTitle>

            <DialogDescription className="pt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Start with the basics. Just a few details and you are in.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5">
            <FieldGroup className="space-y-4">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-2"
                  >
                    <FieldLabel
                      htmlFor="email-signup"
                      className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                    >
                      Email
                    </FieldLabel>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        {...field}
                        id="email-signup"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter your email"
                        autoComplete="off"
                        className="h-11 rounded-xl border-zinc-200 pl-10 shadow-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:ring-zinc-700"
                      />
                    </div>

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
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-2"
                  >
                    <FieldLabel
                      htmlFor="password-signup"
                      className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                    >
                      Password
                    </FieldLabel>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        {...field}
                        id="password-signup"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter your password"
                        autoComplete="off"
                        type="password"
                        className="h-11 rounded-xl border-zinc-200 pl-10 shadow-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:ring-zinc-700"
                      />
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-2"
                  >
                    <FieldLabel
                      htmlFor="confirmPassword-signup"
                      className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                    >
                      Confirm password
                    </FieldLabel>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        {...field}
                        id="confirmPassword-signup"
                        aria-invalid={fieldState.invalid}
                        placeholder="Re-enter your password"
                        autoComplete="off"
                        type="password"
                        className="h-11 rounded-xl border-zinc-200 pl-10 shadow-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:ring-zinc-700"
                      />
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-2"
                  >
                    <FieldLabel
                      htmlFor="name-signup"
                      className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                    >
                      Nickname
                    </FieldLabel>

                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        {...field}
                        id="name-signup"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter your nickname"
                        autoComplete="off"
                        className="h-11 rounded-xl border-zinc-200 pl-10 shadow-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:ring-zinc-700"
                      />
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>

          <DialogFooter className="border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="h-10 rounded-xl border-zinc-200 px-4 dark:border-zinc-800"
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="h-10 rounded-xl px-4 font-medium"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing up...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
