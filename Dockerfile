# Dockerfile.prod (MULTI-STAGE) as per GEMINI.MD rules
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies including devDependencies to build Next.js (Tailwind, TypeScript, etc)
RUN npm ci --legacy-peer-deps

COPY . .
# We need to generate BOTH prisma clients
RUN npx prisma generate
RUN npx prisma generate --schema=prisma/local.prisma
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV production

# Install CLI tools needed for DB management in the container
RUN npm install -g prisma@5.14.0 tsx

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Copy generated local prisma client (standalone needs it if used in server-side components)
COPY --from=builder /app/src/generated ./src/generated
# Copy prisma and scripts directories for maintenance
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
# Copy local.prisma outside /app/prisma (hidden by the rhstudio_data volume)
COPY --from=builder /app/prisma/local.prisma ./local.prisma
# Copy selective node_modules for prisma CLI to work in container
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy schema.prisma (Postgres) outside /app/prisma too, for the same reason as local.prisma:
# /app/prisma is hidden by the rhstudio_data volume at runtime, so a copy left only there
# would be stale (whatever was in the volume when it was first created) on every rebuild.
COPY --from=builder /app/prisma/schema.prisma ./schema.prisma

EXPOSE 3000
ENV PORT 3000
# Ensure both database schemas are up to date, then start the app (use copies outside the volume)
CMD npx prisma db push --schema=./schema.prisma --skip-generate --accept-data-loss 2>&1; npx prisma db push --schema=./local.prisma --skip-generate --accept-data-loss 2>&1; node server.js
