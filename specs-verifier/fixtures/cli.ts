import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

import type { Sandbox } from "./sandbox.ts";
import type { Workspace } from "./workspace.ts";

const execFileAsync = promisify(execFile);

const DEBUG_BINARY = path.resolve(import.meta.dirname, "../../cli/target/debug/structurizr-site");

/** Locates the CLI binary: STRUCTURIZR_SITE_BIN, or the cargo debug build. */
export function resolveBinary(): string {
  if (process.env.STRUCTURIZR_SITE_BIN) return process.env.STRUCTURIZR_SITE_BIN;
  if (!fs.existsSync(DEBUG_BINARY)) {
    throw new Error(
      `structurizr-site binary not found at ${DEBUG_BINARY}.\n` +
        "Build it with `pnpm --dir specs build`, or point STRUCTURIZR_SITE_BIN at another build.",
    );
  }
  return DEBUG_BINARY;
}

/** A run argument: a flag or value as a user types it, or a workspace to run against. */
type CliArg = string | Workspace;

/** Harness-only run options, passed as a trailing object; everything else is argv. */
interface RunOptions {
  /** Shell script that stands in for `structurizr` on the CLI's PATH (unix only). */
  structurizr?: string;
}

function isWorkspace(arg: unknown): arg is Workspace {
  return typeof arg === "object" && arg !== null && "file" in arg && "content" in arg;
}

function isRunOptions(arg: unknown): arg is RunOptions {
  return typeof arg === "object" && arg !== null && "structurizr" in arg;
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
    return this.exitCode === 0;
  }

  /** Content of a file the run wrote, relative to the working directory. */
  file(file: string): string {
    const target = path.resolve(this.cwd, file);
    if (!fs.existsSync(target)) {
      throw new Error(`no such file: ${file} (looked in ${this.cwd})`);
    }
    return fs.readFileSync(target, "utf8");
  }

  /** Parsed content of a JSON file the run wrote, relative to the working directory. */
  json<T = unknown>(file: string): T {
    const content = this.file(file);
    try {
      return JSON.parse(content) as T;
    } catch (cause) {
      throw new Error(`${file} is not valid JSON`, { cause });
    }
  }

  exists(file: string): boolean {
    return fs.existsSync(path.resolve(this.cwd, file));
  }
}

/**
 * A `structurizr-site` run against the real binary, in the sandbox. Args are
 * exactly what a user types: `cli.run("generate", "--workspace", acme)`.
 */
export class StructurizrSiteCli {
  private shims = 0;

  constructor(
    private readonly binary: string,
    private readonly sandbox: Sandbox,
  ) {}

  /** Runs the binary in the sandbox; `Workspace` args become files written there. */
  async run(...args: Array<CliArg | RunOptions>): Promise<CliResult> {
    const options: RunOptions = isRunOptions(args[args.length - 1]) ? (args.pop() as RunOptions) : {};
    const argv: string[] = [];
    for (const arg of args) {
      if (typeof arg === "string") argv.push(arg);
      else if (isWorkspace(arg)) argv.push(await this.sandbox.write(arg.file, arg.content));
      else
        throw new TypeError(
          `invalid CLI argument: ${JSON.stringify(arg)}; ` +
            "expected a string, a Workspace, or a trailing { structurizr } options object",
        );
    }
    const env: NodeJS.ProcessEnv = { ...process.env };
    if (options.structurizr !== undefined) {
      const shimDir = await this.installStructurizrShim(options.structurizr);
      env.PATH = `${shimDir}:${env.PATH ?? ""}`;
    }
    return runCli({ binary: this.binary, cwd: this.sandbox.path, args: argv, env });
  }

  /** Installs a fake `structurizr` and returns its directory (prepended to PATH). */
  private async installStructurizrShim(script: string): Promise<string> {
    this.shims += 1;
    const dir = path.join(this.sandbox.path, `.structurizr-shim-${this.shims}`);
    await fs.promises.mkdir(dir);
    await fs.promises.writeFile(path.join(dir, "structurizr"), script, {
      mode: 0o755,
    });
    return dir;
  }
}

export interface RunCliOptions {
  binary: string;
  /** Working directory of the run; output paths resolve against it. */
  cwd: string;
  /** Full argv, including the subcommand, e.g. `["generate", "--workspace", "acme.dsl"]`. */
  args: string[];
  env?: NodeJS.ProcessEnv;
}

/** Runs the binary with the given argv; shared by the CLI fixture and the site cache. */
export async function runCli(options: RunCliOptions): Promise<CliResult> {
  try {
    const { stdout, stderr } = await execFileAsync(options.binary, options.args, {
      cwd: options.cwd,
      env: options.env,
      timeout: 60_000,
    });
    return new CliResult(0, stdout, stderr, options.cwd);
  } catch (cause) {
    const error = cause as NodeJS.ErrnoException & {
      code?: number | string;
      killed?: boolean;
      stdout?: string;
      stderr?: string;
    };
    if (error.code === "ENOENT") {
      throw new Error(`failed to run ${options.binary}; is it built?`);
    }
    const exitCode = typeof error.code === "number" ? error.code : error.killed ? 124 : 1;
    return new CliResult(exitCode, error.stdout ?? "", error.stderr ?? "", options.cwd);
  }
}
