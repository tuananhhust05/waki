FROM node:22-alpine

WORKDIR /app

# Clear npm cache and update npm
RUN npm cache clean --force && npm install -g npm@latest

# Copy package.json first (ignore package-lock.json if it has issues)
COPY package.json ./

# Install Angular CLI globally
RUN npm install -g @angular/cli@17

# Install dependencies - let npm resolve versions fresh
# This will regenerate package-lock.json if needed
RUN npm install --legacy-peer-deps || (rm -f package-lock.json && npm install --legacy-peer-deps)

COPY . .

EXPOSE 4200

CMD ["npm", "start"]


