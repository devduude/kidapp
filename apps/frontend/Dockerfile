FROM node:22.12.0-alpine3.21 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps --ignore-scripts

COPY . .

RUN npx nx build frontend --prod

FROM node:22.12.0-alpine3.21 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4200
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 4200

USER node

CMD ["node", "apps/frontend/server.js"]
