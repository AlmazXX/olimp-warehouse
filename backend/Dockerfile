FROM node:22-slim

RUN corepack enable

WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY libs/contracts ./libs/contracts
COPY backend ./backend

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @olimp/contracts build && pnpm --filter @olimp/backend build

WORKDIR /repo/backend

EXPOSE 8000
CMD ["node", "dist/main.js"]