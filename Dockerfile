# syntax=docker/dockerfile:1

# ---- deps: install dependencies only (cached separately from source changes) ----
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# `npm ci` runs the `postinstall` script (`prisma generate`), which needs the
# schema present even in this stage — copy it ahead of the rest of the source.
COPY prisma ./prisma
RUN npm ci

# ---- builder: generate Prisma client and build the Next.js app ----
FROM node:20-slim AS builder
WORKDIR /app
# node:20-slim ships with no libssl at all, so Prisma's own openssl-version
# detection fails and it silently falls back to an openssl-1.1.x engine binary
# that can't load here (Bookworm ships openssl3). Installing openssl fixes
# detection and provides the actual shared library the engine dlopens.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The project has no public/ directory (App Router keeps favicon.ico etc. under
# src/app/) but the runner stage expects one to exist to copy from.
RUN mkdir -p public
# `npm ci` already ran postinstall (`prisma generate`) in the deps stage, but that
# ran against whatever platform built node_modules — regenerate here so the
# query engine binary matches this stage's OS (glibc, matching the runner below).
RUN npx prisma generate
RUN npm run build

# ---- runner: minimal production image ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Same libssl gap as the builder stage — the query engine needs this at runtime too.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Next's standalone output file-tracing doesn't reliably pick up native
# binaries loaded dynamically at runtime rather than via static import
# analysis — copy Prisma's query engine and argon2's native addon explicitly.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/argon2 ./node_modules/argon2

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# All real secrets (DATABASE_URL, NEXTAUTH_SECRET, CLAUDE_API_KEY, etc.) are
# injected at container start (see docker-compose.yml / --env-file), never
# baked into this image — the same image is meant to run in any environment.
CMD ["node", "server.js"]
