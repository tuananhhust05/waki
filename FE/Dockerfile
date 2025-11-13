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
RUN npm run build -- --configuration production

# Production stage - Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist/waki-frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
