# Sentry

## The switch rule

**The DSN says *where* events go. It never says *whether*.** Capture is
controlled by two dedicated variables, resolved in `src/libs/sentry-config.ts`:

| Variable | Runtime | Notes |
|---|---|---|
| `SENTRY_ENABLED` | server / edge | Server-only. Must not become `NEXT_PUBLIC_` — it must not exist in the browser bundle. |
| `NEXT_PUBLIC_SENTRY_ENABLED` | browser | The only switch that can reach the browser. |
| `NEXT_PUBLIC_SENTRY_DSN` | both | Destination only. |

Only the exact string `true` enables capture. This is not a truthiness check —
the previous `NEXT_PUBLIC_SENTRY_DISABLED` flag was, which made `=false` and
`=0` both mean *disabled*.

A switch turned on with no DSN warns once on startup and stays disabled. That
combination is a misconfiguration, not an off state: the SDK would initialise
and then silently discard every event.

`Sentry.init` is called **unconditionally**, with the decision carried by the
`enabled` option. Never wrap it in an `if` — skipping the call means the SDK's
async-context isolation never installs, so scope behaviour differs between
enabled and disabled builds in a way that only surfaces in production.

## Scrubbing

- Server `beforeSend` rebuilds the event from a **named allowlist**. Never
  convert this to a denylist: a denylist leaks whatever field the next SDK
  version starts attaching.
- Browser `beforeSend` deletes `event.user` outright.
- Query strings are stripped everywhere, in every environment. They carry
  Supabase OAuth `code`/`state` and signed asset URLs.
- `beforeBreadcrumb` drops `ui.input` (form values) and `console` breadcrumbs.
- Console forwarding is `warn` and `error` only.
- The request path is a **context**, never a tag. Tags are cardinality-limited.

## Free-plan constraints

5,000 errors/month, no spike protection. `tracesSampleRate` is `0` on both
runtimes and session replay is removed. Revisit only if the plan changes.

## Configuration lives in exactly two files

`src/instrumentation.ts` (server + edge) and `src/instrumentation-client.ts`
(browser). There are no root-level `sentry.*.config.ts` files — those are a
pre-Next-15 pattern and were deleted. Do not let `npx @sentry/wizard` put them
back.

The tunnel is the built-in `tunnelRoute: '/monitoring'` in `next.config.ts`.
`src/proxy.ts` already excludes `monitoring` from its middleware matcher; if
that matcher is ever edited, keep the exclusion or browser error reporting
breaks silently behind ad-blockers.
