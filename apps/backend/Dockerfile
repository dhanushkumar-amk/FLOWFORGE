FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN npm ci --workspace @flowforge/backend --include-workspace-root=false

FROM deps AS builder

COPY apps/backend/tsconfig.json apps/backend/tsconfig.json
COPY apps/backend/src apps/backend/src

RUN npm run build --workspace @flowforge/backend

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

COPY --from=deps /app/node_modules node_modules
RUN npm prune --omit=dev --workspace @flowforge/backend --include-workspace-root=false \
  && npm cache clean --force

COPY --from=builder /app/apps/backend/dist apps/backend/dist

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["node", "dist/index.js"]
