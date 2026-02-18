import { Lexend } from 'next/font/google';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/global.css';

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});

export const metadata = { title: {
  default: 'Vocab - Intelligence',
  template: '%s | Vocab - Intelligence',
}, icons: {
  icon: '/assets/logo/logo-light-mode.png',
  apple: '/assets/logo/logo-light-mode.png',
} };

export default async function RootLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={lexend.variable}>
      <body suppressHydrationWarning className="font-sans">
        <ThemeProvider>
          <PostHogProvider>
            {props.children}
            <Toaster />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
