import { z } from 'zod';

const MAX_EMAIL_LENGTH = 254;

/** A sanity check for forms and actions, not proof that the address exists: the BE and Auth0 decide that. Trims before checking. */
export const emailAddressSchema = z.string().trim().max(MAX_EMAIL_LENGTH).email();
