# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve the application with NGINX (Unprivileged / Non-root)
FROM nginxinc/nginx-unprivileged:alpine

# Copy custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

# Add a healthcheck for the Nginx server
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
