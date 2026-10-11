import { z } from 'zod';

// Sign in validation schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.emailRequired')
    .email('validation.invalidEmail'),
  password: z
    .string()
    .min(1, 'validation.passwordRequired')
    .min(6, 'validation.passwordTooShort'),
});

// Sign up validation schema
export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'validation.firstNameRequired')
      .min(2, 'validation.firstNameTooShort'),
    lastName: z
      .string()
      .min(1, 'validation.lastNameRequired')
      .min(2, 'validation.lastNameTooShort'),
    email: z
      .string()
      .min(1, 'validation.emailRequired')
      .email('validation.invalidEmail'),
    phone: z
      .string()
      .optional()
      .refine(
        val => !val || /^\+?[1-9]\d{0,15}$/.test(val.replace(/\s/g, '')),
        'validation.invalidPhone',
      ),
    password: z
      .string()
      .min(1, 'validation.passwordRequired')
      .min(6, 'validation.passwordTooShort'),
    confirmPassword: z
      .string()
      .min(1, 'validation.confirmPasswordRequired'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'validation.passwordsDoNotMatch',
    path: ['confirmPassword'],
  });

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.emailRequired')
    .email('validation.invalidEmail'),
});

// Type exports
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
