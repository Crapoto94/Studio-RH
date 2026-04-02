# Dockerfile.prod (MULTI-STAGE) as per GEMINI.MD rules
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies including devDependencies to build Next.js (Tailwind, TypeScript, etc)
RUN npm ci --legacy-peer-deps

COPY . .
# We need to generate prisma client
RUN npx prisma generate
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
# Copy prisma and scripts directories for maintenance
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
# Copy selective node_modules for prisma CLI to work in container
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
