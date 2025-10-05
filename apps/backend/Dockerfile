FROM node:22.12.0-alpine3.21 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps --ignore-scripts

COPY . .

RUN npx nx build backend --prod

FROM node:22.12.0-alpine3.21 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist/apps/backend ./dist/apps/backend
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force && \
    rm -rf /root/.npm /tmp/* && \
    mkdir -p logs && \
    chown -R node:node /app

EXPOSE 3000

USER node

CMD ["node", "dist/apps/backend/main.js"]
