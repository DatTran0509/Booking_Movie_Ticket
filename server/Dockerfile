FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g npm@latest && npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
