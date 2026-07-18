# Этап 1: установка зависимостей
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm pkg delete scripts.prepare
RUN npm ci --omit=dev

# Этап 2: сборка
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Этап 3: продакшен
FROM node:20-bookworm-slim AS prod
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/locales ./locales

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 80) + '/healthz', r => { if (r.statusCode !== 200) throw r.statusCode })"

CMD ["node", "dist/app/index.js"]
