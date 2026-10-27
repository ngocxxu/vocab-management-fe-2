# Server Actions encryption key

## The error

```
Failed to find Server Action "<id>". This request might be from an older or newer deployment.
```

The browser called a Server Action ID that the running server does not know.

## Cause

Next.js makes a **random** encryption key on every `next build`
(`build/index.js`: "Generate a random encryption key for this build"). The key
encrypts values that Server Actions close over, and Next.js also uses it to make
hashes. So two builds, or two instances that each built their own copy, do not
share it.

Typical triggers:

- A deploy while users still have an old tab open.
- Several instances behind a load balancer that run different builds.
- Dev: Turbopack restarted or rebuilt while a tab stayed open.

## Fix

Set one fixed key and use the same value for every build.

```bash
openssl rand -base64 32
```

| Where | How |
|---|---|
| Local | `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` in `.env` (see `.env.example`) |
| Docker | `ARG`/`ENV` in the `builder` stage of the `Dockerfile` |
| CI | GitHub secret `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, passed as a `build-args` entry in `.github/workflows/deploy.yml` |

Next.js reads the variable at build time and stores it in the build output, so
the runner image does not need it as a runtime variable.

Rules:

- Keep it secret. Treat it like a password. Never use a `NEXT_PUBLIC_` name.
- Do not rotate it casually. Rotating it breaks open tabs once, like a deploy.
- An empty value is safe: Next.js falls back to a random key.

## What it does not fix

A new deploy still changes the build. A tab that was open before the deploy can
still hit this error once. That is normal. A hard reload fixes it.
