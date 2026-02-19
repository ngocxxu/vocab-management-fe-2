import { getPlans } from '@/actions/plans';
import HomePageClient from '@/components/landing/HomePageClient';

export default async function HomePage() {
  const plans = await getPlans();
  return <HomePageClient initialPlans={plans} />;
}
