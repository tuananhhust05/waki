# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Clear npm cache and update npm
RUN npm cache clean --force && npm install -g npm@latest

# Copy package files
COPY package.json ./

# Install Angular CLI globally
RUN npm install -g @angular/cli@17

# Install dependencies
RUN npm install --legacy-peer-deps || (rm -f package-lock.json && npm install --legacy-peer-deps)

# Copy source code
COPY . .

# Build Angular app for production
RUN npm run build:prod

# Debug: List build output structure
RUN ls -la /app/dist/ && ls -la /app/dist/waki-frontend/ || echo "Directory structure check"

# Production stage - Serve static files
FROM node:22-alpine

WORKDIR /app

# Install serve (supports SPA fallback with -s flag)
RUN npm install -g serve

# Copy built files from builder stage
# Try both possible paths - Angular 17 may output directly to dist/waki-frontend
COPY --from=builder /app/dist/waki-frontend ./dist

EXPOSE 4200

# Serve static files with SPA fallback (all routes -> index.html)
CMD ["serve", "-s", "dist", "-l", "4200", "--cors"]