import { SettingsLayout } from '@/components/settings';
import { subjectsApi } from '@/utils/server-api';

export default async function SettingsPage() {
  try {
    // Fetch subjects data server-side
    const initialSubjectsData = await subjectsApi.getAll();

    return <SettingsLayout initialSubjectsData={initialSubjectsData} />;
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    // Return layout without initial data if fetch fails
    return <SettingsLayout />;
  }
}
