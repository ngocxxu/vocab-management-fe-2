// Fails fast when the infra the E2E backend needs is not running.
// The backend webServer command runs this first (see playwright.config.ts).
import net from 'node:net';

const SERVICES = [
  { name: 'postgres', port: 5433 },
  { name: 'redis', port: 6379 },
  { name: 'supabase', port: 54321 },
];

function isUp(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

const down = [];
for (const { name, port } of SERVICES) {
  if (!(await isUp(port))) {
    down.push(`${name} (:${port})`);
  }
}

if (down.length > 0) {
  console.error(`E2E preflight: ${down.join(', ')} is down.`);
  console.error('In vocab-management-be-2 run: docker compose up -d postgres redis && supabase start');
  process.exit(1);
}
