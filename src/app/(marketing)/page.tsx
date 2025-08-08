import type { Metadata } from 'next';
import { Sponsors } from '@/components/Sponsors';

export const metadata: Metadata = {
  title: 'Next.js Boilerplate Presentation',
  description: 'Next js Boilerplate is the perfect starter code for your project. Build your React application with the Next.js framework.',
};

export default async function Index() {
  return (
    <>
      <p>
        {`Follow `}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://twitter.com/ixartz"
          target="_blank"
          rel="noreferrer noopener"
        >
          @Ixartz on Twitter
        </a>
        {` for updates and more information about the boilerplate.`}
      </p>
      <h2 className="mt-5 text-2xl font-bold">
        Boilerplate Code for Your Next.js Project with Tailwind CSS
      </h2>
      <p className="text-base">
        Next.js Boilerplate is a developer-friendly starter code for Next.js projects, built with Tailwind CSS and TypeScript.
        {' '}
        <span role="img" aria-label="zap">
          ⚡️
        </span>
        {' '}
        Designed with developer experience in mind, it includes:
      </p>
      <ul className="mt-3 text-base">
        <li>🚀 Next.js with App Router support</li>
        <li>🔥 TypeScript for type checking</li>
        <li>💎 Tailwind CSS integration</li>

        <li>🔴 Form handling (React Hook Form) and validation (Zod)</li>
        <li>📏 Linting and formatting (ESLint, Prettier)</li>
        <li>🦊 Git hooks and commit linting (Husky, Commitlint)</li>
        <li>🦺 Testing suite (Vitest, React Testing Library, Playwright)</li>

        <li>
          🚨 Error monitoring (
          <a
            className="font-bold text-blue-700 hover:border-b-2 hover:border-blue-700"
            href="https://sentry.io/for/nextjs/?utm_source=github&amp;utm_medium=paid-community&amp;utm_campaign=general-fy25q1-nextjs&amp;utm_content=github-banner-nextjsboilerplate-logo"
          >
            Sentry
          </a>
          ) and logging (LogTape, an alternative to Pino.js)
        </li>

        <li>
          🔐 Security and bot protection (
          <a
            className="font-bold text-blue-700 hover:border-b-2 hover:border-blue-700"
            href="https://launch.arcjet.com/Q6eLbRE"
          >
            Arcjet
          </a>
          )
        </li>
        <li>🤖 SEO optimization (metadata, JSON-LD, Open Graph tags)</li>
        <li>⚙️ Development tools (VSCode config, bundler analyzer, changelog generation)</li>
      </ul>
      <p className="text-base">
        Our sponsors&apos; exceptional support has made this project possible.
        Their services integrate seamlessly with the boilerplate, and we
        recommend trying them out.
      </p>
      <h2 className="mt-5 text-2xl font-bold">Sponsors</h2>
      <Sponsors />
    </>
  );
};
