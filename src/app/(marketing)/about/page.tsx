import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About page description',
};

export default async function About() {
  return (
    <>
      <p>Welcome to our About page! We are a team of passionate individuals dedicated to creating amazing software.</p>
    </>
  );
};
