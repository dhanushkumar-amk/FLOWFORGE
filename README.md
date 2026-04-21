# FlowForge

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
