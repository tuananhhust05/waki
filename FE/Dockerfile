FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g @angular/cli@17 && npm install

COPY . .

EXPOSE 4200

CMD ["npm", "start"]


