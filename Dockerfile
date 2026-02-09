# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the SvelteKit application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# $env/static/public vars must exist at build time for Vite to inline them
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG PUBLIC_APP_URL
RUN npm run build
RUN npm prune --omit=dev

# Stage 3: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
EXPOSE 3000
USER appuser
CMD ["node", "build"]
