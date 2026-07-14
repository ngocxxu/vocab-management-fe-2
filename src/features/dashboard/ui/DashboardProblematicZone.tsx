import { ProblematicVocabsTable } from '@/components/dashboard/cards/ProblematicVocabsTable';
import { ZoneError } from '../components/ZoneError';
import { getDashboardProblematicData } from '../services/server/getDashboardProblematicData';
import { getExpiredSessionRedirect, isUnauthorizedError } from '@/utils/auth-error';
import { redirect } from 'next/navigation';

export async function DashboardProblematicZone() {
  try {
    const { languages, itemsByLang } = await getDashboardProblematicData();
    return <ProblematicVocabsTable languages={languages} itemsByLang={itemsByLang} />;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      redirect(getExpiredSessionRedirect('/dashboard'));
    }
    return <ZoneError sectionName="problematic words" />;
  }
}
