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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signupFn } from '@/lib/api/auth';
import { useState } from 'react';
import { Loader2, Mail, LockKeyhole, UserRound } from 'lucide-react';

const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    name: z
      .string()
      .min(2, 'Nickname must be at least 2 characters')
      .max(20, 'Nickname can be up to 20 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Only English letters and numbers are allowed'),
    privacyAccepted: z.boolean().refine((value) => value === true, {
      message: 'Please agree to the Privacy Policy',
    }),
    termsAccepted: z.boolean().refine((value) => value === true, {
      message: 'Please agree to the Terms of Service',
    }),
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

export type signUpFormValues = z.infer<typeof signUpSchema>;

type SignUpApiPayload = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
};

export function SignUpDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<signUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      privacyAccepted: false,
      termsAccepted: false,
    },
  });

  const privacyAccepted = form.watch('privacyAccepted');
  const termsAccepted = form.watch('termsAccepted');

  const mutation = useMutation({
    mutationFn: async (values: SignUpApiPayload) => signupFn(values),
    onSuccess: async () => {
      form.reset();
      toast.success('Your registration has been completed.', {
        position: 'top-center',
      });
      setOpen(false);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';

      toast.error(message, {
        position: 'top-center',
      });
    },
  });

  function onSubmit(values: signUpFormValues) {
    const { email, password, confirmPassword, name } = values;

    mutation.mutate({
      email,
      password,
      confirmPassword,
      name,
    });
  }

  const isCreateButtonDisabled =
    !form.formState.isValid ||
    !privacyAccepted ||
    !termsAccepted ||
    mutation.isPending;

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

      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-0 text-black shadow-2xl sm:max-w-[500px] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
        <form id="signUp-form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
              <UserRound className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
            </div>

            <DialogTitle className="text-xl font-semibold tracking-tight">
              Create your account
            </DialogTitle>

            <DialogDescription className="pt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              This is a personal portfolio demo. Please do not enter sensitive
              or important information.
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
                        autoComplete="email"
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
                        autoComplete="new-password"
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
                        autoComplete="new-password"
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
                        autoComplete="nickname"
                        className="h-11 rounded-xl border-zinc-200 pl-10 shadow-none placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:ring-zinc-700"
                      />
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem
                    value="privacy-policy"
                    className="border-zinc-200 dark:border-zinc-800"
                  >
                    <AccordionTrigger className="text-left text-sm font-semibold text-zinc-800 hover:no-underline dark:text-zinc-100">
                      Privacy Policy
                    </AccordionTrigger>

                    <AccordionContent className="space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      <p>
                        This service is a personal portfolio project and is
                        provided only for demonstration and testing purposes.
                      </p>

                      <p>
                        The service collects your email address, password,
                        nickname, access logs, IP address, and basic service
                        usage records.
                      </p>

                      <p>
                        The collected information is used to provide account
                        registration, login, user-specific documents, workspace
                        storage, error checking, abuse prevention, and security
                        responses.
                      </p>

                      <p>
                        Your email address is used only as a login identifier.
                        This service does not verify ownership of the email
                        address, and the operator does not guarantee that the
                        entered email address belongs to the actual user.
                      </p>

                      <p>
                        Your password is not stored in plain text. It is stored
                        using a one-way encrypted hash.
                      </p>

                      <p>
                        Account information is kept until you request account
                        deletion or until the service is discontinued. To
                        request deletion of your account or personal
                        information, please contact the service operator.
                      </p>

                      <p>
                        Please do not enter sensitive personal information,
                        passwords, API keys, financial information, confidential
                        business information, or other important private data
                        into this service.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="terms-of-service"
                    className="border-zinc-200 dark:border-zinc-800"
                  >
                    <AccordionTrigger className="text-left text-sm font-semibold text-zinc-800 hover:no-underline dark:text-zinc-100">
                      Terms of Service
                    </AccordionTrigger>

                    <AccordionContent className="space-y-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      <p>
                        This service is provided as a personal portfolio and
                        demo project. It is not a commercial, official, or
                        production-grade productivity service.
                      </p>

                      <p>
                        The service may be changed, interrupted, reset, or
                        discontinued without prior notice. Important data should
                        not be stored in this service.
                      </p>

                      <p>
                        Users must not use another person&apos;s email address,
                        enter false information, infringe the rights of others,
                        or store illegal, harmful, or unauthorized content.
                      </p>

                      <p>
                        Since email ownership is not verified, the email address
                        entered during sign-up is treated only as a login
                        identifier and not as verified identity information.
                      </p>

                      <p>
                        The operator may restrict, delete, or suspend accounts
                        or data if abuse, security risks, unauthorized use,
                        rights infringement, or violation of these terms is
                        suspected.
                      </p>

                      <p>
                        The operator is not responsible for damages caused by
                        service interruption, data loss, user mistakes, or
                        misuse of the service, except in cases of intentional
                        misconduct or gross negligence.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="space-y-3 pt-1">
                  <Controller
                    name="privacyAccepted"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-2"
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="privacyAccepted"
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                            className="mt-0.5"
                          />

                          <FieldLabel
                            htmlFor="privacyAccepted"
                            className="cursor-pointer text-sm leading-5 text-zinc-700 dark:text-zinc-300"
                          >
                            I have read and agree to the Privacy Policy.
                          </FieldLabel>
                        </div>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="termsAccepted"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-2"
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="termsAccepted"
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                            className="mt-0.5"
                          />

                          <FieldLabel
                            htmlFor="termsAccepted"
                            className="cursor-pointer text-sm leading-5 text-zinc-700 dark:text-zinc-300"
                          >
                            I have read and agree to the Terms of Service.
                          </FieldLabel>
                        </div>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            </FieldGroup>
          </div>

          <DialogFooter className="border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  disabled={mutation.isPending}
                  className="h-10 rounded-xl border-zinc-200 px-4 dark:border-zinc-800"
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={isCreateButtonDisabled}
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
