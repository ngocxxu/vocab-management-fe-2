import type { Viewport } from 'next';
import { Lexend } from 'next/font/google';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
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
}, appleWebApp: {
  capable: true,
  statusBarStyle: 'black-translucent',
  title: 'Vocab',
} };

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fd' },
    { media: '(prefers-color-scheme: dark)', color: '#0b121e' },
  ],
};

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
            <InstallPrompt />
            <ServiceWorkerRegister />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
