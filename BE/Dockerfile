FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including devDependencies for nodemon)
RUN npm install

COPY . .

EXPOSE 3301

# Use nodemon in development mode for auto-reload with polling enabled
CMD ["npm", "run", "dev"]


