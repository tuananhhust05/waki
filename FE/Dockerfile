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

# Production stage - Serve static files
FROM node:22-alpine

WORKDIR /app

# Install serve package globally
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/dist/waki-frontend/browser ./dist

EXPOSE 4200

# Serve static files on all interfaces
CMD ["serve", "-s", "dist", "-l", "4200", "--no-clipboard", "--no-open"]
