import { describe, expect, it } from 'vitest';
import { adminPlanFormSchema, adminUserIdSchema, createAdminPlanSchema, updateAdminPlanSchema, updateAdminUserSchema } from './admin';

const validForm = {
  name: 'Member',
  priceLabel: '$9.99/mo',
  price: 9.99,
  limits: { vocabPerDay: -1, languageFolders: -1, subjects: 5 },
  featuresText: 'Unlimited vocabs',
  stripePriceId: 'price_member',
  sortOrder: 1,
  isActive: true,
};

const validPayload = {
  name: 'Member',
  priceLabel: '$9.99/mo',
  price: 9.99,
  limits: { vocabPerDay: -1, languageFolders: -1, subjects: 5, requestsPerMinute: 60 },
  features: ['Unlimited vocabs'],
  stripePriceId: 'price_member',
  sortOrder: 1,
  isActive: true,
};

describe('updateAdminUserSchema', () => {
  it('accepts a role change', () => {
    expect(updateAdminUserSchema.safeParse({ role: 'MEMBER' }).success).toBe(true);
  });

  it('accepts deactivating, including an explicit false', () => {
    expect(updateAdminUserSchema.safeParse({ isActive: false }).success).toBe(true);
  });

  it('rejects an empty change', () => {
    expect(updateAdminUserSchema.safeParse({}).success).toBe(false);
  });

  it('rejects a role outside the admin role list', () => {
    expect(updateAdminUserSchema.safeParse({ role: 'ROOT' }).success).toBe(false);
  });
});

describe('adminUserIdSchema', () => {
  it('rejects an empty id', () => {
    expect(adminUserIdSchema.safeParse('   ').success).toBe(false);
  });
});

describe('adminPlanFormSchema', () => {
  it('accepts a complete form', () => {
    expect(adminPlanFormSchema.safeParse(validForm).success).toBe(true);
  });

  it.each([-1, 0, 2147483647])('accepts the limit %s (-1 is unlimited)', (vocabPerDay) => {
    const result = adminPlanFormSchema.safeParse({ ...validForm, limits: { ...validForm.limits, vocabPerDay } });

    expect(result.success).toBe(true);
  });

  it.each([-2, 1.5, Number.NaN, 2147483648])('rejects the limit %s', (vocabPerDay) => {
    const result = adminPlanFormSchema.safeParse({ ...validForm, limits: { ...validForm.limits, vocabPerDay } });

    expect(result.success).toBe(false);
  });

  it('rejects a blank name and a blank price label', () => {
    expect(adminPlanFormSchema.safeParse({ ...validForm, name: '   ' }).success).toBe(false);
    expect(adminPlanFormSchema.safeParse({ ...validForm, priceLabel: '' }).success).toBe(false);
  });

  it('accepts a plan with no price, and rejects a negative one', () => {
    expect(adminPlanFormSchema.safeParse({ ...validForm, price: null }).success).toBe(true);
    expect(adminPlanFormSchema.safeParse({ ...validForm, price: -1 }).success).toBe(false);
  });

  it('rejects a negative sort order', () => {
    expect(adminPlanFormSchema.safeParse({ ...validForm, sortOrder: -1 }).success).toBe(false);
  });
});

describe('updateAdminPlanSchema', () => {
  it('accepts a deactivate-only change, including an explicit false', () => {
    expect(updateAdminPlanSchema.safeParse({ isActive: false }).success).toBe(true);
  });

  it('accepts a full payload', () => {
    expect(updateAdminPlanSchema.safeParse(validPayload).success).toBe(true);
  });

  it('rejects an empty change', () => {
    expect(updateAdminPlanSchema.safeParse({}).success).toBe(false);
  });

  it('rejects a limit below -1 inside the payload', () => {
    const result = updateAdminPlanSchema.safeParse({ ...validPayload, limits: { ...validPayload.limits, subjects: -2 } });

    expect(result.success).toBe(false);
  });
});

describe('createAdminPlanSchema', () => {
  it('accepts a payload with a role from the admin role list', () => {
    expect(createAdminPlanSchema.safeParse({ ...validPayload, role: 'GUEST' }).success).toBe(true);
  });

  it('rejects a role outside the admin role list', () => {
    expect(createAdminPlanSchema.safeParse({ ...validPayload, role: 'ROOT' }).success).toBe(false);
  });
});
