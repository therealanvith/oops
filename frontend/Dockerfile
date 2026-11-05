# Stage 1: Build Next.js application using Bun
FROM oven/bun:1.1.34-alpine AS builder
WORKDIR /app

# Accept API base URL during build
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Copy dependency specifications and lockfile
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

# Copy application code and build
COPY . .
RUN bun run build

# Stage 2: Minimal Node.js 22 Alpine runtime for standalone server
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build artifacts from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

