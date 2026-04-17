# FlowForge

Monorepo scaffold for the FlowForge real-time DAG workflow orchestration platform.

## Workspace Layout

- `apps/frontend` for the Next.js application
- `apps/backend` for the Express API
- `packages/shared-types` for shared TypeScript types
- `packages/config` for shared constants and config

## Scripts

- `npm run dev` runs all app development servers through Turborepo
- `npm run build` runs builds across the workspace
- `npm run lint` runs lint tasks across the workspace

## Status

Phase 1 monorepo setup is complete. App and package implementations will be added in later phases.
