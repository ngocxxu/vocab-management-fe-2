import { describe, expect, it } from 'vitest';
import { forgotPasswordSchema, signInSchema, signUpSchema } from '@/libs/validations/auth';

const validSignUp = {
  firstName: 'Ann',
  lastName: 'Lee',
  email: 'ann@example.com',
  phone: '',
  password: 'secret1',
  confirmPassword: 'secret1',
};

describe('signInSchema', () => {
  it('accepts a valid email and password', () => {
    expect(signInSchema.safeParse({ email: 'a@b.co', password: 'secret1' }).success).toBe(true);
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = signInSchema.safeParse({ email: 'a@b.co', password: 'abc' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Password must be at least 6 characters');
  });

  it('rejects an invalid email', () => {
    expect(signInSchema.safeParse({ email: 'nope', password: 'secret1' }).success).toBe(false);
  });

  it('rejects an empty email with the required message', () => {
    const result = signInSchema.safeParse({ email: '', password: 'secret1' });
    expect(result.error?.issues[0]?.message).toBe('Email is required');
  });
});

describe('signUpSchema', () => {
  it('accepts a valid sign up without a phone', () => {
    expect(signUpSchema.safeParse(validSignUp).success).toBe(true);
    expect(signUpSchema.safeParse({ ...validSignUp, phone: undefined }).success).toBe(true);
  });

  it('puts the password mismatch error on confirmPassword', () => {
    const result = signUpSchema.safeParse({ ...validSignUp, confirmPassword: 'different' });
    expect(result.success).toBe(false);
    const issue = result.error?.issues.find(i => i.message === 'Passwords do not match');
    expect(issue?.path).toEqual(['confirmPassword']);
  });

  it('accepts a phone number with a plus and spaces', () => {
    expect(signUpSchema.safeParse({ ...validSignUp, phone: '+84 912 345 678' }).success).toBe(true);
  });

  it('rejects a non-numeric phone', () => {
    const result = signUpSchema.safeParse({ ...validSignUp, phone: 'abc' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Please enter a valid phone number');
  });

  it('rejects a one-letter first name', () => {
    expect(signUpSchema.safeParse({ ...validSignUp, firstName: 'A' }).success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('requires a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.co' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});
