import type { Metadata } from 'next';

type IPortfolioDetailProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Array.from(Array.from({ length: 6 }).keys()).map(elt => ({
    slug: `${elt}`,
  }));
}

export async function generateMetadata(props: IPortfolioDetailProps): Promise<Metadata> {
  const { slug } = await props.params;

  return {
    title: `Portfolio ${slug}`,
    description: `Portfolio ${slug} description`,
  };
}

export default async function PortfolioDetail(props: IPortfolioDetailProps) {
  const { slug } = await props.params;

  return (
    <>
      <h1 className="capitalize">
        Portfolio
        {slug}
      </h1>
      <p>Created a set of promotional materials and branding elements for a corporate event. Crafted a visually unified theme, encompassing a logo, posters, banners, and digital assets. Integrated the client's brand identity while infusing it with a contemporary and innovative approach.</p>
    </>
  );
};

export const dynamicParams = false;
