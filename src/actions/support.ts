'use server';

import { Resend } from 'resend';
import { supportSchema } from '@/libs/validations/support';
import type { TSupportFormData } from '@/libs/validations/support';
import { requireAuth } from './auth';
import { toActionError } from './utils';

const SUPPORT_TO = 'ngocquach97@gmail.com';

const SUPPORT_FROM = 'support@mail.ngocquach.com';

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(key);
}

export async function sendSupportEmail(data: TSupportFormData): Promise<{ messageId?: string }> {
  await requireAuth();

  const parsed = supportSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid form data');
  }

  const { category, subject, message, email } = parsed.data;

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: SUPPORT_FROM,
      to: SUPPORT_TO,
      replyTo: email,
      subject: `[${category}] ${subject}`,
      text: `From: ${email}\nCategory: ${category}\n\n${message}`,
      html: `<h2>Support Request — ${category}</h2><p><strong>From:</strong> ${email}</p><p><strong>Subject:</strong> ${subject}</p><hr /><p>${message.replace(/\n/g, '<br />')}</p>`,
    });
    return { messageId: result.data?.id };
  } catch (error) {
    throw toActionError(error, 'Failed to send support email');
  }
}
