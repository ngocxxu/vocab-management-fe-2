import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const BE_DIR = process.env.E2E_BE_DIR ?? path.resolve(__dirname, '../../vocab-management-be-2');

// Reads the connection string from the BE's env file. Only the user and database name are used here,
// so the password never leaves that file.
function e2eDatabase(): { user: string; name: string } {
  const env = readFileSync(path.join(BE_DIR, '.env.e2e'), 'utf8');
  const line = env.split('\n').find(entry => entry.startsWith('DATABASE_URL='));
  if (!line) {
    throw new Error('DATABASE_URL is missing from the backend .env.e2e');
  }

  const url = new URL(line.slice('DATABASE_URL='.length).replace(/^"|"$/g, ''));
  return { user: decodeURIComponent(url.username), name: url.pathname.slice(1) };
}

// Gives a signed-up user the ADMIN role with a direct UPDATE on the e2e database. Call it before the
// user's first page sign-in, so the session never holds a stale MEMBER or GUEST role.
// The statement runs inside the BE's compose postgres service, so no client dependency is added.
export function promoteToAdmin(email: string): void {
  const database = e2eDatabase();
  const output = execFileSync(
    'docker',
    ['compose', 'exec', '-T', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1', '-v', `email=${email}`, '-U', database.user, '-d', database.name],
    {
      cwd: BE_DIR,
      input: 'UPDATE "user" SET role = \'ADMIN\' WHERE email = :\'email\';\n',
      encoding: 'utf8',
    },
  );

  if (!output.includes('UPDATE 1')) {
    throw new Error(`Expected exactly one user promoted to ADMIN, psql said: ${output.trim()}`);
  }
}
