import { redirect } from 'next/navigation';

// Password reset is part of Auth0 Universal Login ("Forgot password?" on its login screen).
export default function ForgotPasswordPage() {
  redirect('/signin');
}
