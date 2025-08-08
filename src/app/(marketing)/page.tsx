import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js Boilerplate Presentation',
  description: 'Next js Boilerplate is the perfect starter code for your project. Build your React application with the Next.js framework.',
};

export default async function Index() {
  return <div>Hello</div>;
}
