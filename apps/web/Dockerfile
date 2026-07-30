FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@11.13.1 --activate
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/design-tokens/package.json packages/design-tokens/package.json
RUN pnpm install --frozen-lockfile
COPY apps/web apps/web
COPY packages/design-tokens packages/design-tokens
RUN pnpm --filter @xanze/web build

FROM nginx:1.29-alpine AS runtime
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html
EXPOSE 80

