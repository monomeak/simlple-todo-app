# syntax=docker/dockerfile:1.7
#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f apps/web/Dockerfile .
# (docker-compose.yml is already set up this way.)

FROM node:20-alpine AS base
RUN corepack enable

# ---- 1. Prune the workspace down to only what the web app needs ----
FROM base AS pruner
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx turbo prune todoweb --docker

# ---- 2. Install pruned deps, then build ----
FROM base AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# Values baked in at build time end up in the client bundle, so only
# pass truly public config here; runtime secrets belong in `environment:`.
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm turbo run build --filter=todoweb

# ---- 3. Production runtime (Next.js standalone output) ----
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 -G nodejs nextjs

WORKDIR /app/apps/web

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 4000

CMD ["node", "apps/web/server.js"]
