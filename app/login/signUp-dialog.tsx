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
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signupFn } from '@/lib/api/auth';
import { useState } from 'react';

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
      // 가입 직후 로그인 상태를 만들었다면 관련 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ['me'] });
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
        <Button variant="outline" type="button">
          👤 Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white text-black border-gray-200 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800">
        <form id="signUp-form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Sign Up</DialogTitle>
            <DialogDescription>
              Sign up with only the minimum information.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email-signup">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email-signup"
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
            </Field>

            <Field>
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password-signup">password</FieldLabel>
                    <Input
                      {...field}
                      id="password-signup"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your PassWord"
                      autoComplete="off"
                      type="password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </Field>

            <Field>
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword-signup">
                      confirmPassword
                    </FieldLabel>
                    <Input
                      {...field}
                      id="confirmPassword-signup"
                      aria-invalid={fieldState.invalid}
                      placeholder="confirmPassword"
                      autoComplete="off"
                      type="password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </Field>

            <Field>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name-signup">NickName</FieldLabel>
                    <Input
                      {...field}
                      id="name-signup"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your NickName"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? '가입 중...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
