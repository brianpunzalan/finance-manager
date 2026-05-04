# Quickstart: Core Finance App

**Date**: 2026-05-04

## Prerequisites

- Node.js 20+ and npm 10+
- Chrome (desktop or Android) for running the app

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:5173 (open in Chrome)

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
src/
  client/       → React UI components, pages, hooks
  server/       → Browser API handlers (IndexedDB, Google Drive, PWA)
  store/        → Zustand stores (bridge between client and server)
  shared/       → TypeScript types and service interfaces
  worker/       → Workbox service worker
```

## Adding a Shadcn Component

```bash
npx shadcn@latest add <component-name>
# e.g.: npx shadcn@latest add button dialog form select
```
Components are added to `src/client/components/ui/`.

## IndexedDB Access

Never access `db` directly from React components. Go through a store action:

```typescript
// ✅ Correct — via store
const addTransaction = useTransactionStore(s => s.addTransaction);
await addTransaction(data);

// ❌ Wrong — direct DB access from component
import { db } from '@/server/db';
await db.transactions.add(data);
```

## GitHub Pages Deployment

Every push to `main` triggers `.github/workflows/deploy.yml` which:
1. Runs `npm run build`
2. Deploys `dist/` to the `gh-pages` branch

The `vite.config.ts` `base` option must match the repository sub-path:
```typescript
base: '/finance-manager/'
```

## PWA Notes

- Service worker only activates in production build (`npm run build && npm run preview`)
- PWA install prompt is handled by `src/server/pwa/InstallPrompt.ts`
- Storage persistence request fires on first load via `src/server/pwa/StoragePersistence.ts`

## Google Drive Backup

Requires a Google Cloud project with Drive API enabled and an OAuth 2.0 client ID.
Set the client ID in `.env.local`:
```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```
This value is injected at build time (never at runtime) per Principle VIII.
