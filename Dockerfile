# Dockerfile for Full-stack YouTube Client (GlassTube)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build frontend and compile backend server
RUN npm run build

# Production image stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package.json and dist artifacts
COPY package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/vps/stats || exit 1

# Start production Express + Vite CommonJS server
CMD ["node", "dist/server.cjs"]
