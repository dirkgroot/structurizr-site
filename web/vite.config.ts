import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Serves the workspace JSON produced by `cargo run -- generate` so the SPA's
// fetch('./workspace.json') works during dev.
function workspaceJson(): Plugin {
  const file = path.resolve(import.meta.dirname, '../build/workspace.json')
  return {
    name: 'serve-workspace-json',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/workspace.json') return next()
        fs.readFile(file, (err, data) => {
          if (err) {
            res.statusCode = 404
            res.end(
              'workspace.json not found; run: cargo run -- generate --workspace example/workspace.dsl --output build',
            )
            return
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [workspaceJson(), react(), tailwindcss()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
