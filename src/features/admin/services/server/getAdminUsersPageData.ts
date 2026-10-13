import { adminApi } from '@/utils/server-api';
import { parseAdminUsersQuery } from '../../utils/admin-users-query';

type TSearchParams = Record<string, string | string[] | undefined>;

export async function getAdminUsersPageData(params: TSearchParams) {
  const query = parseAdminUsersQuery(params);
  const page = await adminApi.users.list(query);

  return { query, page };
}
