FROM node:20-bookworm-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate
RUN pnpm build
RUN pnpm prune --prod

FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=build /app/generated ./generated

EXPOSE 3000

USER node

CMD ["node", "dist/src/main.js"]
