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
# RUN npm run build:prod
RUN npm run build

# Production stage - Serve static files
FROM node:22-alpine

WORKDIR /app

# Install http-server (simpler, no host header checks)
RUN npm install -g http-server

# Copy built files from builder stage
# COPY --from=builder /app/dist/waki-frontend/browser ./dist

EXPOSE 4200

# Serve static files - disable host header check
# CMD ["http-server", "dist", "-p", "4200", "-a", "0.0.0.0", "--cors", "-c-1"]
CMD ["npm", "start"]