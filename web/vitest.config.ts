import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts, whose workspaceJson plugin shells out to the
// `structurizr` CLI and registers dev-server middleware — none of which a
// fetch-mocked test run needs.
export default defineConfig({
  // Pin the root so caches land in web/node_modules even when the command is
  // invoked from the repository root (`pnpm --dir web test`).
  root: import.meta.dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
