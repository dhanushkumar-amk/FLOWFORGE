# FlowForge

[![CI](https://github.com/dhanushkumar-amk/FLOWFORGE/actions/workflows/ci.yml/badge.svg)](https://github.com/dhanushkumar-amk/FLOWFORGE/actions/workflows/ci.yml)
![Node 20](https://img.shields.io/badge/node-20.x-339933?logo=node.js&logoColor=white)
![pnpm workspace](https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white)

FlowForge is organized as a `pnpm` monorepo so the web app, API, and shared packages can evolve together from a single workspace.

## Workspace Layout

```text
.
|-- apps
|   |-- api
|   `-- web
|-- packages
|   `-- shared
|-- eslint.config.mjs
|-- package.json
|-- pnpm-workspace.yaml
|-- tsconfig.base.json
`-- turbo.json
```

## Included In Phase 1

- `pnpm` workspaces for `apps/web`, `apps/api`, and `packages/shared`
- shared TypeScript base config with `@flowforge/shared` path aliases
- root ESLint and Prettier configuration shared across the repo
- starter `.env.example` files for the web and API apps
- Turbo scripts for `dev`, `build`, `lint`, and `typecheck`

## CI Pipeline

- GitHub Actions runs `lint`, `typecheck`, `test`, and `build` on pushes to `main` and on pull requests.
- `actions/cache` caches the pnpm store to speed up dependency restores between runs.
- The recommended branch protection rules for `main` live in `.github/branch-protection-main.json`.

### Branch Protection

The repository should protect `main` with required pull requests, required status checks, and conversation resolution. The ruleset payload in `.github/branch-protection-main.json` is ready to apply with GitHub admin access.

## Docker Dev Setup

- `apps/api/Dockerfile` provides multi-stage `dev`, `build`, and `production` targets for the Express API.
- `docker-compose.yml` starts `mongo`, `redis`, and `api` together for local development.
- The `api` service mounts the repo into `/workspace` and keeps container `node_modules` in a named volume so `tsx watch` can hot-reload without host dependency conflicts.
- Start the stack with `docker compose up --build`.

## MongoDB Setup

- The API reads MongoDB connection details from `MONGODB_URI`.
- For local Docker development, Compose points the API to the local Mongo container.
- For Atlas, keep the real connection string in a local `.env` file or your shell environment and run `pnpm --filter @flowforge/api seed` to load sample data.

## Clerk Backend Auth

- The API loads Clerk with `clerkMiddleware()` and protects `/api/*` routes with `requireAuth()`.
- `/api/auth/me` returns the authenticated Clerk session details, including the extracted `userId`.
- Set `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, and `CLERK_SIGN_IN_URL` in `apps/api/.env` before using protected routes.

## Clerk Frontend Auth

- `apps/web` now uses Next.js App Router with `ClerkProvider` at the root layout.
- Dedicated Clerk-hosted routes are mounted at `/sign-in` and `/sign-up`.
- The dashboard is protected in App Router server components via `auth()`.
- The dashboard navbar includes `UserButton` and `OrganizationSwitcher`.

## Getting Started

1. Install dependencies with `pnpm install`.
2. Copy the example environment files as needed for local development.
3. Start the workspace in watch mode with `pnpm dev`.

## Commands

- `pnpm dev` runs every package's development script through Turbo.
- `pnpm build` runs builds across the workspace.
- `pnpm lint` runs ESLint across all packages.
- `pnpm typecheck` runs TypeScript checks across all packages.
- `pnpm format` formats the repo with Prettier.

## Notes

This Phase 1 setup stays intentionally framework-light. The `web` and `api` apps are minimal TypeScript entry points so future phases can layer in the chosen frontend and backend frameworks without reworking the workspace foundation.
