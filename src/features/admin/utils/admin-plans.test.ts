import type { TAdminPlan, TAdminPlanFormValues } from '@/types/admin';
import { describe, expect, it } from 'vitest';
import { getCreatableRoles, joinFeatureLines, splitFeatureLines, toAdminPlanPayload, toPlanFormValues } from './admin-plans';

const makePlan = (overrides: Partial<TAdminPlan> = {}): TAdminPlan => ({
  id: 'plan-guest',
  role: 'GUEST',
  name: 'Guest',
  price: null,
  priceLabel: 'Free',
  limits: { vocabPerDay: 20, languageFolders: 2, subjects: 5, requestsPerMinute: 20 },
  features: ['20 vocabs per day', '2 folders'],
  stripePriceId: null,
  sortOrder: 0,
  isActive: true,
  ...overrides,
});

const makeForm = (overrides: Partial<TAdminPlanFormValues> = {}): TAdminPlanFormValues => ({
  name: '  Member ',
  priceLabel: ' $9.99/mo ',
  price: 9.99,
  limits: { vocabPerDay: -1, languageFolders: -1, subjects: 5 },
  featuresText: 'Unlimited vocabs\n\n  Priority support  \n',
  stripePriceId: ' price_member ',
  sortOrder: 1,
  isActive: true,
  ...overrides,
});

describe('getCreatableRoles', () => {
  it('offers creation only for roles that have no plan yet', () => {
    const plans = [makePlan({ role: 'MEMBER' })];

    expect(getCreatableRoles(plans)).toEqual(['GUEST']);
  });

  it('offers nothing when every role already has a plan', () => {
    const plans = [makePlan({ role: 'ADMIN' }), makePlan({ role: 'MEMBER' }), makePlan({ role: 'GUEST' })];

    expect(getCreatableRoles(plans)).toEqual([]);
  });

  it('offers the member and guest roles when there are no plans, never ADMIN', () => {
    expect(getCreatableRoles([])).toEqual(['MEMBER', 'GUEST']);
  });
});

describe('splitFeatureLines and joinFeatureLines', () => {
  it('trims each line and drops blank ones, so an extra Enter adds no feature', () => {
    expect(splitFeatureLines('  20 vocabs \n\n2 folders \n   \n')).toEqual(['20 vocabs', '2 folders']);
  });

  it('returns no features for an empty text', () => {
    expect(splitFeatureLines('')).toEqual([]);
  });

  it('joins features back into one line each', () => {
    expect(joinFeatureLines(['20 vocabs', '2 folders'])).toBe('20 vocabs\n2 folders');
  });
});

describe('toPlanFormValues', () => {
  it('fills the form from an existing plan', () => {
    expect(toPlanFormValues(makePlan())).toEqual({
      name: 'Guest',
      priceLabel: 'Free',
      price: null,
      limits: { vocabPerDay: 20, languageFolders: 2, subjects: 5 },
      featuresText: '20 vocabs per day\n2 folders',
      stripePriceId: '',
      sortOrder: 0,
      isActive: true,
    });
  });

  it('starts a new plan as active with no price and no limits set', () => {
    expect(toPlanFormValues(undefined)).toEqual({
      name: '',
      priceLabel: '',
      price: null,
      limits: { vocabPerDay: 0, languageFolders: 0, subjects: 0 },
      featuresText: '',
      stripePriceId: '',
      sortOrder: 0,
      isActive: true,
    });
  });
});

describe('toAdminPlanPayload', () => {
  it('trims text fields, splits the features and turns a blank Stripe id into null', () => {
    const payload = toAdminPlanPayload(makeForm({ stripePriceId: '   ' }));

    expect(payload.name).toBe('Member');
    expect(payload.priceLabel).toBe('$9.99/mo');
    expect(payload.features).toEqual(['Unlimited vocabs', 'Priority support']);
    expect(payload.stripePriceId).toBeNull();
  });

  it('keeps the Stripe id when one is entered', () => {
    expect(toAdminPlanPayload(makeForm()).stripePriceId).toBe('price_member');
  });

  it('carries the stored requestsPerMinute over, because the BE replaces the whole limits object', () => {
    const stored = makePlan({ limits: { vocabPerDay: 20, languageFolders: 2, subjects: 5, requestsPerMinute: 60 } });

    const payload = toAdminPlanPayload(makeForm(), stored);

    expect(payload.limits).toEqual({ vocabPerDay: -1, languageFolders: -1, subjects: 5, requestsPerMinute: 60 });
  });

  it('leaves requestsPerMinute out when there is no stored plan, such as a new plan', () => {
    const payload = toAdminPlanPayload(makeForm());

    expect(payload.limits).toEqual({ vocabPerDay: -1, languageFolders: -1, subjects: 5 });
    expect('requestsPerMinute' in payload.limits).toBe(false);
  });
});
