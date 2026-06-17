# Stage 1: Build & Install dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for node-gyp if any
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# Stage 2: Production environment
FROM node:20-alpine

# Set non-root user
USER node

WORKDIR /home/node/app

# Copy from builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app ./

EXPOSE 5050

# Add a healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5050/health || exit 1

# Start the application
CMD ["npm", "start"]
