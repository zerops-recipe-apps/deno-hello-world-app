# deno-hello-world-app

Minimal Deno 2 HTTP server querying a PostgreSQL `greetings` table via `deno.land/x/postgres` and returning a health-check JSON response.

## Zerops service facts

- HTTP port: `8000`
- Siblings: `db` (PostgreSQL) — env: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Runtime base: `deno@2.0.0`

## Zerops dev

`setup: dev` idles on `zsc noop --silent`; the agent starts the dev server.

- Dev command: `deno task dev` (equivalent: `deno run --allow-net --allow-env src/main.ts`)
- In-container rebuild without deploy: `deno compile --allow-net --allow-env --lock deno.lock --output app src/main.ts`

**All platform operations (start/stop/status/logs of the dev server, deploy, env / scaling / storage / domains) go through the Zerops development workflow via `zcp` MCP tools. Don't shell out to `zcli`.**

## Notes

- `DENO_DIR=/var/www/.deno_cache` is baked into the dev runtime env — imports resolve offline from the shipped cache, no downloads from deno.land.
- Migration runs once per deploy via `zsc execOnce` in `initCommands`; schema is ready on SSH.
