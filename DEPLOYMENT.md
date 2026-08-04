# Deployment

Two supported paths, for different reasons — this isn't "pick one," it's "know which one applies."

## Recommendation

**Use Vercel as the primary deployment target.** This is a stock Next.js App Router app with no exotic runtime needs — no headless browser, no native binaries, no persistent local filesystem (report PDFs are generated on-demand and streamed, never written to disk). Vercel is built for exactly this and needs effectively zero configuration.

**Keep the Docker image as a self-hosting fallback, not a second production target.** The reason to have it at all: URUU's stated audience is African governments and critical infrastructure operators (see `SPEC.md`). A security/compliance platform sold into that market will, at some point, hit a client whose data-sovereignty policy rules out hosting on a US-based PaaS — they'll want it running in their own data center or a specific in-country cloud region. That's what the Dockerfile is for: the same image runs anywhere a container can run (a VPS, Kubernetes, Fly.io, in-country cloud) with no code changes, just different env vars.

Vercel does **not** run your Dockerfile — it has its own build pipeline for Next.js. `output: 'standalone'` in `next.config.js` is there for Docker; Vercel's platform ignores it safely, so one config serves both.

---

## Vercel

1. Import the repo in the Vercel dashboard (or `vercel link` via CLI).
2. Set environment variables in the project settings — everything currently in `.env`:
   `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL` (your production URL), `NEXTAUTH_SECRET`, `CLAUDE_API_KEY`. (`JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`/`NEXT_PUBLIC_SUPABASE_*`/`ML_SIDECAR_URL`/`DEFAULT_TENANT_ID` are dead config from earlier in this build — don't bother carrying them over.)
3. Build command and output are auto-detected — no `vercel.json` needed.
4. **Before the first deploy**, apply migrations against the production database from your machine (Vercel's build step doesn't do this automatically, and shouldn't — you don't want a migration racing a cold-started build):
   ```bash
   DATABASE_URL=... DIRECT_URL=... npx prisma migrate deploy
   ```
   `do.ps1` does this for local/manual builds; wire the same `prisma migrate deploy` into CI ahead of `vercel deploy` if you want it automated.
5. **Function region**: defaults to `iad1` (Washington, D.C.). Vercel does have an Africa region — `cpt1` (Cape Town) — which would cut latency for African end users, but your Supabase database is in `eu-west-1` (Dublin, matches Vercel's `dub1`). Nearly every request here hits the database, so function-to-database latency likely dominates over function-to-user latency. Don't default to `cpt1` without thinking it through — either keep functions near the database (`dub1`) or, if African latency matters more for your actual traffic, move both the function region *and* consider whether Supabase offers a region closer to South Africa. This is a real tradeoff, not a default I'd set blindly.

## Docker

```bash
docker compose build
docker compose up -d
```

Reads env vars from `.env` in the project root (`docker-compose.yml`'s `env_file`) — same file used for local dev, nothing extra to configure.

**Migrations are a separate, explicit step — never automatic on container start.** Baking `prisma migrate deploy` into the container's startup command is a real footgun the moment you run more than one replica: multiple containers starting simultaneously would race to apply the same migration. Run it once, manually or in your deploy pipeline, before scaling up:

```bash
docker compose run --rm app npx prisma migrate deploy
```

**Image size note:** the Dockerfile copies `node_modules/.prisma` and `node_modules/@prisma` into the final stage explicitly — Next's standalone-output file tracing doesn't reliably catch Prisma's query engine binary since it's loaded dynamically at runtime, not via static `import`/`require` analysis. This is a well-known gotcha, not a guess; if you ever see `Cannot find module '.prisma/client'` at container start, that copy step is what's missing.

**Verified end-to-end**: `docker compose build && docker compose up -d` has been run for real — the container starts, serves `/` and `/auth/login` (200), and a credentials sign-in attempt reaches Prisma/Supabase and returns a clean 401 rather than crashing. Two gotchas surfaced and are now baked into the Dockerfile:
- `node:20-slim` ships with no libssl at all, so Prisma's engine (and anything else needing OpenSSL, see below) can't load until `apt-get install -y openssl` runs in the image.
- Next's standalone-output file tracing only follows static `import`/`require` calls. Any dependency that loads a native binary dynamically at runtime — Prisma's query engine, `argon2`'s native addon — gets its JS wrapper traced into `.next/standalone` but not the actual binary, and needs an explicit `COPY --from=builder /app/node_modules/<pkg>` in the runner stage. If a future dependency throws `MODULE_NOT_FOUND` or "no native build was found" only inside the container, check this first.
