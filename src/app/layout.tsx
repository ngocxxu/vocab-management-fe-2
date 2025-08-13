import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/global.css';

export default async function RootLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
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
