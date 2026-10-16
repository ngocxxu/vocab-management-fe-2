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

// Runs one statement through the BE's compose postgres, with values passed as psql variables (never
// interpolated into the SQL). The statement must report exactly the expected tag.
function runStatement(statement: string, variables: Record<string, string>, expectedTag: string): void {
  const database = e2eDatabase();
  const variableArgs = Object.entries(variables).flatMap(([key, value]) => ['-v', `${key}=${value}`]);
  const output = execFileSync(
    'docker',
    ['compose', 'exec', '-T', 'postgres', 'psql', '-v', 'ON_ERROR_STOP=1', ...variableArgs, '-U', database.user, '-d', database.name],
    {
      cwd: BE_DIR,
      input: `${statement}\n`,
      encoding: 'utf8',
    },
  );

  if (!output.includes(expectedTag)) {
    throw new Error(`Expected "${expectedTag}" from psql, got: ${output.trim()}`);
  }
}

// Gives a signed-in user the ADMIN role. The role is read from the database on every request, so the
// session needs no re-login after this.
export function promoteToAdmin(email: string): void {
  runStatement('UPDATE "user" SET role = \'ADMIN\' WHERE email = :\'email\';', { email }, 'UPDATE 1');
}

// Inserts a MEMBER with no Auth0 identity and no supabase id, so the admin delete path has nothing external to clean up.
export function insertMemberRow(user: { email: string; firstName: string; lastName: string }): void {
  runStatement(
    `INSERT INTO "user" (id, email, first_name, last_name, role, is_active, email_confirmed, created_at, updated_at)
     VALUES (gen_random_uuid()::text, :'email', :'firstName', :'lastName', 'MEMBER', true, true, now(), now());`,
    { email: user.email, firstName: user.firstName, lastName: user.lastName },
    'INSERT 0 1',
  );
}
