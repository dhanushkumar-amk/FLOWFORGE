FROM node:20-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /workspace

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS dev

COPY . .

EXPOSE 4000

CMD ["pnpm", "--filter", "@flowforge/api", "dev"]

FROM deps AS build

COPY . .

RUN pnpm --filter @flowforge/shared build
RUN pnpm --filter @flowforge/api build

FROM base AS production

ENV NODE_ENV=production

COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=build /workspace/apps/api/dist ./apps/api/dist
COPY --from=build /workspace/apps/api/package.json ./apps/api/package.json
COPY --from=build /workspace/packages/shared/dist ./packages/shared/dist
COPY --from=build /workspace/packages/shared/package.json ./packages/shared/package.json

WORKDIR /workspace/apps/api

EXPOSE 4000

CMD ["node", "dist/index.js"]
