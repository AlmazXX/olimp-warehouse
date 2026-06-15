FROM node:22-slim AS build

RUN corepack enable

WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY libs/contracts ./libs/contracts
COPY frontend ./frontend

RUN pnpm install --frozen-lockfile

ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_BANK_ID=1

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL VITE_BANK_ID=$VITE_BANK_ID

RUN pnpm --filter @olipm/contracts build && pnpm --filter @olipm/frontend build

FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/frontend/dist /usr/share/nginx/html

EXPOSE 80