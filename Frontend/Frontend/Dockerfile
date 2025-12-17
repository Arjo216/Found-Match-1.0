# ============================
# Stage 1 — Builder
# ============================
FROM node:18-alpine AS builder

# System deps
RUN apk add --no-cache libc6-compat python3 make g++ bash

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Enable pnpm
RUN corepack enable

# Copy manifests
COPY ["Frontend/Frontend/package.json", "Frontend/Frontend/pnpm-lock.yaml", "./"]

# --- NETWORK FIX ---
RUN pnpm config set fetch-retries 10
RUN pnpm config set fetch-retry-mintimeout 20000
RUN pnpm config set fetch-retry-maxtimeout 120000
RUN pnpm config set fetch-timeout 600000

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY ["Frontend/Frontend/", "./"]

# -----------------------------------------------------------
# CRITICAL FIX: Delete ONLY the broken files from the logs.
# We KEEP 'pages/index.tsx' so your Landing Page survives!
# -----------------------------------------------------------
RUN rm -rf \
    pages/dashboard/ \
    pages/onboarding.tsx \
    pages/terms.tsx \
    pages/privacy-policy.tsx \
    pages/500.tsx \
    pages/_offline.tsx \
    src/pages/dashboard/ \
    src/pages/onboarding.tsx \
    src/pages/terms.tsx \
    src/pages/privacy-policy.tsx \
    src/pages/500.tsx \
    src/pages/_offline.tsx

# Build Next.js app
RUN pnpm run build


# ============================
# Stage 2 — Runner
# ============================
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

EXPOSE 3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.* ./

CMD ["pnpm", "start"]