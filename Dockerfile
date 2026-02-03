# UPSKILL Content Generation x402 API
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copy built files
COPY --from=builder /app/dist ./dist

# Environment
ENV NODE_ENV=production
ENV PORT=4021

# Expose port
EXPOSE 4021

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4021/health || exit 1

# Run
CMD ["node", "dist/index.js"]
