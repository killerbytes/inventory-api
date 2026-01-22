FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts
RUN npm ci --omit=dev

COPY . .
EXPOSE 8080

CMD ["node", "src/index.js"]

