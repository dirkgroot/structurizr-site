import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { runGenerate } from './cli.ts'

/** Persistent cache of generated sites; git-ignored. */
const CACHE_ROOT = path.resolve(import.meta.dirname, '../.cache/sites')
const WEB_DIST = path.resolve(import.meta.dirname, '../../web/dist')

export interface CachedGenerateOptions {
  binary: string
  /** Absolute path of the workspace file; its content keys the cache. */
  workspacePath: string
  router?: 'hash' | 'path'
  basePath?: string
}

/**
 * Generates a site with the real CLI, reusing the cached copy when nothing
 * that affects the output has changed: workspace content, generate arguments,
 * the SPA bundle under web/dist, and the binary itself. Concurrent runs for
 * the same key each generate into their own staging dir; the first rename wins.
 */
export async function cachedGenerate(options: CachedGenerateOptions): Promise<string> {
  const key = createHash('sha256')
    .update(
      JSON.stringify({
        router: options.router ?? 'hash',
        basePath: options.basePath ?? '/',
        workspace: fs.readFileSync(options.workspacePath, 'utf8'),
        dist: fingerprint(WEB_DIST),
        binary: fingerprintFile(options.binary),
      }),
    )
    .digest('hex')

  const dir = path.join(CACHE_ROOT, key)
  if (fs.existsSync(dir)) return dir

  const staging = `${dir}.${process.pid}-${randomUUID()}.staging`
  fs.mkdirSync(staging, { recursive: true })
  const run = await runGenerate({
    binary: options.binary,
    cwd: staging,
    workspacePath: options.workspacePath,
    output: '.',
    router: options.router,
    basePath: options.basePath,
  })
  if (!run.ok) {
    fs.rmSync(staging, { recursive: true, force: true })
    throw new Error(`generating the site failed:\n${run.stderr || run.stdout}`)
  }
  try {
    fs.renameSync(staging, dir)
  } catch {
    // Another worker generated the same site first; use its copy.
  }
  fs.rmSync(staging, { recursive: true, force: true })
  return dir
}

/** A change-detector for a directory tree: relative path, mtime, and size per file. */
function fingerprint(root: string): string {
  const parts: string[] = []
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(file)
      else parts.push(fingerprintFile(file, root))
    }
  }
  if (fs.existsSync(root)) walk(root)
  else parts.push('missing')
  return parts.sort().join('|')
}

function fingerprintFile(file: string, root = path.dirname(file)): string {
  const stat = fs.statSync(file)
  return `${path.relative(root, file)}:${stat.mtimeMs}:${stat.size}`
}
