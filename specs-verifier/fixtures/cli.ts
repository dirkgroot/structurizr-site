import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

import type { Sandbox } from './sandbox.ts'
import type { Workspace } from './workspace.ts'

const execFileAsync = promisify(execFile)

const DEBUG_BINARY = path.resolve(
  import.meta.dirname,
  '../../cli/target/debug/structurizr-site',
)

/** Locates the CLI binary: STRUCTURIZR_SITE_BIN, or the cargo debug build. */
export function resolveBinary(): string {
  if (process.env.STRUCTURIZR_SITE_BIN) return process.env.STRUCTURIZR_SITE_BIN
  if (!fs.existsSync(DEBUG_BINARY)) {
    throw new Error(
      `structurizr-site binary not found at ${DEBUG_BINARY}.\n` +
        'Build it with `pnpm --dir specs build`, or point STRUCTURIZR_SITE_BIN at another build.',
    )
  }
  return DEBUG_BINARY
}

export interface GenerateOptions {
  /** The workspace to generate a site from; written into the sandbox. */
  workspace: Workspace
  /** How page URLs are formed. Omitted options keep the CLI's own defaults. */
  router?: 'hash' | 'path'
  /** Hosting prefix for `--router path`. */
  basePath?: string
  /** Output directory, relative to the sandbox (CLI default: `build`). */
  output?: string
  /** Shell script that stands in for `structurizr` on the CLI's PATH (unix only). */
  structurizr?: string
}

/** One CLI run; specs observe it through `file`, `json`, and `exists`. */
export class CliResult {
  constructor(
    readonly exitCode: number,
    readonly stdout: string,
    readonly stderr: string,
    private readonly cwd: string,
  ) {}

  get ok(): boolean {
    return this.exitCode === 0
  }

  /** Content of a file the run wrote, relative to the working directory. */
  file(file: string): string {
    const target = path.resolve(this.cwd, file)
    if (!fs.existsSync(target)) {
      throw new Error(`no such file: ${file} (looked in ${this.cwd})`)
    }
    return fs.readFileSync(target, 'utf8')
  }

  /** Parsed content of a JSON file the run wrote, relative to the working directory. */
  json<T = unknown>(file: string): T {
    const content = this.file(file)
    try {
      return JSON.parse(content) as T
    } catch (cause) {
      throw new Error(`${file} is not valid JSON`, { cause })
    }
  }

  exists(file: string): boolean {
    return fs.existsSync(path.resolve(this.cwd, file))
  }
}

/** A `structurizr-site generate` run against the real binary, in the sandbox. */
export class StructurizrSiteCli {
  private shims = 0

  constructor(
    private readonly binary: string,
    private readonly sandbox: Sandbox,
  ) {}

  async generate(options: GenerateOptions): Promise<CliResult> {
    const workspacePath = await this.sandbox.write(
      options.workspace.file,
      options.workspace.content,
    )
    const env: NodeJS.ProcessEnv = { ...process.env }
    if (options.structurizr !== undefined) {
      const shimDir = await this.installStructurizrShim(options.structurizr)
      env.PATH = `${shimDir}:${env.PATH ?? ''}`
    }
    return runGenerate({
      binary: this.binary,
      cwd: this.sandbox.path,
      workspacePath,
      output: options.output,
      router: options.router,
      basePath: options.basePath,
      env,
    })
  }

  /** Installs a fake `structurizr` and returns its directory (prepended to PATH). */
  private async installStructurizrShim(script: string): Promise<string> {
    this.shims += 1
    const dir = path.join(this.sandbox.path, `.structurizr-shim-${this.shims}`)
    await fs.promises.mkdir(dir)
    await fs.promises.writeFile(path.join(dir, 'structurizr'), script, { mode: 0o755 })
    return dir
  }
}

export interface RunGenerateOptions {
  binary: string
  /** Working directory of the run; `output` resolves against it. */
  cwd: string
  /** Absolute path of the workspace file. */
  workspacePath: string
  output?: string
  router?: 'hash' | 'path'
  basePath?: string
  env?: NodeJS.ProcessEnv
}

/** Runs one `generate`; shared by the CLI fixture and the site cache. */
export async function runGenerate(options: RunGenerateOptions): Promise<CliResult> {
  const args = ['generate', '--workspace', options.workspacePath]
  if (options.output !== undefined) args.push('--output', options.output)
  if (options.router !== undefined) args.push('--router', options.router)
  if (options.basePath !== undefined) args.push('--base-path', options.basePath)

  try {
    const { stdout, stderr } = await execFileAsync(options.binary, args, {
      cwd: options.cwd,
      env: options.env,
      timeout: 60_000,
    })
    return new CliResult(0, stdout, stderr, options.cwd)
  } catch (cause) {
    const error = cause as NodeJS.ErrnoException & {
      code?: number | string
      killed?: boolean
      stdout?: string
      stderr?: string
    }
    if (error.code === 'ENOENT') {
      throw new Error(`failed to run ${options.binary}; is it built?`)
    }
    const exitCode = typeof error.code === 'number' ? error.code : error.killed ? 124 : 1
    return new CliResult(exitCode, error.stdout ?? '', error.stderr ?? '', options.cwd)
  }
}
