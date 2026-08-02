# syntax=docker/dockerfile:1.7
#
# Build context MUST be the monorepo root, e.g.:
#   docker build -f apps/api/Dockerfile .
# (docker-compose.yml is already set up this way.)

FROM node:20-alpine AS base
RUN corepack enable
ENV CI=true

# ---- 1. Prune the workspace down to only what the api needs ----
FROM base AS pruner
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx turbo prune todoapi --docker

# ---- 2. Production-only dependencies (kept separate from devDependencies
#         used to build, so the runtime image never carries typescript etc.) ----
FROM base AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY --from=pruner /app/out/json/ .
RUN pnpm install --prod --frozen-lockfile

# ---- 3. Full install + build (TypeScript -> dist/) ----
FROM base AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=todoapi

# ---- 4. Production runtime ----
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 -G nodejs expressjs

WORKDIR /app/apps/api

COPY --from=deps --chown=expressjs:nodejs /app/node_modules /app/node_modules
COPY --from=deps --chown=expressjs:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/package.json ./package.json
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/dist ./dist
# src/ is kept at runtime because src/swagger.ts globs *.ts route files
# (relative to process.cwd()) to build the Swagger/OpenAPI docs.
COPY --from=builder --chown=expressjs:nodejs /app/apps/api/src ./src

USER expressjs
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
